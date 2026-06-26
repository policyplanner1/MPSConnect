const express = require("express");

const { protect } = require("../auth/auth.middleware");
const {
  getAllDocuments,
  getDocument,
  uploadDocument,
  updateDocument,
  downloadDocument,
  deleteDocument,
} = require("./document.controller");
const { upload } = require("./upload.middleware");

const router = express.Router();

function handleUpload(fieldName) {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (error) => {
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message || "Invalid upload",
        });
      }
      next();
    });
  };
}

router.get("/", protect, getAllDocuments);
router.post("/upload", protect, handleUpload("file"), uploadDocument);
router.get("/:id/download", protect, downloadDocument);
router.get("/:id", protect, getDocument);
router.put("/:id", protect, handleUpload("file"), updateDocument);
router.delete("/:id", protect, deleteDocument);

module.exports = router;
