const { z } = require("zod");

const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email"),

  contactNumber: z
    .string()
    .trim()
    .min(10, "Contact number must be at least 10 digits")
    .regex(/^[0-9+\-\s()]+$/, "Contact number format is invalid"),

  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

module.exports = {
  signupSchema,
  loginSchema,
};