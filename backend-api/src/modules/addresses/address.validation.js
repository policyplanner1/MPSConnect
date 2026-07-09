const { z } = require("zod");

const addressInputSchema = z.object({
  label: z.enum(["Home", "Work", "Other"]).default("Home"),
  fullName: z.string().trim().min(2, "Full name is required"),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  addressLine1: z.string().trim().min(3, "Address line is required"),
  addressLine2: z.string().trim().optional().or(z.literal("")),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(2, "State is required"),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  isDefault: z.boolean().optional(),
});

module.exports = {
  addressInputSchema,
};
