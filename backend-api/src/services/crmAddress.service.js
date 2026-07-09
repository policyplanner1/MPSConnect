const {
  ensureMpsOAuthToken,
  getAuthorizationHeader,
} = require("./mpsOAuth.service");

const MPS_ADDRESSES_URL =
  process.env.MPS_ADDRESSES_URL ||
  "https://rewardplanners.com/api/crm/mps/service/addresses";

function buildCrmAddressPayload(crmUserId, address) {
  return {
    user_id: crmUserId,
    name: address.label,
    full_name: address.fullName,
    mobile: address.phone,
    phone: address.phone,
    address_line_1: address.addressLine1,
    address_line_2: address.addressLine2 || "",
    address_line1: address.addressLine1,
    address_line2: address.addressLine2 || "",
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    postal_code: address.pincode,
    is_default: address.isDefault ? 1 : 0,
  };
}

function extractCrmAddressId(body) {
  const data = body?.data ?? body;
  const id = data?.id ?? data?.address_id ?? data?.addressId;
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

async function createCrmAddress(crmUserId, address) {
  const token = await ensureMpsOAuthToken();
  const authHeader = getAuthorizationHeader(token);
  if (!authHeader) {
    return null;
  }

  const response = await fetch(MPS_ADDRESSES_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    body: JSON.stringify(buildCrmAddressPayload(crmUserId, address)),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[crmAddress] create failed", response.status, body?.message || body);
    }
    return null;
  }

  return extractCrmAddressId(body);
}

async function updateCrmAddress(crmUserId, crmAddressId, address) {
  const token = await ensureMpsOAuthToken();
  const authHeader = getAuthorizationHeader(token);
  if (!authHeader) {
    return crmAddressId;
  }

  const url = `${MPS_ADDRESSES_URL.replace(/\/$/, "")}/${crmAddressId}`;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    body: JSON.stringify(buildCrmAddressPayload(crmUserId, address)),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[crmAddress] update failed", response.status, body?.message || body);
    }
    return crmAddressId;
  }

  return extractCrmAddressId(body) ?? crmAddressId;
}

module.exports = {
  createCrmAddress,
  updateCrmAddress,
};
