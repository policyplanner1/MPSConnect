import axios from 'axios';

import {
  getMpsOAuthAuthorizationHeader,
  getMpsOAuthSession,
} from '../../../core/utils/mpsOAuthStorage';
import { ensureMpsOAuthToken } from '../../../services/mpsOAuth.service';
import type { OrderDetailsResponse } from '../types/orderDetails.types';

const CRM_ORDER_DETAILS_BASE_URL = 'https://rewardplanners.com/api/crm/mps/service/order-details';

export async function fetchOrderDetails(
  parentOrderId: string,
  userId: number,
): Promise<OrderDetailsResponse> {
  await ensureMpsOAuthToken();
  const session = await getMpsOAuthSession();
  const authHeader = getMpsOAuthAuthorizationHeader(session);
  if (!authHeader) {
    throw new Error('Please login again to view your request details.');
  }

  const url = `${CRM_ORDER_DETAILS_BASE_URL}/${encodeURIComponent(parentOrderId)}`;

  const response = await axios.get<OrderDetailsResponse>(url, {
    params: { user_id: userId },
    headers: {
      Accept: 'application/json',
      Authorization: authHeader,
    },
    timeout: 20000,
  });

  const body = response.data;
  if (!body?.success) {
    throw new Error('Failed to load order details.');
  }

  return body;
}

