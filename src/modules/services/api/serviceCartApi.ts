import axios from 'axios';

import { MPS_SERVICE_CART_URL } from '../../../config/env';
import { getMpsOAuthAuthorizationHeader, getMpsOAuthSession } from '../../../core/utils/mpsOAuthStorage';
import { ensureMpsOAuthToken } from '../../../services/mpsOAuth.service';
import { ServiceDocument } from '../types/service.types';
import {
  AddCartItemPayload,
  AddCartItemResponse,
  CartApiIndividualItem,
  CartItemsApiResponse,
  CheckoutPreviewApiResponse,
  CheckoutPreviewData,
  CheckoutPreviewItem,
  CheckoutPreviewParams,
  BuyNowCheckoutItem,
  RemoveCartItemResponse,
  ServiceCartLineItem,
  ServiceCartState,
} from '../types/cart.types';

const CART_ITEMS_PATH = `${MPS_SERVICE_CART_URL}/cart-items`;
const CART_ADD_ITEM_PATH = `${MPS_SERVICE_CART_URL}/add-item`;
const CHECKOUT_PREVIEW_PATH = `${MPS_SERVICE_CART_URL.replace(/\/cart\/?$/, '')}/checkout-preview`;

function cartItemPath(cartItemId: number): string {
  return `${MPS_SERVICE_CART_URL}/item/${cartItemId}`;
}

async function mpsCartHeaders(): Promise<Record<string, string>> {
  await ensureMpsOAuthToken();
  const session = await getMpsOAuthSession();
  const authHeader = getMpsOAuthAuthorizationHeader(session);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authHeader) {
    headers.Authorization = authHeader;
  }
  return headers;
}

function isCartCheckoutItem(item: CheckoutPreviewItem): item is CartApiIndividualItem {
  return typeof (item as CartApiIndividualItem).id === 'number';
}

/** Normalizes cart + buy_now preview lines for checkout UI. */
export function normalizeCheckoutPreviewItem(item: CheckoutPreviewItem): CartApiIndividualItem {
  if (isCartCheckoutItem(item)) {
    return {
      ...item,
      documents: item.documents ?? [],
    };
  }

  const buy = item as BuyNowCheckoutItem;
  const serviceId = Number(buy.service_id);
  const variantId = Number(buy.variant_id);

  return {
    id: -(serviceId * 10_000 + variantId),
    quantity: buy.quantity,
    price: buy.price,
    bundle_id: null,
    service_name: buy.service_name,
    variant_name: buy.variant_name,
    variant_id: variantId,
    service_id: serviceId,
    title: buy.title,
    image_url: buy.image_url,
    documents: buy.documents ?? [],
  };
}

function itemMatchesServiceVariant(
  item: CheckoutPreviewItem,
  serviceId: number,
  variantId: number,
): boolean {
  const sid = Number((item as BuyNowCheckoutItem).service_id);
  const vid = Number((item as BuyNowCheckoutItem).variant_id);
  return sid === serviceId && vid === variantId;
}

function dedupeCheckoutLines(items: CartApiIndividualItem[]): CartApiIndividualItem[] {
  const seen = new Set<string>();
  const unique: CartApiIndividualItem[] = [];
  for (const item of items) {
    const key = `${item.service_id}-${item.variant_id}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(item);
  }
  return unique;
}

function recalculateCheckoutSummary(
  items: CartApiIndividualItem[],
  preview: CheckoutPreviewData,
): CheckoutPreviewData['summary'] {
  const item_total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const fullItemTotal = preview.summary.item_total > 0 ? preview.summary.item_total : item_total;
  const ratio = fullItemTotal > 0 ? item_total / fullItemTotal : 1;

  const discount = Math.round(preview.summary.discount * ratio);
  const reward_discount = Math.round(preview.summary.reward_discount * ratio);
  const handling_fee = Math.round(preview.summary.handling_fee * ratio);
  const delivery_fee = preview.summary.delivery_fee;
  const total = Math.max(
    0,
    item_total - discount - reward_discount + delivery_fee + handling_fee,
  );

  return {
    item_total,
    discount,
    reward_discount,
    delivery_fee,
    handling_fee,
    total,
    breakdown: {
      individual_total: item_total,
      bundle_total: 0,
    },
  };
}

const EMPTY_CHECKOUT_SUMMARY: CheckoutPreviewData['summary'] = {
  item_total: 0,
  discount: 0,
  reward_discount: 0,
  delivery_fee: 0,
  handling_fee: 0,
  total: 0,
  breakdown: { individual_total: 0, bundle_total: 0 },
};

/**
 * Buy-now preview often includes the full cart in `individual_items`.
 * Keep only the service/variant the user tapped and recalc summary when needed.
 */
export function filterBuyNowCheckoutPreview(
  preview: CheckoutPreviewData,
  serviceId: number,
  variantId: number,
): CheckoutPreviewData {
  const pool: CheckoutPreviewItem[] = [
    ...(preview.items ?? []),
    ...(preview.individual_items ?? []),
  ];

  const filtered = dedupeCheckoutLines(
    pool
      .filter(item => itemMatchesServiceVariant(item, serviceId, variantId))
      .map(normalizeCheckoutPreviewItem),
  );

  const buyNowTarget = { service_id: serviceId, variant_id: variantId };

  if (filtered.length === 0) {
    return {
      type: 'buy_now',
      items: [],
      individual_items: [],
      bundles: preview.bundles ?? [],
      summary: EMPTY_CHECKOUT_SUMMARY,
      buy_now_target: buyNowTarget,
    };
  }

  const poolNormalized = pool.map(normalizeCheckoutPreviewItem);
  const useApiSummary =
    filtered.length === 1 &&
    poolNormalized.length === 1 &&
    poolNormalized[0].service_id === serviceId &&
    poolNormalized[0].variant_id === variantId;

  const summary = useApiSummary
    ? preview.summary
    : recalculateCheckoutSummary(filtered, preview);

  return {
    type: 'buy_now',
    items: filtered,
    individual_items: filtered,
    bundles: preview.bundles ?? [],
    summary,
    buy_now_target: buyNowTarget,
  };
}

export function getCheckoutPreviewItems(data: CheckoutPreviewData): CartApiIndividualItem[] {
  const isBuyNow = data.type === 'buy_now';

  let raw: CheckoutPreviewItem[] =
    data.items.length > 0 ? data.items : (data.individual_items ?? []);

  if (isBuyNow && data.buy_now_target) {
    const { service_id, variant_id } = data.buy_now_target;
    raw = raw.filter(item => itemMatchesServiceVariant(item, service_id, variant_id));
  } else if (isBuyNow) {
    raw = data.items.length > 0 ? data.items : [];
  }

  return dedupeCheckoutLines(raw.map(normalizeCheckoutPreviewItem));
}

export function collectCheckoutDocuments(items: CartApiIndividualItem[]): ServiceDocument[] {
  const seen = new Set<number>();
  const docs: ServiceDocument[] = [];
  for (const item of items) {
    for (const doc of item.documents ?? []) {
      if (!seen.has(doc.id)) {
        seen.add(doc.id);
        docs.push(doc);
      }
    }
  }
  return docs;
}

export function getCheckoutItemKey(item: CartApiIndividualItem): string {
  if (item.id > 0) {
    return String(item.id);
  }
  return `buy-${item.service_id}-${item.variant_id}`;
}

export function mapApiCartItemToLineItem(item: CartApiIndividualItem): ServiceCartLineItem {
  const description = [item.service_name, item.variant_name].filter(Boolean).join(' · ');

  return {
    id: String(item.id),
    cartItemId: item.id,
    serviceId: item.service_id,
    variantId: item.variant_id,
    title: item.title || item.service_name,
    description,
    price: item.price,
    originalPrice: item.price,
    quantity: item.quantity,
    serviceName: item.service_name,
    variantName: item.variant_name,
    imageUrl: item.image_url,
  };
}

export function mapCartApiResponse(data: CartItemsApiResponse['data']): ServiceCartState {
  return {
    items: data.individual_items.map(mapApiCartItemToLineItem),
    total: data.total,
    bundles: data.bundles,
  };
}

export async function fetchServiceCartItems(userId: number): Promise<ServiceCartState> {
  const headers = await mpsCartHeaders();

  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[ServiceCart] GET', CART_ITEMS_PATH, { user_id: userId });
  }

  const response = await axios.get<CartItemsApiResponse>(CART_ITEMS_PATH, {
    headers,
    params: { user_id: userId },
    timeout: 25000,
  });

  const body = response.data;
  if (!body.success) {
    throw new Error(body.message || 'Failed to load cart.');
  }

  return mapCartApiResponse(body.data);
}

export async function addServiceCartItem(
  payload: AddCartItemPayload,
): Promise<AddCartItemResponse> {
  const headers = await mpsCartHeaders();

  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[ServiceCart] POST', CART_ADD_ITEM_PATH, payload);
  }

  const response = await axios.post<AddCartItemResponse>(CART_ADD_ITEM_PATH, payload, {
    headers,
    timeout: 25000,
  });

  const body = response.data;
  if (!body.success) {
    throw new Error(body.message || 'Failed to add item to cart.');
  }

  return body;
}

export async function removeServiceCartItem(
  cartItemId: number,
  userId: number,
): Promise<RemoveCartItemResponse> {
  const headers = await mpsCartHeaders();
  const url = cartItemPath(cartItemId);

  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[ServiceCart] DELETE', url, { user_id: userId });
  }

  const response = await axios.delete<RemoveCartItemResponse>(url, {
    headers,
    params: { user_id: userId },
    timeout: 25000,
  });

  const body = response.data;
  if (!body.success) {
    throw new Error(body.message || 'Failed to remove cart item.');
  }

  return body;
}

export async function fetchCheckoutPreview(
  params: CheckoutPreviewParams,
): Promise<CheckoutPreviewData> {
  const headers = await mpsCartHeaders();

  const query: Record<string, string | number> = { user_id: params.userId };

  if (params.mode === 'cart') {
    query.type = 'cart';
  } else {
    query.type = 'buy_now';
    query.service_id = params.serviceId;
    query.variant_id = params.variantId;
  }

  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[ServiceCart] GET', CHECKOUT_PREVIEW_PATH, query);
  }

  const response = await axios.get<CheckoutPreviewApiResponse>(CHECKOUT_PREVIEW_PATH, {
    headers,
    params: query,
    timeout: 25000,
  });

  const body = response.data;
  if (!body.success) {
    throw new Error(body.message || 'Failed to load checkout preview.');
  }

  const data = body.data;

  if (params.mode === 'buy_now') {
    const merged: CheckoutPreviewData = {
      ...data,
      type: data.type || 'buy_now',
      bundles: data.bundles ?? [],
      individual_items: data.individual_items ?? [],
      items: data.items ?? [],
    };
    return filterBuyNowCheckoutPreview(merged, params.serviceId, params.variantId);
  }

  return {
    ...data,
    type: data.type || 'cart',
    bundles: data.bundles ?? [],
    individual_items: data.individual_items ?? [],
    items: data.items ?? data.individual_items ?? [],
  };
}

export async function fetchCartCheckoutPreview(userId: number): Promise<CheckoutPreviewData> {
  return fetchCheckoutPreview({ userId, mode: 'cart' });
}

export async function fetchBuyNowCheckoutPreview(
  userId: number,
  serviceId: number,
  variantId: number,
): Promise<CheckoutPreviewData> {
  return fetchCheckoutPreview({ userId, mode: 'buy_now', serviceId, variantId });
}

/**
 * Proceed To Buy: keep only cart lines the user selected (API returns full cart).
 * Buy This Now: use API response as-is (single `type: "buy_now"` item).
 */
export function filterCheckoutPreviewForSelection(
  preview: CheckoutPreviewData,
  selectedCartItemIds: number[],
): CheckoutPreviewData {
  if (preview.type === 'buy_now') {
    if (preview.buy_now_target) {
      return filterBuyNowCheckoutPreview(
        preview,
        preview.buy_now_target.service_id,
        preview.buy_now_target.variant_id,
      );
    }
    return preview;
  }

  const idSet = new Set(selectedCartItemIds);
  const filtered = getCheckoutPreviewItems(preview).filter(
    item => item.id > 0 && idSet.has(item.id),
  );

  if (filtered.length === 0) {
    return {
      type: 'cart',
      items: [],
      individual_items: [],
      bundles: [],
      summary: {
        item_total: 0,
        discount: 0,
        reward_discount: 0,
        delivery_fee: 0,
        handling_fee: 0,
        total: 0,
        breakdown: { individual_total: 0, bundle_total: 0 },
      },
    };
  }

  const item_total = filtered.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const fullItemTotal = preview.summary.item_total > 0 ? preview.summary.item_total : item_total;
  const ratio = fullItemTotal > 0 ? item_total / fullItemTotal : 1;

  const discount = Math.round(preview.summary.discount * ratio);
  const reward_discount = Math.round(preview.summary.reward_discount * ratio);
  const handling_fee = Math.round(preview.summary.handling_fee * ratio);
  const delivery_fee = preview.summary.delivery_fee;
  const total = Math.max(
    0,
    item_total - discount - reward_discount + delivery_fee + handling_fee,
  );

  return {
    type: 'cart',
    items: filtered,
    individual_items: filtered,
    bundles: preview.bundles ?? [],
    summary: {
      item_total,
      discount,
      reward_discount,
      delivery_fee,
      handling_fee,
      total,
      breakdown: {
        individual_total: item_total,
        bundle_total: 0,
      },
    },
  };
}

export function getServiceCartErrorMessage(error: unknown): string {
  if (typeof axios.isAxiosError === 'function' && axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined;
    const msg = data?.message ?? data?.error;
    if (typeof msg === 'string' && msg.length > 0) {
      return msg;
    }
    if (error.message) {
      return error.message;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Cart request failed. Please try again.';
}
