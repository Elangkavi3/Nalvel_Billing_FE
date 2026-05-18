import API from "./api";
import { additionalFileEndpoints } from "./endpoints";

function normalizeFileUrl(value) {
  if (!value) return "";

  const url = String(value);

  if (/^(https?:|blob:|data:)/i.test(url)) {
    return url;
  }

  const base = String(API.defaults.baseURL || "").replace(/\/$/, "");

  if (url.startsWith("/")) {
    return base ? `${base}${url}` : url;
  }

  return base ? `${base}/${url}` : url;
}

function assertPreviewBlob(response) {
  const contentType = String(response.headers?.["content-type"] || "");

  if (contentType.includes("text/html")) {
    throw new Error("File preview returned a page instead of a file");
  }

  return response.data;
}

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function normalizeAdditionalFile(file = {}) {
  const name =
    file.name ??
    file.fileName ??
    file.uploadFileName ??
    file.originalFileName ??
    file.documentName ??
    "Uploaded file";

  const id = file.id ?? file.fileId ?? file.documentId ?? "";

  return {
    id,
    name,
    fileName: name,
    size: file.size ?? file.fileSize ?? "",
    contentType: file.contentType ?? file.fileType ?? file.mimeType ?? "",
    url: id ? "" : normalizeFileUrl(file.url ?? file.fileUrl),
    previewUrl: file.previewUrl ?? "",
    uploadFilePath: file.uploadFilePath ?? "",
    uploadedDate: file.uploadedDate ?? "",
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
  data.append("files", file);
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

  return normalizeAdditionalFiles(response.data)[0] ?? null;
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

  if (!file?.id && file?.url) {
    window.open(file.url, "_blank", "noopener,noreferrer");
    return;
  }

  if (!file?.id) {
    throw new Error("File preview is not available yet");
  }

  const response = await API.get(additionalFileEndpoints.previewById(file.id), {
    headers: authHeaders(),
    responseType: "blob",
  });
  const blobUrl = window.URL.createObjectURL(assertPreviewBlob(response));
  window.open(blobUrl, "_blank", "noopener,noreferrer");
  window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60_000);
}

export async function getAdditionalFilePreviewUrl(file) {
  if (file?.previewUrl) {
    return { url: file.previewUrl, shouldRevoke: false };
  }

  if (!file?.id && file?.url) {
    return { url: file.url, shouldRevoke: false };
  }

  if (!file?.id) {
    throw new Error("File preview is not available yet");
  }

  const response = await API.get(additionalFileEndpoints.previewById(file.id), {
    headers: authHeaders(),
    responseType: "blob",
  });

  return {
    url: window.URL.createObjectURL(assertPreviewBlob(response)),
    shouldRevoke: true,
  };
}

export async function deleteAdditionalFile(id) {
  const response = await API.delete(additionalFileEndpoints.deleteById(id));
  return response.data;
}
