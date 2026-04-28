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

const CONSIGNMENT_BASE = '/api/consignment';
const ADVANCE_PAYMENT_BASE = '/api/advance-payment';

export const consignmentEndpoints = {
  create: () => withApiBase(`${CONSIGNMENT_BASE}/save`),
  readAll: () => withApiBase(`${CONSIGNMENT_BASE}/getAllData`),
  readById: (id) => withApiBase(`${CONSIGNMENT_BASE}/${id}`),
  readByCustomer: (name) => withApiBase(`${CONSIGNMENT_BASE}/byCustomer?${toQuery({ name })}`),
  updateById: (id) => withApiBase(`${CONSIGNMENT_BASE}/update/${id}`),
  deleteById: (id) => withApiBase(`${CONSIGNMENT_BASE}/${id}`),
};

export const advancePaymentEndpoints = {
  create: (consignmentId) => withApiBase(`${ADVANCE_PAYMENT_BASE}/save/${consignmentId}`),
  readByConsignmentId: (consignmentId) => withApiBase(`${ADVANCE_PAYMENT_BASE}/consignment/${consignmentId}`),
  updateById: (id) => withApiBase(`${ADVANCE_PAYMENT_BASE}/update/${id}`),
  deleteById: (id) => withApiBase(`${ADVANCE_PAYMENT_BASE}/${id}`),
};
