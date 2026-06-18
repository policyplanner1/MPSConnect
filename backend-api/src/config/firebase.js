const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

let initialized = false;

function loadServiceAccount() {
  const jsonInline = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (jsonInline && jsonInline.trim()) {
    return JSON.parse(jsonInline);
  }

  const relPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    "./config/firebase-service-account.json";
  const absPath = path.isAbsolute(relPath)
    ? relPath
    : path.join(process.cwd(), relPath);

  if (!fs.existsSync(absPath)) {
    return null;
  }

  const raw = fs.readFileSync(absPath, "utf8");
  return JSON.parse(raw);
}

function initFirebaseAdmin() {
  if (initialized) {
    return admin;
  }

  const serviceAccount = loadServiceAccount();
  if (!serviceAccount) {
    console.warn(
      "[firebase] No service account configured — push notifications disabled. Set FIREBASE_SERVICE_ACCOUNT_PATH in .env",
    );
    return null;
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  initialized = true;
  console.log("[firebase] Admin SDK initialized");
  return admin;
}

function isFirebaseReady() {
  return initialized;
}

module.exports = {
  initFirebaseAdmin,
  isFirebaseReady,
  getAdmin: () => (initialized ? admin : null),
};
