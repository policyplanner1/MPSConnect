declare module 'react-native-razorpay' {
  export type RazorpaySuccessResponse = {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  };

  export type RazorpayOptions = {
    key: string;
    amount: number;
    currency?: string;
    name?: string;
    description?: string;
    order_id: string;
    image?: string;
    prefill?: {
      email?: string;
      contact?: string;
      name?: string;
    };
    theme?: { color?: string };
  };

  const RazorpayCheckout: {
    open(options: RazorpayOptions): Promise<RazorpaySuccessResponse>;
  };

  export default RazorpayCheckout;
}

declare module '*.gif' {
  import { ImageSourcePropType } from 'react-native';

  const content: ImageSourcePropType;
  export default content;
}

declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';

  const content: React.FC<SvgProps>;
  export default content;
}

declare module 'react-native-vector-icons/FontAwesome' {
  import { ComponentType } from 'react';

  const Icon: ComponentType<any>;
  export default Icon;
}

declare module 'react-native-vector-icons/MaterialIcons' {
  import { ComponentType } from 'react';

  const Icon: ComponentType<any>;
  export default Icon;
}

declare module '@env' {
  export const API_BASE_URL: string | undefined;
  /** Optional. When set, login/signup and other `/auth/*` calls use this host instead of `API_BASE_URL`. */
  export const AUTH_API_BASE_URL: string | undefined;
  /** Optional. DocVault `/documents/*` on local Node server (default: `AUTH_API_BASE_URL` or `http://<host>:5000/api/v1`). */
  export const DOCUMENTS_API_BASE_URL: string | undefined;
  export const IMAGE_BASE_URL: string | undefined;
  /** MPS client-credentials OAuth (POST …/mps/auth/oauth/token). */
  export const MPS_CLIENT_ID: string | undefined;
  export const CLIENT_SECRET: string | undefined;
  /** Optional full token URL; otherwise derived from `API_BASE_URL` (`/api/crm/v1` → `/api/crm/mps/auth/oauth/token`). */
  export const MPS_OAUTH_TOKEN_URL: string | undefined;
  /** Optional full enquiry URL; default `API_BASE_URL` + `/mps/service-enquiry` (under v1). */
  export const MPS_SERVICE_ENQUIRY_URL: string | undefined;
  /** Optional full cart API base; default `…/api/crm/mps/service/cart`. */
  export const MPS_SERVICE_CART_URL: string | undefined;
  /** Optional full support tickets URL; default `…/api/crm/mps/auth/create-ticket`. */
  export const MPS_SUPPORT_TICKETS_URL: string | undefined;
  /** Optional numeric CRM user id for enquiries (e.g. 1) when local login only returns a cuid. */
  export const CRM_ENQUIRY_USER_ID: string | undefined;
  /** Dev: show service feedback form even when the order is not eligible (`true` / `1`). */
  export const FORCE_SERVICE_FEEDBACK: string | undefined;
}
