const { z } = require("zod");

// Form-data sends all values as strings; image comes from req.file, not body.
const createBannerSchema = z
  .object({
    title: z.string().min(1),
    subtitle: z.string().min(1).optional().nullable(),
    redirectType: z.string().min(1),
    redirectValue: z.string().min(1),
    buttonText: z.string().min(1).optional().nullable(),
    priority: z.coerce.number().int().nonnegative().optional(),
    startDate: z.coerce.date().optional().nullable(),
    endDate: z.coerce.date().optional().nullable(),
  })
  .strict();

module.exports = {
  createBannerSchema,
};
