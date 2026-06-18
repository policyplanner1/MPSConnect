export type SupportCategory = {
  category_id: number;
  name: string;
};

export type SupportCategoriesResponse = {
  success: boolean;
  data: SupportCategory[];
};

export type CreateSupportTicketPayload = {
  user_id: number;
  subject: string;
  description: string;
  category_id: number;
};

export type CreateSupportTicketResponse = {
  success: boolean;
  message: string;
  ticket_id: number;
};
