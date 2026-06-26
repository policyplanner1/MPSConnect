export type VaultDocumentCategory = {
  id: string;
  name: string;
  description?: string | null;
};

export type VaultDocumentRecord = {
  id: string;
  title: string;
  description?: string | null;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  tags?: string | null;
  category: VaultDocumentCategory | null;
  createdAt: string;
  updatedAt: string;
};

export type VaultDocumentGlyph =
  | 'passport'
  | 'pan'
  | 'aadhaar'
  | 'license'
  | 'insurance'
  | 'generic';

export type VaultDocumentPresentation = {
  glyph: VaultDocumentGlyph;
  iconBg: string;
  iconColor: string;
};

export type UploadVaultDocumentInput = {
  title?: string;
  description?: string;
  tags?: string;
  file: {
    uri: string;
    name: string;
    type: string;
  };
};

export type UpdateVaultDocumentInput = {
  title?: string;
  description?: string;
  tags?: string;
  file?: {
    uri: string;
    name: string;
    type: string;
  };
};
