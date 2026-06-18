const MPS_OAUTH_TOKEN_URL =
  process.env.MPS_OAUTH_TOKEN_URL ||
  "https://rewardplanners.com/api/crm/mps/auth/oauth/token";

let cachedToken = null;
let cachedExpiresAt = 0;

async function fetchMpsOAuthToken() {
  const clientId = process.env.MPS_CLIENT_ID;
  const clientSecret = process.env.MPS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("MPS_CLIENT_ID and MPS_CLIENT_SECRET must be set in .env");
  }

  const response = await fetch(MPS_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  const body = await response.json();
  if (!response.ok || !body?.success || !body?.data?.access_token) {
    throw new Error(body?.message || "Failed to obtain MPS access token");
  }

  const expiresInSec = Number(body.data.expires_in) || 3600;
  cachedToken = body.data.access_token;
  cachedExpiresAt = Date.now() + expiresInSec * 1000 - 60_000;

  return cachedToken;
}

async function ensureMpsOAuthToken() {
  if (cachedToken && Date.now() < cachedExpiresAt) {
    return cachedToken;
  }
  return fetchMpsOAuthToken();
}

function getAuthorizationHeader(token) {
  return token ? `Bearer ${token}` : null;
}

module.exports = {
  ensureMpsOAuthToken,
  getAuthorizationHeader,
};
