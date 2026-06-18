const {
  ensureMpsOAuthToken,
  getAuthorizationHeader,
} = require("./mpsOAuth.service");

const MY_ORDERS_URL =
  process.env.MPS_MY_ORDERS_URL ||
  "https://rewardplanners.com/api/crm/mps/service/my-orders";

async function fetchMyOrdersForCrmUser(crmUserId) {
  const token = await ensureMpsOAuthToken();
  const authHeader = getAuthorizationHeader(token);
  if (!authHeader) {
    throw new Error("MPS OAuth token missing");
  }

  const url = new URL(MY_ORDERS_URL);
  url.searchParams.set("user_id", String(crmUserId));

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: authHeader,
    },
  });

  const body = await response.json();
  if (!response.ok || !body?.success) {
    throw new Error(body?.message || "Failed to load CRM orders");
  }

  return Array.isArray(body.data) ? body.data : [];
}

module.exports = {
  fetchMyOrdersForCrmUser,
};
