import { Platform } from 'react-native';
import authApi from '../core/api/authAxiosClient';
import { getCrmEnquiryUserId } from '../core/utils/crmUserSession';
import { getFcmToken } from './notificationService';

export async function registerFcmTokenWithBackend(): Promise<void> {
  const token = await getFcmToken();
  if (!token) {
    return;
  }
  const crmUserId = await getCrmEnquiryUserId();
  await authApi.post('/notifications/fcm-token', {
    token,
    platform: Platform.OS,
    ...(crmUserId != null ? { crm_user_id: crmUserId } : {}),
  });
  if (crmUserId != null) {
    await authApi.post('/notifications/crm-user-id', {
      crm_user_id: crmUserId,
    });
  } else if (__DEV__) {
    // eslint-disable-next-line no-console
    console.warn(
      '[Push] No CRM user id — set CRM_ENQUIRY_USER_ID in .env or log in with CRM id. Backend cannot poll orders for push.',
    );
  }
}

