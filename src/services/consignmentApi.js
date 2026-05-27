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

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getStartOfWeek(date) {
  const start = new Date(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

function resolveDateRangeByMode(mode) {
  const now = new Date();
  if (mode === "today") {
    const today = formatDateKey(now);
    return { startDate: today, endDate: today };
  }

  if (mode === "week") {
    const start = getStartOfWeek(now);
    return { startDate: formatDateKey(start), endDate: formatDateKey(now) };
  }

  if (mode === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { startDate: formatDateKey(start), endDate: formatDateKey(now) };
  }

  if (mode === "year") {
    const start = new Date(now.getFullYear(), 0, 1);
    return { startDate: formatDateKey(start), endDate: formatDateKey(now) };
  }

  return { startDate: "", endDate: "" };
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

export async function searchConsignments({
  customerName = "",
  truckOwnerName = "",
  driverName = "",
  gstNo = "",
  imsNo = "",
  billingType = "",
  startDate = "",
  endDate = "",
} = {}) {
  const params = {};
  if (customerName) params.customerName = customerName;
  if (truckOwnerName) params.truckOwnerName = truckOwnerName;
  if (driverName) params.driverName = driverName;
  if (gstNo) params.gstNo = gstNo;
  if (imsNo) params.imsNo = imsNo;
  if (billingType) params.billingType = billingType;
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await API.get(
    consignmentEndpoints.search(),
    { params }
  );

  return normalizeConsignments(response.data);
}

export async function searchConsignmentsByCustomer(name) {
  return searchConsignments({ customerName: name });
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
  const response = await API.get(consignmentEndpoints.search(), {
    params: { startDate, endDate },
  });

  return normalizeConsignments(response.data);
}

export async function getFilteredConsignments({
  mode = "all",
  from = "",
  to = "",
  gstSelected = false,
  imsSelected = false,
  customerName = "",
  truckOwnerName = "",
  driverName = "",
  gstNo = "",
  imsNo = "",
  billingType = "",
} = {}) {
  const params = {};

  if (customerName) params.customerName = customerName;

  if (from) params.startDate = from;
  if (to) params.endDate = to;
  if (customerName) params.customerName = customerName;
  if (truckOwnerName) params.truckOwnerName = truckOwnerName;
  if (driverName) params.driverName = driverName;
  if (gstNo) params.gstNo = gstNo;
  if (imsNo) params.imsNo = imsNo;
  if (billingType) params.billingType = billingType;

  if (!from && !to && mode && mode !== "all" && mode !== "range") {
    const { startDate, endDate } = resolveDateRangeByMode(mode);
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
  }

  if (gstSelected && !imsSelected) params.billingType = "GST";
  if (imsSelected && !gstSelected) params.billingType = "IMS";

  const response = await API.get(consignmentEndpoints.search(), { params });

  return normalizeConsignments(response.data);
}

export async function downloadConsignmentsExcel({
  startDate = "",
  endDate = "",
  customerName = "",
  billingType = "",
} = {}) {
  const params = buildExportParams({ startDate, endDate, customerName });
  if (billingType) params.billingType = billingType;
 

  try {
    const response = await API.get(consignmentEndpoints.exportExcel(), {
      params,
      responseType: "blob",
      withCredentials: true,
    });

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
    throw err;
  }
}
