import type { ServiceAddress } from '../types/serviceAddress.types';

export function formatServiceAddressLine(address: ServiceAddress): string {
  const parts = [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.state,
    address.pincode,
  ].filter(Boolean);
  return parts.join(', ');
}

export function getCheckoutAddressId(address: ServiceAddress): number {
  return address.checkoutAddressId;
}
