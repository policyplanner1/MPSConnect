require("dotenv").config();

require("./config/supertokens");

const express = require("express");

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
      ...require("supertokens-node").getAllCORSHeaders(),
    ],
    credentials: true,
  })
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

app.use(errorHandler());

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
  console.log(`Auth signup:  POST http://localhost:${PORT}/api/v1/auth/signup`);
  console.log(`Forgot password: POST http://localhost:${PORT}/api/v1/auth/forgot-password`);
});
