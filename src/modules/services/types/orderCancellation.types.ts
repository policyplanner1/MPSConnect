export type CancellationReason = {
  reason_id: number;
  reason_text: string;
};

export type CancellationReasonsResponse = {
  success: boolean;
  reasons: CancellationReason[];
};

export type SubmitCancelOrderRequestPayload = {
  user_id: number;
  service_order_id: number;
  reason_id: number;
  comment: string;
};

export type SubmitCancelOrderRequestResponse = {
  success: boolean;
  message?: string;
};

export type CancellationTimelineStep = {
  label: string;
  event: string;
  date: string;
};

export type CancellationDetailsData = {
  service_order_id: number;
  order_ref: string;
  status: string;
  service: {
    service_name: string;
    variant_name: string | null;
    title: string | null;
    image_url: string | null;
  };
  cancellation: {
    status: string;
    refund_status: string;
    refund_method: string;
    refund_amount: number;
    created_at: string;
  };
  timeline: CancellationTimelineStep[];
  refund: {
    total: number;
    money_refund: number;
    coin_refund: number;
  };
  rewards: {
    used: number;
    reversed: number;
  };
  summary: {
    service_total: number;
    order_total: number;
  };
};

export type CancellationDetailsResponse = {
  success: boolean;
  data: CancellationDetailsData;
};

export type OrderCancelContext = {
  serviceOrderId: number;
  serviceName: string;
  variantName?: string | null;
  title?: string | null;
  orderRef?: string | null;
  imageUrl?: string | null;
  rewardCoinsSaved?: number;
};
