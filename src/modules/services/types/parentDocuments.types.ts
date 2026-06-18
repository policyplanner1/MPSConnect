export type ParentOrderDocument = {
  document_key: string;
  document_name: string;
  is_mandatory: boolean;
  is_expirable: boolean;
  uploaded: boolean;
  expiry_date: string | null;
  document_number: string | null;
  file_url: string | null;
};

export type ParentDocumentsData = {
  parent_order_id: string;
  can_submit: boolean;
  documents: ParentOrderDocument[];
};

export type ParentDocumentsResponse = {
  success: boolean;
  data: ParentDocumentsData;
};

export type SubmitParentDocumentsPayload = {
  user_id: number;
};

export type SubmitParentDocumentsResponse = {
  status?: boolean;
  success?: boolean;
  message?: string;
};

export type UploadParentDocumentResponse = {
  status?: boolean;
  success?: boolean;
  message?: string;
};

export type LocalDocumentFile = {
  name: string;
  sizeLabel: string;
  uri: string;
  type: string;
};
