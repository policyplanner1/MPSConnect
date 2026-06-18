const bannerService = require("./banner.service");
const { createBannerSchema } = require("./banner.validation");

/** Prisma returns BigInt for Banner.id; JSON.stringify cannot serialize BigInt. */
const toJsonSafe = (value) =>
  JSON.parse(
    JSON.stringify(value, (_, v) => (typeof v === "bigint" ? v.toString() : v))
  );

const getBanners = async (req, res) => {
  try {
    const banners = await bannerService.getAllBanners();

    return res.json({
      success: true,
      banners: toJsonSafe(banners),
    });
  } catch (error) {
    console.error("Failed to fetch banners:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch banners",
    });
  }
};

const createBanner = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Image file is required (form field key: image)",
    });
  }

  const parsed = createBannerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid request body",
      errors: parsed.error.flatten(),
    });
  }

  const imageUrl = `/uploads/banners/${req.file.filename}`;

  try {
    const banner = await bannerService.createBanner({
      ...parsed.data,
      imageUrl,
    });

    return res.status(201).json({
      success: true,
      banner: toJsonSafe(banner),
    });
  } catch (error) {
    console.error("Failed to create banner:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create banner",
    });
  }
};

module.exports = {
  getBanners,
  createBanner,
};
