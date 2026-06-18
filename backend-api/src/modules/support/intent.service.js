const RESPONSE_KEY_HINTS = {
  application_stuck_in_processing: "APPLICATION",
  application_processing_status_check: "APPLICATION",
  delivery_not_delivered: "DELIVERY",
  delivery_delayed: "DELIVERY",
  delivery_address_incorrect: "DELIVERY",
  payment_deducted_service_not_started: "PAYMENT",
  payment_refund_not_received: "PAYMENT",
  document_unable_to_upload: "DOCUMENT",
  document_rejected: "DOCUMENT",
  document_invalid_format: "DOCUMENT",
  service_pan_eligibility: "SERVICE",
  service_pan_documents: "SERVICE",
  service_aadhaar_timeline: "SERVICE",
  insurance_policy_not_generated: "INSURANCE",
  insurance_claim_help: "INSURANCE",
  insurance_policy_inactive: "INSURANCE",
  status_application_status: "STATUS",
  status_application_delayed: "STATUS",
};

function detectIntent(message, responseKey) {
  if (responseKey && RESPONSE_KEY_HINTS[responseKey]) {
    return RESPONSE_KEY_HINTS[responseKey];
  }

  const text = String(message || "").toLowerCase();

  if (
    text.includes("application") ||
    text.includes("pending") ||
    text.includes("stuck") ||
    text.includes("processing") ||
    text.includes("in progress")
  ) {
    return "APPLICATION";
  }

  if (
    text.includes("delivery") ||
    text.includes("delivered") ||
    text.includes("courier") ||
    text.includes("address")
  ) {
    return "DELIVERY";
  }

  if (
    text.includes("payment") ||
    text.includes("refund") ||
    text.includes("money") ||
    text.includes("deducted")
  ) {
    return "PAYMENT";
  }

  if (
    text.includes("upload") ||
    text.includes("document") ||
    text.includes("rejected") ||
    text.includes("format")
  ) {
    return "DOCUMENT";
  }

  if (
    text.includes("kyc") ||
    text.includes("verification") ||
    text.includes("aadhaar") ||
    text.includes("aadhar") ||
    text.includes("pan")
  ) {
    return "KYC";
  }

  if (text.includes("insurance") || text.includes("claim") || text.includes("policy")) {
    return "INSURANCE";
  }

  if (text.includes("status") || text.includes("track") || text.includes("delayed")) {
    return "STATUS";
  }

  if (
    text.includes("eligible") ||
    text.includes("required") ||
    text.includes("how long") ||
    text.includes("timeline")
  ) {
    return "SERVICE";
  }

  return "UNKNOWN";
}

module.exports = {
  detectIntent,
  RESPONSE_KEY_HINTS,
};
