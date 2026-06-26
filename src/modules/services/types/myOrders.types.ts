export type MyOrderPreviewItem = {
  type: string;
  name: string;
};

export type MyOrderLineItem = {
  id: number;
  order_ref: string;
  service_name: string;
  variant_name: string | null;
  image_url: string | null;
  price: number;
  bundle_id: number | null;
  status?: string;
};

export type MyOrdersSummary = {
  total_items: number;
  total_bundles: number;
};

export type MyOrdersParentOrder = {
  parent_order_id: string;
  created_at: string;
  status: string;
  total_amount: number;
  items: MyOrderLineItem[];
  bundles: unknown[];
  summary: MyOrdersSummary;
  preview: MyOrderPreviewItem[];
};

export type MyOrdersResponse = {
  success: boolean;
  data: MyOrdersParentOrder[];
};

