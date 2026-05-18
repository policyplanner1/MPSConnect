const express = require("express");
const bcrypt = require("bcryptjs");
const { z } = require("zod");
const prisma = require("../config/prisma");
const { sendOtpEmail } = require("../services/email.service");

const router = express.Router();

const OTP_EXPIRY_MINUTES = 10;

const emailSchema = z.object({
  email: z.string().email(),
});

const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(4, "OTP must be 4 digits"),
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(4, "OTP must be 4 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

function generateOtp() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function getExpiryDate() {
  return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
}

async function findValidReset(email, otp) {
  return prisma.passwordReset.findFirst({
    where: {
      email: email.toLowerCase(),
      otp,
      used: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });
}

async function handleSendOtp(req, res) {
  try {
    const { email } = emailSchema.parse(req.body);
    const normalizedEmail = email.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address",
      });
    }

    await prisma.passwordReset.updateMany({
      where: { email: normalizedEmail, used: false },
      data: { used: true },
    });

    const otp = generateOtp();
    const expiresAt = getExpiryDate();

    await prisma.passwordReset.create({
      data: {
        email: normalizedEmail,
        otp,
        expiresAt,
      },
    });

    await sendOtpEmail({ to: normalizedEmail, otp });

    return res.json({
      success: true,
      message: "A 4-digit verification code has been sent to your email",
      data: {
        email: normalizedEmail,
        expiresInMinutes: OTP_EXPIRY_MINUTES,
      },
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: error.issues?.[0]?.message || "Invalid email",
      });
    }
    console.error("[forgot-password]", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send verification code",
    });
  }
}

router.post("/forgot-password", handleSendOtp);

/*
|--------------------------------------------------------------------------
| POST /verify-otp — validate OTP before reset screen
|--------------------------------------------------------------------------
*/
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = verifyOtpSchema.parse(req.body);
    const normalizedEmail = email.toLowerCase();

    const resetRecord = await findValidReset(normalizedEmail, otp);

    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    return res.json({
      success: true,
      message: "Verification code confirmed",
      data: { email: normalizedEmail },
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: error.issues?.[0]?.message || "Invalid input",
      });
    }
    console.error("[verify-otp]", error);
    return res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
});

/*
|--------------------------------------------------------------------------
| POST /reset-password — update password after OTP verified
|--------------------------------------------------------------------------
*/
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, password } = resetPasswordSchema.parse(req.body);
    const normalizedEmail = email.toLowerCase();

    const resetRecord = await findValidReset(normalizedEmail, otp);

    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { email: normalizedEmail },
        data: { password: hashedPassword },
      }),
      prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { used: true },
      }),
      prisma.passwordReset.updateMany({
        where: {
          email: normalizedEmail,
          used: false,
          id: { not: resetRecord.id },
        },
        data: { used: true },
      }),
    ]);

    return res.json({
      success: true,
      message: "Password reset successful. You can log in with your new password.",
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: error.issues?.[0]?.message || "Invalid input",
      });
    }
    console.error("[reset-password]", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reset password",
    });
  }
});

router.post("/resend-otp", handleSendOtp);

module.exports = router;
