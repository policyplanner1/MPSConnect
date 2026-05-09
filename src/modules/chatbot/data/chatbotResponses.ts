import { ChatbotResponseContent } from '../types/chatbot.types';

export const CHATBOT_RESPONSE_MAP: Record<string, ChatbotResponseContent> = {
  application_stuck_in_processing: {
    prompt: 'Application stuck in processing',
    answerPrimary:
      'Your application may remain in processing if it is still under review or awaiting verification from the government department. Processing time can vary depending on the service you applied for.',
    answerSecondary:
      'You can check your latest application status from My services → Track Status in the application.',
    actions: [
      { id: 'check_application_status', label: 'Check Application Status' },
      { id: 'contact_support', label: 'Contact Support' },
    ],
  },
  application_processing_status_check: {
    prompt: 'I want to check why my application is still processing.',
    answerPrimary:
      'Your application may still be processing because the submitted details are under review or pending department verification. This can take more time depending on the service and the current request load.',
    answerSecondary:
      'Please review the latest update in My services → Track Status. If the status has not changed for a long time, contact support from below.',
    actions: [
      { id: 'track_status', label: 'Track Application' },
      { id: 'contact_support', label: 'Contact Support' },
    ],
  },
  delivery_not_delivered: {
    prompt: 'My document was not delivered.',
    answerPrimary:
      'Sorry to hear that your document has not been delivered yet. Sometimes delivery may be delayed due to processing time or courier issues.',
    answerSecondary:
      'Please provide your Application ID or Registered Mobile Number so I can check the delivery status for you.',
    actions: [
      { id: 'track_delivery', label: 'Track Delivery' },
      { id: 'contact_support', label: 'Contact Support' },
    ],
  },
  delivery_delayed: {
    prompt: 'My document delivery is delayed.',
    answerPrimary:
      'Your delivery may be delayed because of courier processing time, service backlog, or location-based delivery constraints.',
    answerSecondary:
      'Check the latest tracking status first. If the delay continues, use support to request a delivery follow-up.',
    actions: [
      { id: 'track_delivery', label: 'Track Delivery' },
      { id: 'delivery_follow_up', label: 'Delivery Follow-up' },
    ],
  },
  delivery_address_incorrect: {
    prompt: 'The delivery address is incorrect.',
    answerPrimary:
      'Thanks for letting us know. If the delivery address is incorrect, we may still be able to update it before the document is dispatched.',
    answerSecondary:
      'Use the options below to update the address or contact support for manual help.',
    actions: [
      { id: 'update_address', label: 'Update Address' },
      { id: 'contact_support', label: 'Contact Support' },
    ],
  },
  payment_deducted_service_not_started: {
    prompt: 'My payment was deducted but the service did not start.',
    answerPrimary:
      'Sorry for the inconvenience. If your payment was deducted but the service has not started, it may be due to a temporary delay in payment confirmation.',
    answerSecondary:
      'Please wait a short time and check the request status. If the service still does not start, contact support with your payment details.',
    actions: [
      { id: 'check_payment_status', label: 'Raise Ticket' },
      { id: 'contact_support', label: 'Contact Support' },
    ],
  },
  payment_refund_not_received: {
    prompt: "I initiated refund for a service but didn't receive refund",
    answerPrimary:
      'Refunds can take additional time depending on payment mode, bank processing, and refund approval status.',
    answerSecondary:
      'Check the refund status first. If the expected timeline has passed, contact support for refund assistance.',
    actions: [
      { id: 'check_refund_status', label: 'Check Refund Status' },
      { id: 'contact_support', label: 'Contact Support' },
    ],
  },
  document_unable_to_upload: {
    prompt: 'I am unable to upload my documents.',
    answerPrimary:
      'Document upload can fail because of file size limits, unsupported formats, unstable internet, or a temporary validation issue.',
    answerSecondary:
      'Review the upload requirements and try again. If the issue continues, contact support for help.',
    actions: [
      { id: 'upload_requirements', label: 'View Upload Requirements' },
      { id: 'contact_support', label: 'Contact Support' },
    ],
  },
  document_rejected: {
    prompt: 'My uploaded document was rejected.',
    answerPrimary:
      'A document may be rejected if the image is unclear, the document is expired, the details do not match, or the uploaded file does not meet verification requirements.',
    answerSecondary:
      'Please review the rejection reason and re-upload the correct document if available.',
    actions: [
      { id: 'view_rejection_reason', label: 'View Rejection Reason' },
      { id: 'reupload_document', label: 'Re-upload Document' },
    ],
  },
  document_invalid_format: {
    prompt: 'The system says my document format is invalid.',
    answerPrimary:
      'This message usually appears when the document file type or size does not match the accepted upload requirements.',
    answerSecondary:
      'Check the supported format requirements below before uploading the document again.',
    actions: [
      { id: 'view_supported_formats', label: 'Supported Formats' },
      { id: 'contact_support', label: 'Contact Support' },
    ],
  },
  service_pan_eligibility: {
    prompt: 'I want to know if I am eligible for PAN Card',
    answerPrimary:
      'To apply for a PAN Card, you need to meet the following eligibility criteria: You must be an Indian citizen or a foreign national eligible to apply, You should have a valid identity and address proof (like Aadhaar Card, Voter ID, Passport, etc.), There is no minimum or maximum age limit — even minors can apply,  For individuals, Aadhaar Card is commonly used for easy application and e-KYC, If you meet these criteria, you are eligible to apply for a PAN Card.',

    answerSecondary:
      'Would you like help with the PAN Card application process?',
    actions: [
      { id: 'view_eligibility', label: 'Apply for PAN Card' },
      { id: 'contact_support', label: 'Contact Support' },
    ],
  },
  service_pan_documents: {
    prompt: 'I want to know which documents are required for PAN Card',
    answerPrimary:
      'For individuals, Aadhaar Card is commonly used for easy application and e-KYC.',
    answerSecondary:
      'Would you like help with the PAN Card application process?',
    actions: [
      { id: 'view_documents', label: 'Apply for PAN Card' },
      { id: 'contact_support', label: 'Contact Support' },
    ],
  },
  service_aadhaar_timeline: {
    prompt: 'I want to know how long the process will take for Aadhar card correction',
    answerPrimary:
      'Aadhaar correction timelines can vary depending on the type of correction, document verification, and current processing volume.',
    answerSecondary:
      'You can review the estimated timeline below or contact support for more guidance.',
    actions: [
      { id: 'view_timeline', label: 'View Timeline' },
      { id: 'contact_support', label: 'Contact Support' },
    ],
  },
  insurance_policy_not_generated: {
    prompt: 'My insurance policy has not been generated.',
    answerPrimary:
      'Policy generation may take additional time if payment confirmation, proposal review, or insurer approval is still pending.',
    answerSecondary:
      'Check the latest policy status below. If the delay continues, contact support for assistance.',
    actions: [
      { id: 'check_policy_status', label: 'Check Policy Status' },
      { id: 'contact_support', label: 'Contact Support' },
    ],
  },
  insurance_claim_help: {
    prompt: 'I need help with the insurance claim process.',
    answerPrimary:
      'I can help you with the insurance claim process, To get started, please fill out the claim request form with your details. Once you submit the form, our insurance broker will contact you and guide you through the complete claim process.',
    answerSecondary:
      'Would you like me to share the claim form with you?',
    actions: [
      { id: 'view_claim_steps', label: 'Fill Claim Form' },
      { id: 'contact_support', label: 'Contact Support' },
    ],
  },
  insurance_policy_inactive: {
    prompt: 'I made the payment but my insurance policy is still inactive.',
    answerPrimary:
      'Sorry for the inconvenience. If your payment has been completed but your insurance policy is still inactive, it may be due to a short delay in policy activation or pending verification.',
    answerSecondary:
      'Please verify the payment and policy status below. If the issue remains, contact support.',
    actions: [
      { id: 'check_policy_status', label: 'Fill Claim Form' },
      { id: 'contact_support', label: 'Contact Support' },
    ],
  },
  status_application_status: {
    prompt: 'I want to check my application status.',
    answerPrimary:
      'Please enter your Application ID or Registered Mobile Number, and I will fetch the latest status for you.',
    answerSecondary:
      'Use the action below to open status tracking, or contact support if the status is unclear.',
    actions: [
      { id: 'track_status', label: 'Track Status' },
      { id: 'contact_support', label: 'Contact Support' },
    ],
  },
  status_application_delayed: {
    prompt: 'My application is delayed',
    answerPrimary:
      'Application delays can happen during verification, department approval, or due to incomplete or mismatched documents.',
    answerSecondary:
      'Check the current tracking status first. If the delay continues, contact support below.',
    actions: [
      { id: 'track_status', label: 'Track Status' },
      { id: 'contact_support', label: 'Contact Support' },
    ],
  },
};

export const DEFAULT_CHATBOT_RESPONSE: ChatbotResponseContent = {
  prompt: 'Support request',
  answerPrimary:
    'We are here to help with your request. Please review the available details and use one of the actions below to continue.',
  answerSecondary:
    'If you still need help after checking the available information, contact support for more assistance.',
  actions: [{ id: 'contact_support', label: 'Contact Support' }],
};
