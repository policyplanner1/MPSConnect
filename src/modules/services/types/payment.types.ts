export type PlacedOrderLine = {
  id: number;
  order_ref: string;
};

export type PlaceServiceOrderResponse = {
  success: boolean;
  message?: string;
  data: {
    orders: PlacedOrderLine[];
    parent_order_id: string;
  };
};

export type RazorpayCreateOrderResponse = {
  success: boolean;
  message?: string;
  data: {
    key: string;
    orderId: string;
    amount: number;
    currency: string;
    parent_order_id: string;
  };
};

export type VerifyPaymentPayload = {
  user_id: number;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export type VerifyPaymentResponse = {
  success: boolean;
  message?: string;
  data?: {
    redirect_to?: string;
    status?: string;
  };
};

export type PaymentStatusResponse = {
  success: boolean;
  message?: string;
  data?: {
    status?: 'pending' | 'paid' | 'success' | 'failed';
    redirect_to?: string;
  };
};

export type CheckoutPaymentSuccess = {
  parentOrderId: string;
  orderDisplayId: string;
  orderRefs: string[];
  redirectTo?: string;
};
