export type OrderDetailsTimelineStep = {
  status: string;
  completed: boolean;
};

export type OrderDetailsDocument = {
  service_document_id: number;
  order_document_id: number | null;
  document_name: string;
  document_key: string;
  is_mandatory: boolean;
  is_expirable: boolean;
  uploaded: boolean;
  expiry_date: string | null;
  document_number: string | null;
  file_url: string | null;
};

export type OrderDetailsItem = {
  id: number;
  order_ref: string;
  service_name: string;
  variant_name: string | null;
  title: string | null;
  image_url: string | null;
  price: number;
  status: string;
  documents: OrderDetailsDocument[];
  timeline: OrderDetailsTimelineStep[];
  feedback: {
    can_submit: boolean;
    submitted: boolean;
    data: unknown | null;
  };
  cancellation: {
    can_cancel: boolean;
  };
  refund: unknown | null;
};

export type OrderDetailsSummary = {
  total_services: number;
  completed_services: number;
  total_bundles: number;
};

export type OrderDetailsData = {
  parent_order_id: string;
  created_at: string;
  status: string;
  total_amount: number;
  summary: OrderDetailsSummary;
  timeline: OrderDetailsTimelineStep[];
  items: OrderDetailsItem[];
  bundles: unknown[];
};

export type OrderDetailsResponse = {
  success: boolean;
  data: OrderDetailsData;
};

