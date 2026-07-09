const express = require("express");

const { protect } = require("../auth/auth.middleware");
const {
  listAddresses,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
} = require("./address.controller");

const router = express.Router();

router.get("/", protect, listAddresses);
router.post("/", protect, createAddress);
router.put("/:id", protect, updateAddress);
router.patch("/:id/default", protect, setDefaultAddress);
router.delete("/:id", protect, deleteAddress);

module.exports = router;
