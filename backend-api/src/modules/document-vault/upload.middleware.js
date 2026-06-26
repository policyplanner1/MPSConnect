const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadDir = path.join(__dirname, "../../../uploads/documents");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safeBase = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .slice(0, 80);
    const uniqueName = `${Date.now()}-${safeBase}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const extensionMimeTypes = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
};

function resolveUploadMimeType(file) {
  if (allowedMimeTypes.has(file.mimetype)) {
    return file.mimetype;
  }

  const ext = path.extname(file.originalname || "").toLowerCase();
  const inferred = extensionMimeTypes[ext];
  if (
    inferred &&
    (file.mimetype === "application/octet-stream" || !file.mimetype)
  ) {
    file.mimetype = inferred;
    return inferred;
  }

  return file.mimetype;
}

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const mimeType = resolveUploadMimeType(file);
    if (!allowedMimeTypes.has(mimeType)) {
      return cb(new Error("Only JPG, PNG, WEBP, and PDF files are allowed"));
    }
    cb(null, true);
  },
});

module.exports = { upload, uploadDir };
