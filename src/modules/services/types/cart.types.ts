import { ServiceDocument } from './service.types';

/** Raw cart line from CRM `GET …/cart/cart-items`. */
export type CartApiIndividualItem = {
  id: number;
  quantity: number;
  price: number;
  bundle_id: number | null;
  service_name: string;
  variant_name: string;
  variant_id: number;
  service_id: number;
  title: string;
  image_url: string | null;
  documents: ServiceDocument[];
};

export type CartItemsApiData = {
  bundles: unknown[];
  individual_items: CartApiIndividualItem[];
  total: number;
};

export type CartItemsApiResponse = {
  success: boolean;
  data: CartItemsApiData;
  message?: string;
};

export type AddCartItemPayload = {
  user_id: number;
  service_id: number;
  variant_id: number;
  quantity: number;
};

export type AddCartItemResponse = {
  success: boolean;
  message?: string;
  data?: unknown;
};

export type RemoveCartItemResponse = {
  success: boolean;
  message: string;
};

/** UI model for cart list (mapped from API). */
export type ServiceCartLineItem = {
  id: string;
  cartItemId: number;
  serviceId: number;
  variantId: number;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  quantity: number;
  serviceName: string;
  variantName: string;
  imageUrl: string | null;
};

export type ServiceCartState = {
  items: ServiceCartLineItem[];
  total: number;
  bundles: unknown[];
};

export type CheckoutSummary = {
  item_total: number;
  discount: number;
  reward_discount: number;
  delivery_fee: number;
  handling_fee: number;
  total: number;
  breakdown: {
    individual_total: number;
    bundle_total: number;
  };
};

/** Line item in `type: "buy_now"` checkout preview. */
export type BuyNowCheckoutItem = {
  service_id: number | string;
  variant_id: number | string;
  service_name: string;
  variant_name: string;
  image_url: string | null;
  title: string;
  price: number;
  quantity: number;
  documents?: ServiceDocument[];
};

export type CheckoutPreviewItem = CartApiIndividualItem | BuyNowCheckoutItem;

export type CheckoutPreviewData = {
  type: string;
  bundles?: unknown[];
  individual_items?: CartApiIndividualItem[];
  items: CheckoutPreviewItem[];
  summary: CheckoutSummary;
  /** Set for buy-now so checkout only shows the line the user tapped. */
  buy_now_target?: {
    service_id: number;
    variant_id: number;
  };
};

export type CheckoutPreviewParams =
  | { userId: number; mode: 'cart' }
  | {
      userId: number;
      mode: 'buy_now';
      serviceId: number;
      variantId: number;
    };

export type CheckoutPreviewApiResponse = {
  success: boolean;
  data: CheckoutPreviewData;
  message?: string;
};
