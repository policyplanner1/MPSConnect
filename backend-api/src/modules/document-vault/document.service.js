const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");

const prisma = require("../../config/prisma");

const DEFAULT_CATEGORY_NAME = "General";

function mapDocument(record) {
  if (!record) {
    return null;
  }

  return {
    id: record.id,
    title: record.title,
    description: record.description,
    fileName: record.fileName,
    fileUrl: record.fileUrl,
    fileType: record.fileType,
    fileSize: record.fileSize,
    tags: record.tags,
    category: record.documentcategory
      ? {
          id: record.documentcategory.id,
          name: record.documentcategory.name,
          description: record.documentcategory.description,
        }
      : null,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

async function resolveDefaultCategoryId() {
  const now = new Date();

  let category = await prisma.documentcategory.findFirst({
    where: { name: DEFAULT_CATEGORY_NAME },
  });

  if (!category) {
    category = await prisma.documentcategory.create({
      data: {
        id: randomUUID(),
        name: DEFAULT_CATEGORY_NAME,
        description: "General documents",
        updatedAt: now,
      },
    });
  }

  return category.id;
}

async function ensureDefaultDocumentCategory() {
  await resolveDefaultCategoryId();
}

async function listDocuments(userId) {
  const records = await prisma.document.findMany({
    where: { uploadedById: userId },
    include: { documentcategory: true },
    orderBy: { createdAt: "desc" },
  });

  return records.map(mapDocument);
}

async function getDocumentById(userId, documentId) {
  const record = await prisma.document.findFirst({
    where: {
      id: documentId,
      uploadedById: userId,
    },
    include: { documentcategory: true },
  });

  return mapDocument(record);
}

async function createDocument(userId, payload, file) {
  if (!file) {
    throw new Error("Document file is required");
  }

  const categoryId = await resolveDefaultCategoryId();
  const now = new Date();
  const title =
    String(payload.title || "").trim() ||
    path.basename(file.originalname, path.extname(file.originalname));

  const record = await prisma.document.create({
    data: {
      id: randomUUID(),
      title,
      description: payload.description ? String(payload.description).trim() : null,
      fileName: file.originalname,
      fileUrl: `/uploads/documents/${file.filename}`,
      fileType: file.mimetype,
      fileSize: file.size,
      tags: payload.tags ? String(payload.tags).trim() : null,
      uploadedById: userId,
      categoryId,
      updatedAt: now,
    },
    include: { documentcategory: true },
  });

  return mapDocument(record);
}

async function updateDocument(userId, documentId, payload, file) {
  const existing = await prisma.document.findFirst({
    where: {
      id: documentId,
      uploadedById: userId,
    },
  });

  if (!existing) {
    return null;
  }

  const data = {
    updatedAt: new Date(),
  };

  if (payload.title != null && String(payload.title).trim()) {
    data.title = String(payload.title).trim();
  }

  if (payload.description != null) {
    data.description = String(payload.description).trim() || null;
  }

  if (payload.tags != null) {
    data.tags = String(payload.tags).trim() || null;
  }

  if (file) {
    const oldFilePath = path.join(
      __dirname,
      "../../../",
      existing.fileUrl.replace(/^\//, "")
    );
    if (fs.existsSync(oldFilePath)) {
      fs.unlinkSync(oldFilePath);
    }

    data.fileName = file.originalname;
    data.fileUrl = `/uploads/documents/${file.filename}`;
    data.fileType = file.mimetype;
    data.fileSize = file.size;
  }

  const record = await prisma.document.update({
    where: { id: documentId },
    data,
    include: { documentcategory: true },
  });

  return mapDocument(record);
}

async function getDocumentFileForDownload(userId, documentId) {
  const document = await getDocumentById(userId, documentId);
  if (!document) {
    return null;
  }

  const filePath = path.join(
    __dirname,
    "../../../",
    document.fileUrl.replace(/^\//, "")
  );

  if (!fs.existsSync(filePath)) {
    return null;
  }

  return { document, filePath };
}

async function deleteDocument(userId, documentId) {
  const existing = await prisma.document.findFirst({
    where: {
      id: documentId,
      uploadedById: userId,
    },
  });

  if (!existing) {
    return false;
  }

  const filePath = path.join(
    __dirname,
    "../../../",
    existing.fileUrl.replace(/^\//, "")
  );

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await prisma.document.delete({
    where: { id: documentId },
  });

  return true;
}

module.exports = {
  ensureDefaultDocumentCategory,
  listDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  getDocumentFileForDownload,
};
