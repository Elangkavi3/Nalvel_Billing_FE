const configuredBase = (import.meta.env.VITE_API_BASE_URL || '').trim();

function stripTrailingSlash(value) {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

function stripLeadingSlash(value) {
  return value.startsWith('/') ? value.slice(1) : value;
}

function withApiBase(path) {
  if (!configuredBase) return path;

  const base = stripTrailingSlash(configuredBase);
  const normalizedPath = stripLeadingSlash(path);
  return `${base}/${normalizedPath}`;
}

function toQuery(params) {
  return new URLSearchParams(params).toString();
}

const CONSIGNMENT_BASE = '/api/billing/consignment';
const ADVANCE_PAYMENT_BASE = '/api/billing/advance-payment';
const LR_BASE = '/api/billing/lr';

export const consignmentEndpoints = {
  create: () => withApiBase(`${CONSIGNMENT_BASE}/save`),
  readAll: () => withApiBase(`${CONSIGNMENT_BASE}/getAllData`),
  readById: (id) => withApiBase(`${CONSIGNMENT_BASE}/${id}`),
  readByCustomer: (name) => withApiBase(`${CONSIGNMENT_BASE}/byCustomer?${toQuery({ name })}`),
  updateById: (id) => withApiBase(`${CONSIGNMENT_BASE}/update/${id}`),
  deleteById: (id) => withApiBase(`${CONSIGNMENT_BASE}/${id}`),
  readByDateRange: (startDate, endDate) => withApiBase(`${CONSIGNMENT_BASE}/filter?${toQuery({ startDate, endDate })}`),
  readTodaySummary: () => withApiBase(`${CONSIGNMENT_BASE}/today`),
  readWeekSummary: () => withApiBase(`${CONSIGNMENT_BASE}/week`),
  readMonthSummary: () => withApiBase(`${CONSIGNMENT_BASE}/month`),
  readYearSummary: () => withApiBase(`${CONSIGNMENT_BASE}/year`),
};

export const advancePaymentEndpoints = {
  create: (consignmentId) => withApiBase(`${ADVANCE_PAYMENT_BASE}/save/${consignmentId}`),
  readByConsignmentId: (consignmentId) => withApiBase(`${ADVANCE_PAYMENT_BASE}/consignment/${consignmentId}`),
  updateById: (id) => withApiBase(`${ADVANCE_PAYMENT_BASE}/update/${id}`),
  deleteById: (id) => withApiBase(`${ADVANCE_PAYMENT_BASE}/${id}`),
};

export const lrEndpoints = {
  create: () => withApiBase(`${LR_BASE}/save`),
  readAll: () => withApiBase(`${LR_BASE}/allData`),
  readById: (id) => withApiBase(`${LR_BASE}/${id}`),
  readPrefillBySavedDataSNo: (savedDataSNo) => withApiBase(`${LR_BASE}/prefill/${encodeURIComponent(savedDataSNo)}`),
  readByConsignmentId: (consignmentId) => withApiBase(`${LR_BASE}/by-consignment/${consignmentId}`),
  updateById: (id) => withApiBase(`${LR_BASE}/update/${id}`),
  deleteById: (id) => withApiBase(`${LR_BASE}/delete/${id}`),
};
