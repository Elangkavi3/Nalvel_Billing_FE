import API from "./api";
import { lrEndpoints } from "./endpoints";

function responseRows(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return value ? [value] : [];
}

function resolveConsignmentId(record) {
  const nestedId = record?.consignment?.id;
  const directId = record?.consignmentId;
  const value = Number(directId ?? nestedId ?? 0);
  return Number.isFinite(value) ? value : 0;
}

export async function request(url, options = {}) {
  const { body, headers, method = "GET", ...rest } = options;
  const response = await API.request({
    url,
    method,
    data: body ? JSON.parse(body) : undefined,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    ...rest,
  });

  return response.data;
}

export async function saveLR(data) {
  const response = await API.post(
    lrEndpoints.create(),
    data
  );

  return response.data;
}

export async function getAllLR() {
  const response = await API.get(
    lrEndpoints.readAll()
  );

  return response.data;
}

export async function getLRById(id) {
  if (!id) return null;
  const records = responseRows(await getAllLR());
  const numericId = Number(id);
  return records.find((record) => Number(record?.id) === numericId) || null;
}

export async function getLRByCno(cnNo) {
  if (!cnNo) return null;
  const response = await API.get(
    lrEndpoints.readByCno(cnNo)
  );
  return response.data;
}

export async function getLRByConsignmentId(consignmentId) {
  if (!consignmentId) return null;
  const targetId = Number(consignmentId);
  const records = responseRows(await getAllLR());
  return records.find((record) => resolveConsignmentId(record) === targetId) || null;
}

export async function getPrefillData(savedDataSNo) {
  const response = await API.get(
    lrEndpoints.readPrefillBySavedDataSNo(savedDataSNo)
  );

  return response.data;
}

export async function updateLR(id, data) {
  const response = await API.put(
    lrEndpoints.updateById(id),
    data
  );

  return response.data;
}

export async function deleteLR(id) {
  try {
    const response = await API.delete(
      lrEndpoints.deleteById(id)
    );
    return response.data;
  } catch (error) {
    const status = error?.response?.status;
    if (status !== 404 && status !== 405) throw error;

    const fallbackResponse = await API.delete(
      lrEndpoints.deleteByIdFallback(id)
    );
    return fallbackResponse.data;
  }
}
