const { addressInputSchema } = require("./address.validation");
const addressService = require("./address.service");

function getUserId(req) {
  return req.user?.id;
}

async function listAddresses(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const addresses = await addressService.listAddresses(userId);
    return res.json({ success: true, data: addresses });
  } catch (error) {
    console.error("[addresses/list]", error);
    return res.status(500).json({ success: false, message: "Failed to load addresses" });
  }
}

async function createAddress(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const input = addressInputSchema.parse(req.body);
    const address = await addressService.createAddress(userId, input);
    return res.status(201).json({
      success: true,
      message: "Address saved",
      data: address,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: error.issues?.[0]?.message || "Invalid address",
      });
    }
    console.error("[addresses/create]", error);
    return res.status(500).json({ success: false, message: "Failed to save address" });
  }
}

async function updateAddress(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const addressId = Number(req.params.id);
    if (!Number.isInteger(addressId) || addressId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid address id" });
    }

    const input = addressInputSchema.parse(req.body);
    const address = await addressService.updateAddress(userId, addressId, input);
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    return res.json({
      success: true,
      message: "Address updated",
      data: address,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: error.issues?.[0]?.message || "Invalid address",
      });
    }
    console.error("[addresses/update]", error);
    return res.status(500).json({ success: false, message: "Failed to update address" });
  }
}

async function setDefaultAddress(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const addressId = Number(req.params.id);
    if (!Number.isInteger(addressId) || addressId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid address id" });
    }

    const address = await addressService.setDefaultAddress(userId, addressId);
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    return res.json({ success: true, data: address });
  } catch (error) {
    console.error("[addresses/default]", error);
    return res.status(500).json({ success: false, message: "Failed to update default address" });
  }
}

async function deleteAddress(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const addressId = Number(req.params.id);
    if (!Number.isInteger(addressId) || addressId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid address id" });
    }

    const deleted = await addressService.deleteAddress(userId, addressId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    return res.json({ success: true, message: "Address deleted" });
  } catch (error) {
    console.error("[addresses/delete]", error);
    return res.status(500).json({ success: false, message: "Failed to delete address" });
  }
}

module.exports = {
  listAddresses,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
};
