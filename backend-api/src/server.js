require("dotenv").config();

require("./config/supertokens");
const { initFirebaseAdmin } = require("./config/firebase");
const {
  startOrderStatusPolling,
} = require("./services/orderStatusMonitor.service");

initFirebaseAdmin();

const express = require("express");
const path = require("path");

const cors = require("cors");

const cookieParser = require("cookie-parser");

const forgotPasswordRoute = require("./routes/forgotPassword");

const {
  middleware,
  errorHandler,
} = require("supertokens-node/framework/express");

const app = express();

app.use(
  cors({
    origin: true,
    allowedHeaders: [
      "content-type",
      "authorization",
      ...require("supertokens-node").getAllCORSHeaders(),
    ],
    credentials: true,
  })
);

app.use(
  '/uploads',
  express.static(
    path.join(__dirname, '../uploads'),
  ),
);

app.use(cookieParser());

app.use(express.json());

app.use(middleware());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MPS Connect API Running",
  });
});

app.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "SuperTokens backend working",
  });
});

const authRoutes = require("./modules/auth/auth.routes");
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/auth", forgotPasswordRoute);

const { protect } = require("./modules/auth/auth.middleware");

app.get("/api/v1/profile", protect, (req, res) => {
  res.json({
    success: true,
    message: "Protected route working",
    user: req.user,
  });
});

// Banners
const bannerRoutes = require("./modules/banners/banner.routes");
app.use("/api/banners", bannerRoutes);

// Notifications
const notificationRoutes = require("./modules/notifications/notifications.routes");
app.use("/api/v1/notifications", notificationRoutes);

// Hybrid support chatbot
const supportRoutes = require("./modules/support/support.routes");
app.use("/api/v1/support", supportRoutes);

// Document vault
const documentRoutes = require("./modules/document-vault/document.routes");
const {
  ensureDefaultDocumentCategory,
} = require("./modules/document-vault/document.service");
app.use("/api/v1/documents", documentRoutes);

ensureDefaultDocumentCategory().catch((error) => {
  console.error("Failed to seed default document category:", error);
});

app.use(errorHandler());

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
  console.log(`Auth signup:  POST http://localhost:${PORT}/api/v1/auth/signup`);
  console.log(`Forgot password: POST http://localhost:${PORT}/api/v1/auth/forgot-password`);
  console.log(`FCM token:     POST http://localhost:${PORT}/api/v1/notifications/fcm-token`);
  console.log(`Documents:     GET  http://localhost:${PORT}/api/v1/documents`);
  console.log(`Doc upload:    POST http://localhost:${PORT}/api/v1/documents/upload`);
  startOrderStatusPolling();
});
