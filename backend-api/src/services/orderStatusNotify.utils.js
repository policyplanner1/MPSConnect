const MAX_STATUS_NOTIFICATIONS_PER_DAY = 2;

function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toStatusKey(status) {
  return String(status || "").trim().toLowerCase();
}

function statusNotificationCopy(statusRaw) {
  const s = toStatusKey(statusRaw);
  if (!s) {
    return null;
  }

  if (s.includes("pending") && s.includes("payment")) {
    return {
      title: "Payment pending",
      body: "Complete payment to start processing your request.",
    };
  }
  if (s.includes("pending")) {
    return {
      title: "Request pending",
      body: "Your request is pending. We'll notify you when it moves ahead.",
    };
  }
  if (s.includes("in_progress") || s.includes("processing")) {
    return {
      title: "Request in progress",
      body: "Your request is being processed right now.",
    };
  }
  if (s.includes("paid")) {
    return {
      title: "Payment received",
      body: "We received your payment. Your request will be processed soon.",
    };
  }
  if (s === "completed" || s.includes("success")) {
    return {
      title: "Service completed",
      body: "Your request was completed successfully.",
    };
  }
  if (s.includes("cancel")) {
    return {
      title: "Request cancelled",
      body: "Your request was cancelled. Check My requests for details.",
    };
  }
  if (s.includes("fail") || s.includes("reject")) {
    return {
      title: "Update on your request",
      body: "There was an issue with your request. Check My requests for details.",
    };
  }
  return null;
}

function defaultNotifyState() {
  return {
    seeded: false,
    statuses: {},
    limits: {},
  };
}

function parseNotifyState(raw) {
  if (!raw || typeof raw !== "object") {
    return defaultNotifyState();
  }
  return {
    seeded: Boolean(raw.seeded),
    statuses:
      raw.statuses && typeof raw.statuses === "object" ? raw.statuses : {},
    limits: raw.limits && typeof raw.limits === "object" ? raw.limits : {},
  };
}

module.exports = {
  MAX_STATUS_NOTIFICATIONS_PER_DAY,
  todayKey,
  toStatusKey,
  statusNotificationCopy,
  defaultNotifyState,
  parseNotifyState,
};
