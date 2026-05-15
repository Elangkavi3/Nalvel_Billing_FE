import API from "./api";
import { additionalFileEndpoints } from "./endpoints";

function normalizeAdditionalFile(file = {}) {
  const name =
    file.name ??
    file.fileName ??
    file.originalFileName ??
    file.documentName ??
    "Uploaded file";

  return {
    id: file.id ?? file.fileId ?? file.documentId ?? "",
    name,
    fileName: name,
    size: file.size ?? file.fileSize ?? "",
    contentType: file.contentType ?? file.fileType ?? file.mimeType ?? "",
    url: file.url ?? file.fileUrl ?? file.previewUrl ?? "",
    uploaded: true,
  };
}

function normalizeAdditionalFiles(value) {
  const rows = Array.isArray(value) ? value : value ? [value] : [];
  return rows.map(normalizeAdditionalFile);
}

export async function uploadAdditionalFile(consignmentId, entry) {
  const file = entry?.file ?? entry;
  const fileName = String(entry?.fileName || file?.name || "").trim();
  const data = new FormData();
  data.append("file", file);
  if (fileName) {
    data.append("fileName", fileName);
  }

  const response = await API.post(
    additionalFileEndpoints.upload(consignmentId),
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return normalizeAdditionalFile(response.data);
}

export async function getAdditionalFilesByConsignmentId(consignmentId) {
  const response = await API.get(
    additionalFileEndpoints.readByConsignmentId(consignmentId),
  );

  return normalizeAdditionalFiles(response.data);
}

export async function previewAdditionalFile(file) {
  if (file?.previewUrl) {
    window.open(file.previewUrl, "_blank", "noopener,noreferrer");
    return;
  }

  if (file?.url) {
    window.open(file.url, "_blank", "noopener,noreferrer");
    return;
  }

  if (!file?.id) {
    throw new Error("File preview is not available yet");
  }

  const response = await API.get(additionalFileEndpoints.previewById(file.id), {
    responseType: "blob",
  });
  const blobUrl = window.URL.createObjectURL(response.data);
  window.open(blobUrl, "_blank", "noopener,noreferrer");
  window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60_000);
}

export async function getAdditionalFilePreviewUrl(file) {
  if (file?.previewUrl) {
    return { url: file.previewUrl, shouldRevoke: false };
  }

  if (file?.url) {
    return { url: file.url, shouldRevoke: false };
  }

  if (!file?.id) {
    throw new Error("File preview is not available yet");
  }

  const response = await API.get(additionalFileEndpoints.previewById(file.id), {
    responseType: "blob",
  });

  return {
    url: window.URL.createObjectURL(response.data),
    shouldRevoke: true,
  };
}

export async function deleteAdditionalFile(id) {
  const response = await API.delete(additionalFileEndpoints.deleteById(id));
  return response.data;
}
