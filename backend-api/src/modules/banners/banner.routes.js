const express = require("express");
const { upload } = require("../../config/multer");
const { getBanners, createBanner } = require("./banner.controller");

const router = express.Router();

router.get("/", getBanners);

router.post("/", (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    next();
  });
}, createBanner);

module.exports = router;
