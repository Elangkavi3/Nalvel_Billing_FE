import { request } from './http.js';
import { advancePaymentEndpoints } from './endpoints.js';

export async function getAdvancePaymentsByConsignmentId(consignmentId) {
  if (!consignmentId) return [];

  const data = await request(advancePaymentEndpoints.readByConsignmentId(consignmentId));
  return Array.isArray(data) ? data : [];
}

export function saveAdvancePayment(consignmentId, payload) {
  return request(advancePaymentEndpoints.create(consignmentId), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateAdvancePayment(id, payload) {
  return request(advancePaymentEndpoints.updateById(id), {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteAdvancePayment(id) {
  return request(advancePaymentEndpoints.deleteById(id), { method: 'DELETE' });
}
