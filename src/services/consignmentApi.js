import API from "./api";
import { consignmentEndpoints } from "./endpoints";
import { normalizeConsignment, normalizeConsignments } from "../utils/consignment";

function resolveExportFilename(headers = {}) {
  const contentDisposition = headers["content-disposition"] || "";
  const match = contentDisposition.match(
    /filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i
  );

  const encodedName = match?.[1] || match?.[2];
  if (!encodedName) return "consignment_audit.xlsx";

  try {
    return decodeURIComponent(encodedName.trim());
  } catch {
    return encodedName.trim();
  }
}

function buildExportParams({ startDate, endDate, customerName }) {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (customerName) params.customerName = customerName;
  return params;
}

export async function getAllConsignments() {
  const response = await API.get(
    consignmentEndpoints.readAll()
  );

  return normalizeConsignments(response.data);
}

export async function getConsignmentById(id) {
  const response = await API.get(
    consignmentEndpoints.readById(id)
  );

  return normalizeConsignment(response.data);
}

export async function saveConsignment(data) {
  const response = await API.post(
    consignmentEndpoints.create(),
    data
  );

  return normalizeConsignment(response.data);
}

export async function updateConsignment(id, data) {
  const response = await API.put(
    consignmentEndpoints.updateById(id),
    data
  );

  return normalizeConsignment(response.data);
}

export async function deleteConsignment(id) {
  const response = await API.delete(
    consignmentEndpoints.deleteById(id)
  );

  return normalizeConsignments(response.data);
}

export async function searchConsignmentsByCustomer(name) {
  const response = await API.get(
    consignmentEndpoints.readByCustomer(name)
  );

  return normalizeConsignments(response.data);
}

export async function getTodayConsignments() {
  const response = await API.get(
    consignmentEndpoints.readTodaySummary()
  );

  return normalizeConsignments(response.data);
}

export async function getWeekConsignments() {
  const response = await API.get(
    consignmentEndpoints.readWeekSummary()
  );

  return normalizeConsignments(response.data);
}

export async function getMonthConsignments() {
  const response = await API.get(
    consignmentEndpoints.readMonthSummary()
  );

  return normalizeConsignments(response.data);
}

export async function getYearConsignments() {
  const response = await API.get(
    consignmentEndpoints.readYearSummary()
  );

  return normalizeConsignments(response.data);
}

export async function getConsignmentsByDateRange(
  startDate,
  endDate
) {
  const response = await API.get(
    consignmentEndpoints.readByDateRange(startDate, endDate)
  );

  return normalizeConsignments(response.data);
}

export async function getFilteredConsignments({
  mode = "all",
  from = "",
  to = "",
  gstSelected = false,
  imsSelected = false,
} = {}) {
  const params = {
    mode,
    gstSelected,
    imsSelected,
  };

  if (from) params.startDate = from;
  if (to) params.endDate = to;

  const response = await API.get(
    consignmentEndpoints.readFilteredData(params)
  );

  return normalizeConsignments(response.data);
}

export async function downloadConsignmentsExcel({
  startDate = "",
  endDate = "",
  customerName = "",
} = {}) {
  const params = buildExportParams({ startDate, endDate, customerName });
  console.log("Downloading Excel with params:", params);

  try {
    const response = await API.get(consignmentEndpoints.exportExcel(), {
      params,
      responseType: "blob",
      withCredentials: true,
    });

    console.log("Excel export response received");

    const blobData = response.data;
    const contentDisposition = response.headers["content-disposition"];
    const fileName = resolveExportFilename({ "content-disposition": contentDisposition });
    const urlBlob = window.URL.createObjectURL(blobData);
    const link = document.createElement("a");
    link.href = urlBlob;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(urlBlob);
  } catch (err) {
    console.error("Excel export failed", err);
    throw err;
  }
}
