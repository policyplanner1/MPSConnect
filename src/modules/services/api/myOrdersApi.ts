import axios from 'axios';

import {
  getMpsOAuthAuthorizationHeader,
  getMpsOAuthSession,
} from '../../../core/utils/mpsOAuthStorage';
import { ensureMpsOAuthToken } from '../../../services/mpsOAuth.service';
import type { MyOrdersResponse } from '../types/myOrders.types';

const MY_ORDERS_URL = 'https://rewardplanners.com/api/crm/mps/service/my-orders';

export async function fetchMyOrders(userId: number): Promise<MyOrdersResponse> {
  await ensureMpsOAuthToken();
  const session = await getMpsOAuthSession();
  const authHeader = getMpsOAuthAuthorizationHeader(session);
  if (!authHeader) {
    throw new Error('Please login again to view your requests.');
  }

  const response = await axios.get<MyOrdersResponse>(MY_ORDERS_URL, {
    params: { user_id: userId },
    headers: {
      Accept: 'application/json',
      Authorization: authHeader,
    },
    timeout: 20000,
  });

  const body = response.data;
  if (!body?.success) {
    throw new Error('Failed to load your requests.');
  }

  return body;
}

