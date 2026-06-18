const { fetchMyOrdersForCrmUser } = require("../../services/crmOrders.service");

const DEFAULT_ACTIONS = [
  { id: "check_application_status", label: "Check Application Status" },
  { id: "contact_support", label: "Create Support Ticket" },
];

function humanizeStatus(status) {
  return String(status || "in progress")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function isCompletedStatus(status) {
  const value = String(status || "").toLowerCase();
  return (
    value.includes("completed") ||
    value.includes("delivered") ||
    value.includes("success") ||
    value === "paid"
  );
}

function isPendingStatus(status) {
  const value = String(status || "").toLowerCase();
  return (
    value.includes("pending") ||
    value.includes("processing") ||
    value.includes("in_progress") ||
    value.includes("in progress") ||
    value.includes("review") ||
    value.includes("submitted")
  );
}

function collectServiceNames(order) {
  const names = [];
  if (!order) {
    return names;
  }

  (order.items || []).forEach((item) => {
    if (item?.service_name) {
      names.push(String(item.service_name));
    }
  });

  (order.preview || []).forEach((item) => {
    if (item?.name) {
      names.push(String(item.name));
    }
  });

  return names;
}

function orderMatchesTopic(order, intent) {
  const names = collectServiceNames(order).join(" ").toLowerCase();
  if (intent === "INSURANCE") {
    return /insurance|policy|claim/.test(names);
  }
  if (intent === "KYC" || intent === "DOCUMENT") {
    return /pan|aadhaar|aadhar|kyc|document|verification/.test(names);
  }
  return true;
}

function pickRelevantOrder(orders, intent) {
  if (!orders.length) {
    return null;
  }

  const sorted = [...orders].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const topical = sorted.filter((order) => orderMatchesTopic(order, intent));
  const pool = topical.length ? topical : sorted;

  const inProgress = pool.find((order) => isPendingStatus(order.status));
  if (inProgress) {
    return inProgress;
  }

  return pool[0];
}

function buildVerificationLines(order) {
  const lines = [];
  const names = collectServiceNames(order);
  const status = order?.status || "";
  const joined = names.join(" ").toLowerCase();

  const hasPan = /pan/.test(joined);
  const hasAadhaar = /aadhaar|aadhar/.test(joined);

  if (hasPan) {
    if (isCompletedStatus(status)) {
      lines.push("Your PAN verification was completed.");
    } else if (isPendingStatus(status)) {
      lines.push("Your PAN verification is in progress.");
    } else {
      lines.push("Your PAN verification is pending.");
    }
  }

  if (hasAadhaar) {
    if (isCompletedStatus(status)) {
      lines.push("Your Aadhaar verification was completed.");
    } else if (isPendingStatus(status)) {
      lines.push("Your Aadhaar verification is pending.");
    } else {
      lines.push("Your Aadhaar verification is pending.");
    }
  }

  if (!lines.length && order) {
    const primaryName = names[0] || "Your service request";
    lines.push(`${primaryName} is currently ${humanizeStatus(status)}.`);
  }

  return lines;
}

function buildOrderSummary(order) {
  if (!order) {
    return null;
  }

  const names = collectServiceNames(order);
  return {
    parentOrderId: order.parent_order_id,
    status: order.status,
    serviceName: names[0] || "Service request",
    createdAt: order.created_at,
  };
}

async function loadUserContext(userId) {
  const prisma = require("../../config/prisma");
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      isVerified: true,
      crmUserId: true,
    },
  });
}

async function loadOrdersForUser(user) {
  if (!user?.crmUserId) {
    return [];
  }

  try {
    return await fetchMyOrdersForCrmUser(user.crmUserId);
  } catch (error) {
    console.error("[support] CRM orders fetch failed:", error?.message || error);
    return [];
  }
}

const NOT_FOUND_ACTIONS = [
  { id: "contact_support", label: "Create Support Ticket" },
];

const INTENTS_REQUIRING_ORDER = new Set([
  "PAYMENT",
  "DELIVERY",
  "DOCUMENT",
  "INSURANCE",
]);

function buildDataNotFoundResponse({ prompt, intent }) {
  return {
    success: true,
    intent,
    prompt,
    answerPrimary:
      "We couldn't find matching details for your request in our records right now.",
    answerSecondary:
      "This can happen if the service was booked recently, is linked to another account, or needs a manual review. Please create a support ticket and our team will assist you.",
    actions: NOT_FOUND_ACTIONS,
    personalized: false,
    foundInDatabase: false,
    order: null,
  };
}

function buildActions(intent, order) {
  if (intent === "DELIVERY") {
    return [
      { id: "track_delivery", label: "Track Delivery" },
      { id: "contact_support", label: "Create Support Ticket" },
    ];
  }

  if (intent === "PAYMENT") {
    return [
      { id: "track_status", label: "Track Payment Status" },
      { id: "contact_support", label: "Create Support Ticket" },
    ];
  }

  if (intent === "INSURANCE") {
    return [
      { id: "check_application_status", label: "Check Policy Status" },
      { id: "contact_support", label: "Create Support Ticket" },
    ];
  }

  if (order) {
    return [
      { id: "track_status", label: "Track Application" },
      { id: "contact_support", label: "Create Support Ticket" },
    ];
  }

  return DEFAULT_ACTIONS;
}

async function buildSupportResponse({ userId, message, intent }) {
  const prompt = String(message || "").trim() || "Support request";
  const user = await loadUserContext(userId);

  if (!user) {
    return buildDataNotFoundResponse({ prompt, intent });
  }

  const orders = await loadOrdersForUser(user);
  const order = pickRelevantOrder(orders, intent);
  const orderSummary = buildOrderSummary(order);

  if (INTENTS_REQUIRING_ORDER.has(intent) && !order) {
    return buildDataNotFoundResponse({ prompt, intent });
  }

  if (
    (intent === "APPLICATION" || intent === "STATUS" || intent === "KYC") &&
    !orders.length
  ) {
    return buildDataNotFoundResponse({ prompt, intent });
  }

  if (intent === "SERVICE" && !order) {
    return buildDataNotFoundResponse({ prompt, intent });
  }

  if (intent === "UNKNOWN" && !order) {
    return buildDataNotFoundResponse({ prompt, intent });
  }

  let answerPrimary = "";
  let answerSecondary = "";
  let personalized = false;

  switch (intent) {
    case "APPLICATION":
    case "STATUS":
    case "KYC": {
      const lines = buildVerificationLines(order);
      if (lines.length) {
        answerPrimary = lines.join("\n");
        answerSecondary = isPendingStatus(order?.status)
          ? "Expected completion time: 24-48 hours."
          : "You can track the latest update from My services → Track Status.";
        personalized = true;
      } else {
        answerPrimary = `Your latest request is ${humanizeStatus(order?.status || "in progress")}.`;
        answerSecondary = "Expected completion time: 24-48 hours.";
        personalized = Boolean(order);
      }
      break;
    }

    case "PAYMENT": {
      answerPrimary = `Payment for order ${order.parent_order_id} is currently ${humanizeStatus(order.status)}.`;
      answerSecondary =
        "If the amount was deducted but the service has not started, our team can verify the transaction within 24 hours.";
      personalized = true;
      break;
    }

    case "DELIVERY": {
      if (isCompletedStatus(order.status)) {
        answerPrimary = `Your document for order ${order.parent_order_id} shows as ${humanizeStatus(order.status)}.`;
        answerSecondary =
          "If you have not received the physical document yet, courier delays can still apply.";
      } else {
        answerPrimary = `Delivery for order ${order.parent_order_id} is still ${humanizeStatus(order.status)}.`;
        answerSecondary = "Expected delivery window: 3-7 business days after processing completes.";
      }
      personalized = true;
      break;
    }

    case "DOCUMENT": {
      answerPrimary = `Document review for order ${order.parent_order_id} is ${humanizeStatus(order.status)}.`;
      answerSecondary =
        "Please ensure uploads are JPG, PNG, or PDF under the size limit. Rejected documents can be re-uploaded from My services.";
      personalized = true;
      break;
    }

    case "INSURANCE": {
      answerPrimary = `Your insurance request (${collectServiceNames(order)[0] || "policy"}) is ${humanizeStatus(order.status)}.`;
      answerSecondary = isPendingStatus(order.status)
        ? "Policy generation usually completes within 24-48 hours after payment confirmation."
        : "You can view policy details from My services → Track Status.";
      personalized = true;
      break;
    }

    case "SERVICE": {
      const names = collectServiceNames(order);
      const joined = names.join(" ").toLowerCase();
      if (/pan/.test(joined)) {
        answerPrimary =
          "PAN Card services typically require identity proof and address proof as per the selected variant.";
        answerSecondary = "Processing time is usually 7-15 working days after document verification.";
        personalized = true;
      } else if (/aadhaar|aadhar/.test(joined)) {
        answerPrimary =
          "Aadhaar correction services usually need a valid supporting document for the requested change.";
        answerSecondary = "Expected processing time: 15-30 working days after successful verification.";
        personalized = true;
      } else {
        return buildDataNotFoundResponse({ prompt, intent });
      }
      break;
    }

    default: {
      answerPrimary = `Your latest request is ${humanizeStatus(order.status)}.`;
      answerSecondary = "Use the actions below to track status or reach our support team.";
      personalized = true;
      break;
    }
  }

  return {
    success: true,
    intent,
    prompt,
    answerPrimary,
    answerSecondary,
    actions: buildActions(intent, order),
    personalized,
    foundInDatabase: true,
    order: orderSummary,
  };
}

module.exports = {
  buildSupportResponse,
  buildDataNotFoundResponse,
};
