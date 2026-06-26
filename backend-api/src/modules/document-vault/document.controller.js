const documentService = require("./document.service");

function toJsonSafe(value) {
  return JSON.parse(
    JSON.stringify(value, (_, v) => (typeof v === "bigint" ? v.toString() : v))
  );
}

const getAllDocuments = async (req, res) => {
  try {
    const documents = await documentService.listDocuments(req.user.id);

    return res.json({
      success: true,
      data: toJsonSafe(documents),
      count: documents.length,
    });
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch documents",
    });
  }
};

const getDocument = async (req, res) => {
  try {
    const document = await documentService.getDocumentById(req.user.id, req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    return res.json({
      success: true,
      data: toJsonSafe(document),
    });
  } catch (error) {
    console.error("Failed to fetch document:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch document",
    });
  }
};

const uploadDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Document file is required (form field key: file)",
    });
  }

  try {
    const document = await documentService.createDocument(req.user.id, req.body, req.file);

    return res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      data: toJsonSafe(document),
    });
  } catch (error) {
    console.error("Failed to upload document:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upload document",
    });
  }
};

const updateDocument = async (req, res) => {
  try {
    const document = await documentService.updateDocument(
      req.user.id,
      req.params.id,
      req.body,
      req.file || null
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    return res.json({
      success: true,
      message: "Document updated successfully",
      data: toJsonSafe(document),
    });
  } catch (error) {
    console.error("Failed to update document:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update document",
    });
  }
};

const downloadDocument = async (req, res) => {
  try {
    const fileInfo = await documentService.getDocumentFileForDownload(
      req.user.id,
      req.params.id
    );

    if (!fileInfo) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    return res.download(fileInfo.filePath, fileInfo.document.fileName);
  } catch (error) {
    console.error("Failed to download document:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to download document",
    });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const deleted = await documentService.deleteDocument(req.user.id, req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    return res.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete document:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete document",
    });
  }
};

module.exports = {
  getAllDocuments,
  getDocument,
  uploadDocument,
  updateDocument,
  downloadDocument,
  deleteDocument,
};
