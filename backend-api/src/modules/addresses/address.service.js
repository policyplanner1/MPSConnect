const prisma = require("../../config/prisma");
const { createCrmAddress, updateCrmAddress } = require("../../services/crmAddress.service");

function serializeAddress(row) {
  return {
    id: row.id,
    label: row.label,
    fullName: row.fullName,
    phone: row.phone,
    addressLine1: row.addressLine1,
    addressLine2: row.addressLine2,
    city: row.city,
    state: row.state,
    pincode: row.pincode,
    isDefault: row.isDefault,
    crmAddressId: row.crmAddressId,
    checkoutAddressId: row.crmAddressId ?? row.id,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function getUserCrmId(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { crmUserId: true },
  });
  return user?.crmUserId ?? null;
}

async function clearDefaultForUser(userId, exceptId) {
  await prisma.userAddress.updateMany({
    where: {
      userId,
      ...(exceptId ? { NOT: { id: exceptId } } : {}),
    },
    data: { isDefault: false },
  });
}

async function listAddresses(userId) {
  const rows = await prisma.userAddress.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
  });
  return rows.map(serializeAddress);
}

async function createAddress(userId, input) {
  const existingCount = await prisma.userAddress.count({ where: { userId } });
  const shouldDefault = input.isDefault === true || existingCount === 0;

  if (shouldDefault) {
    await clearDefaultForUser(userId);
  }

  let crmAddressId = null;
  const crmUserId = await getUserCrmId(userId);
  if (crmUserId) {
    crmAddressId = await createCrmAddress(crmUserId, {
      ...input,
      isDefault: shouldDefault,
    });
  }

  const row = await prisma.userAddress.create({
    data: {
      userId,
      label: input.label,
      fullName: input.fullName,
      phone: input.phone,
      addressLine1: input.addressLine1,
      addressLine2: input.addressLine2 || null,
      city: input.city,
      state: input.state,
      pincode: input.pincode,
      isDefault: shouldDefault,
      crmAddressId,
    },
  });

  return serializeAddress(row);
}

async function updateAddress(userId, addressId, input) {
  const existing = await prisma.userAddress.findFirst({
    where: { id: addressId, userId },
  });

  if (!existing) {
    return null;
  }

  const shouldDefault = input.isDefault === true;
  if (shouldDefault) {
    await clearDefaultForUser(userId, addressId);
  }

  const crmUserId = await getUserCrmId(userId);
  let crmAddressId = existing.crmAddressId;
  if (crmUserId) {
    if (crmAddressId) {
      crmAddressId = await updateCrmAddress(crmUserId, crmAddressId, {
        ...existing,
        ...input,
        isDefault: shouldDefault || existing.isDefault,
      });
    } else {
      crmAddressId = await createCrmAddress(crmUserId, {
        ...existing,
        ...input,
        isDefault: shouldDefault || existing.isDefault,
      });
    }
  }

  const row = await prisma.userAddress.update({
    where: { id: addressId },
    data: {
      label: input.label,
      fullName: input.fullName,
      phone: input.phone,
      addressLine1: input.addressLine1,
      addressLine2: input.addressLine2 || null,
      city: input.city,
      state: input.state,
      pincode: input.pincode,
      ...(shouldDefault ? { isDefault: true } : {}),
      crmAddressId,
    },
  });

  return serializeAddress(row);
}

async function setDefaultAddress(userId, addressId) {
  const existing = await prisma.userAddress.findFirst({
    where: { id: addressId, userId },
  });
  if (!existing) {
    return null;
  }

  await clearDefaultForUser(userId, addressId);
  const row = await prisma.userAddress.update({
    where: { id: addressId },
    data: { isDefault: true },
  });
  return serializeAddress(row);
}

async function deleteAddress(userId, addressId) {
  const existing = await prisma.userAddress.findFirst({
    where: { id: addressId, userId },
  });
  if (!existing) {
    return false;
  }

  await prisma.userAddress.delete({ where: { id: addressId } });

  if (existing.isDefault) {
    const next = await prisma.userAddress.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
    if (next) {
      await prisma.userAddress.update({
        where: { id: next.id },
        data: { isDefault: true },
      });
    }
  }

  return true;
}

module.exports = {
  listAddresses,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
};
