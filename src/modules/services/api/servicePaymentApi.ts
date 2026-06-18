import axios from 'axios';
import RazorpayCheckout from 'react-native-razorpay';

import { MPS_SERVICE_BASE_URL } from '../../../config/env';
import { getMpsOAuthAuthorizationHeader, getMpsOAuthSession } from '../../../core/utils/mpsOAuthStorage';
import { ensureMpsOAuthToken } from '../../../services/mpsOAuth.service';
import {
  CheckoutPaymentSuccess,
  PaymentStatusResponse,
  PlaceServiceOrderResponse,
  RazorpayCreateOrderResponse,
  VerifyPaymentPayload,
  VerifyPaymentResponse,
} from '../types/payment.types';

const PLACE_ORDER_URL = `${MPS_SERVICE_BASE_URL}/cart`;
const BUY_NOW_ORDER_URL = `${MPS_SERVICE_BASE_URL}/buy-now`;
const CREATE_ORDER_URL = `${MPS_SERVICE_BASE_URL}/create-order`;
const VERIFY_PAYMENT_URL = `${MPS_SERVICE_BASE_URL}/verify-payment`;
const PAYMENT_STATUS_URL = `${MPS_SERVICE_BASE_URL}/payment-status`;

const PAYMENT_POLL_INTERVAL_MS = 2000;
const PAYMENT_POLL_MAX_ATTEMPTS = 20;

async function mpsServiceHeaders(): Promise<Record<string, string>> {
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

function delay(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export async function placeCartServiceOrder(
  userId: number,
  addressId: number,
): Promise<PlaceServiceOrderResponse['data']> {
  const headers = await mpsServiceHeaders();

  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[ServicePayment] POST place cart', PLACE_ORDER_URL, { user_id: userId, address_id: addressId });
  }

  const response = await axios.post<PlaceServiceOrderResponse>(
    PLACE_ORDER_URL,
    { user_id: userId, address_id: addressId },
    { headers, timeout: 30000 },
  );

  const body = response.data;
  if (!body.success || !body.data?.parent_order_id) {
    throw new Error(body.message || 'Failed to place order.');
  }

  return body.data;
}

/** `POST …/mps/service/buy-now` — single product purchase (from Buy This Now → checkout). */
export async function placeBuyNowServiceOrder(
  userId: number,
  addressId: number,
  serviceId: number,
  variantId: number,
): Promise<PlaceServiceOrderResponse['data']> {
  const headers = await mpsServiceHeaders();

  const payload = {
    user_id: userId,
    address_id: addressId,
    service_id: serviceId,
    variant_id: variantId,
  };

  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[ServicePayment] POST buy-now', BUY_NOW_ORDER_URL, payload);
  }

  const response = await axios.post<PlaceServiceOrderResponse>(BUY_NOW_ORDER_URL, payload, {
    headers,
    timeout: 30000,
  });

  const body = response.data;
  if (!body.success || !body.data?.parent_order_id) {
    throw new Error(body.message || 'Failed to create buy now order.');
  }

  return body.data;
}

export async function createRazorpayServiceOrder(
  userId: number,
  parentOrderId: string,
): Promise<RazorpayCreateOrderResponse['data']> {
  const headers = await mpsServiceHeaders();

  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[ServicePayment] POST create-order', CREATE_ORDER_URL, {
      user_id: userId,
      parent_order_id: parentOrderId,
    });
  }

  const response = await axios.post<RazorpayCreateOrderResponse>(
    CREATE_ORDER_URL,
    { user_id: userId, parent_order_id: parentOrderId },
    { headers, timeout: 30000 },
  );

  const body = response.data;
  if (!body.success || !body.data?.orderId || !body.data?.key) {
    throw new Error(body.message || 'Failed to create payment order.');
  }

  return body.data;
}

export async function verifyServicePayment(
  payload: VerifyPaymentPayload,
): Promise<VerifyPaymentResponse> {
  const headers = await mpsServiceHeaders();

  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[ServicePayment] POST verify-payment', VERIFY_PAYMENT_URL);
  }

  const response = await axios.post<VerifyPaymentResponse>(VERIFY_PAYMENT_URL, payload, {
    headers,
    timeout: 30000,
  });

  return response.data;
}

export async function fetchServicePaymentStatus(
  userId: number,
  parentOrderId: string,
): Promise<PaymentStatusResponse> {
  const headers = await mpsServiceHeaders();

  const response = await axios.get<PaymentStatusResponse>(PAYMENT_STATUS_URL, {
    headers,
    params: { user_id: userId, parent_order_id: parentOrderId },
    timeout: 15000,
  });

  return response.data;
}

function isPaymentConfirmed(statusBody: VerifyPaymentResponse | PaymentStatusResponse): boolean {
  if (!statusBody.success) {
    return false;
  }
  const status = statusBody.data?.status?.toLowerCase();
  if (status === 'paid' || status === 'success') {
    return true;
  }
  if (statusBody.success && status !== 'pending' && !status) {
    return true;
  }
  return Boolean(statusBody.success && statusBody.message?.toLowerCase().includes('successful'));
}

async function pollPaymentUntilConfirmed(
  userId: number,
  parentOrderId: string,
  verifyPayload: VerifyPaymentPayload,
): Promise<CheckoutPaymentSuccess> {
  for (let attempt = 0; attempt < PAYMENT_POLL_MAX_ATTEMPTS; attempt += 1) {
    try {
      const verified = await verifyServicePayment(verifyPayload);
      if (isPaymentConfirmed(verified)) {
        return {
          parentOrderId,
          orderDisplayId: verifyPayload.razorpay_order_id,
          redirectTo: verified.data?.redirect_to,
        };
      }
    } catch {
      // webhook may not be ready yet
    }

    try {
      const status = await fetchServicePaymentStatus(userId, parentOrderId);
      if (isPaymentConfirmed(status)) {
        return {
          parentOrderId,
          orderDisplayId: verifyPayload.razorpay_order_id,
          redirectTo: status.data?.redirect_to,
        };
      }
    } catch {
      // status endpoint optional
    }

    if (attempt < PAYMENT_POLL_MAX_ATTEMPTS - 1) {
      await delay(PAYMENT_POLL_INTERVAL_MS);
    }
  }

  throw new Error(
    'Payment received but confirmation is still pending. Please check your orders in a few minutes.',
  );
}

export async function openRazorpayCheckout(
  razorpayOrder: RazorpayCreateOrderResponse['data'],
  description: string,
): Promise<{
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}> {
  const options = {
    key: razorpayOrder.key,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency || 'INR',
    name: 'MPS Connect',
    description,
    order_id: razorpayOrder.orderId,
    theme: { color: '#5B21B6' },
  };

  try {
    const result = await RazorpayCheckout.open(options);
    return {
      razorpay_payment_id: result.razorpay_payment_id,
      razorpay_order_id: result.razorpay_order_id,
      razorpay_signature: result.razorpay_signature,
    };
  } catch (err: unknown) {
    const code = (err as { code?: number })?.code;
    const descriptionText = (err as { description?: string })?.description;
    if (code === 0 || descriptionText === 'Payment Cancelled') {
      throw new Error('Payment cancelled.');
    }
    throw new Error(descriptionText || 'Payment failed. Please try again.');
  }
}

/**
 * Pay an existing (already created) parent order that is `pending_payment`.
 * This is used from "My requests" → "Pay now" for unfinished payments.
 */
export async function payExistingParentOrder(params: {
  userId: number;
  parentOrderId: string;
  description: string;
}): Promise<CheckoutPaymentSuccess> {
  const razorpayOrder = await createRazorpayServiceOrder(params.userId, params.parentOrderId);
  const payment = await openRazorpayCheckout(razorpayOrder, params.description);
  const verifyPayload: VerifyPaymentPayload = { user_id: params.userId, ...payment };
  return pollPaymentUntilConfirmed(params.userId, params.parentOrderId, verifyPayload);
}

export type RunCheckoutPaymentParams = {
  userId: number;
  addressId: number;
  itemCount: number;
  isBuyNow: boolean;
  buyNowServiceId?: number;
  buyNowVariantId?: number;
  /** When cart checkout has exactly one selected line, uses `POST …/buy-now`. */
  singleCartLine?: { serviceId: number; variantId: number };
  orderLabel: string;
};

export async function runCheckoutPaymentFlow(
  params: RunCheckoutPaymentParams,
): Promise<CheckoutPaymentSuccess> {
  const {
    userId,
    addressId,
    itemCount,
    isBuyNow,
    buyNowServiceId,
    buyNowVariantId,
    singleCartLine,
    orderLabel,
  } = params;

  let placeData: PlaceServiceOrderResponse['data'];

  if (isBuyNow && buyNowServiceId != null && buyNowVariantId != null) {
    placeData = await placeBuyNowServiceOrder(userId, addressId, buyNowServiceId, buyNowVariantId);
  } else if (itemCount > 1) {
    placeData = await placeCartServiceOrder(userId, addressId);
  } else if (singleCartLine) {
    placeData = await placeBuyNowServiceOrder(
      userId,
      addressId,
      singleCartLine.serviceId,
      singleCartLine.variantId,
    );
  } else {
    throw new Error('No items to place order for.');
  }

  const orderRefs = placeData.orders?.map(o => o.order_ref).filter(Boolean) ?? [];
  const orderDisplayId = orderRefs[0] ?? placeData.parent_order_id;

  const razorpayOrder = await createRazorpayServiceOrder(userId, placeData.parent_order_id);

  const paymentResult = await openRazorpayCheckout(razorpayOrder, orderLabel);

  const verifyPayload: VerifyPaymentPayload = {
    user_id: userId,
    razorpay_order_id: paymentResult.razorpay_order_id,
    razorpay_payment_id: paymentResult.razorpay_payment_id,
    razorpay_signature: paymentResult.razorpay_signature,
  };

  const immediate = await verifyServicePayment(verifyPayload);
  if (isPaymentConfirmed(immediate)) {
    return {
      parentOrderId: placeData.parent_order_id,
      orderDisplayId,
      orderRefs,
      redirectTo: immediate.data?.redirect_to,
    };
  }

  await pollPaymentUntilConfirmed(userId, placeData.parent_order_id, verifyPayload);

  return {
    parentOrderId: placeData.parent_order_id,
    orderDisplayId,
    orderRefs,
    redirectTo: immediate.data?.redirect_to,
  };
}

export function getServicePaymentErrorMessage(error: unknown): string {
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
  return 'Payment could not be completed. Please try again.';
}
