export interface Service {
  id: number;
  name: string;
  description: string;
  price: string;
  estimated_days: number;
  service_image: string;
}

export interface ServiceCategory {
  id: number;
  name: string;
  icon: string;
  status: number;
  created_at: string;
  display_type: string;
  direct_service_id: number | null;
  slug: string | null;
}

export interface ServiceByCategoryResponse {
  success: boolean;
  type: string;
  data: {
    category: ServiceCategory;
    services: Service[];
  };
}

export interface ServiceVariant {
  id: number;
  variant_name: string;
  title: string;
  short_description: string;
  price: string;
  original_price: string;
  image_url: string;
  features: string[];
  details: string[];
  trust_stats: string[];
  paragraphs: Array<{ title: string; content: string[] }>;
  when_required: string[];
  journey: Array<{ title: string; content: string[][] }>;
}

export interface ServiceDetailInfo {
  id: number;
  category_id: number;
  name: string;
  description: string;
  service_image: string;
  price: string;
  estimated_days: number;
  rating: string;
  total_orders: number;
  status: number;
  show_enquiry: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  section_type: string | null;
  is_featured: number;
  is_popular: number;
  is_recommended: number;
  category_name: string;
}

export interface ServiceDocument {
  id: number;
  document_name: string;
  is_mandatory: number;
}

export interface EnquiryField {
  label: string;
  field_name: string;
  field_type: string;
  options: string[] | null;
  is_required: number;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ServiceSection {
  section_type: string;
  title: string;
  content: FaqItem[];
}

export interface ServiceDetailsResponse {
  success: boolean;
  data: {
    service: ServiceDetailInfo;
    variants: ServiceVariant[];
    documents: ServiceDocument[];
    enquiry_fields: EnquiryField[];
    service_sections: ServiceSection[];
  };
}
