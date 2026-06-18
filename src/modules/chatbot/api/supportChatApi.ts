import authApiClient from '../../../core/api/authAxiosClient';
import type { ChatbotAction } from '../types/chatbot.types';

export type SupportChatOrderSummary = {
  parentOrderId: string;
  status: string;
  serviceName: string;
  createdAt: string;
};

export type SupportChatResponse = {
  success: boolean;
  intent: string;
  prompt: string;
  answerPrimary: string;
  answerSecondary?: string;
  actions: ChatbotAction[];
  personalized?: boolean;
  foundInDatabase?: boolean;
  order?: SupportChatOrderSummary | null;
};

export type SupportChatHistoryItem = {
  id: string;
  message: string;
  botResponse: string;
  intent: string | null;
  createdAt: string;
};

export async function sendSupportChatMessage(
  message: string,
  responseKey?: string,
): Promise<SupportChatResponse> {
  const response = await authApiClient.post<SupportChatResponse>('/support/chat', {
    message,
    responseKey,
  });

  return response.data;
}

export async function fetchSupportChatHistory(
  limit = 50,
): Promise<SupportChatHistoryItem[]> {
  const response = await authApiClient.get<{
    success: boolean;
    data: SupportChatHistoryItem[];
  }>('/support/history', { params: { limit } });

  return response.data.data ?? [];
}

export function getSupportChatErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const data = (error as { response?: { data?: { message?: string } } }).response?.data;
    if (data?.message) {
      return data.message;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Unable to reach support assistant. Please try again.';
}
