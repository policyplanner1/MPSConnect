export type ServiceFeedbackCompletionTime =
  | 'faster than expected'
  | 'on time'
  | 'delayed';

export type ServiceFeedbackConfidence = 'yes, completely' | 'mostly' | 'not really';

export type ServiceFeedbackReuseIntent = 'definitely' | 'maybe' | 'unlikely';

export type SubmitServiceFeedbackPayload = {
  user_id: number;
  service_order_id: number;
  rating: number;
  ease_rating: number;
  expert_rating: number;
  completion_time: ServiceFeedbackCompletionTime;
  confidence: ServiceFeedbackConfidence;
  reuse_intent: ServiceFeedbackReuseIntent;
  comment: string;
};

export type SubmitServiceFeedbackResponse = {
  success: boolean;
  message?: string;
};
