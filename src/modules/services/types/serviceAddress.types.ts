export type ServiceAddressLabel = 'Home' | 'Work' | 'Other';

export type ServiceAddress = {
  id: number;
  label: ServiceAddressLabel;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  crmAddressId: number | null;
  checkoutAddressId: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ServiceAddressInput = {
  label: ServiceAddressLabel;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
};

export type ServiceAddressListResponse = {
  success: boolean;
  data: ServiceAddress[];
  message?: string;
};

export type ServiceAddressMutationResponse = {
  success: boolean;
  data: ServiceAddress;
  message?: string;
};
