const prisma = require("../../config/prisma");

const parseNullableDate = (value) => {
  if (value === undefined || value === null) return null;
  if (typeof value === "string" && value.trim() === "") return null;

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    // Validation should already catch this, but keep Prisma safe.
    return null;
  }

  return d;
};

const getAllBanners = async () => {
  return prisma.banner.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      priority: "asc",
    },
  });
};

const createBanner = async (data) => {
  return prisma.banner.create({
    data: {
      title: data.title,
      subtitle: data.subtitle ?? null,
      imageUrl: data.imageUrl,
      redirectType: data.redirectType,
      redirectValue: data.redirectValue,
      buttonText: data.buttonText ?? null,
      priority: data.priority ?? 0,
      startDate: parseNullableDate(data.startDate),
      endDate: parseNullableDate(data.endDate),
    },
  });
};

module.exports = {
  getAllBanners,
  createBanner,
};

