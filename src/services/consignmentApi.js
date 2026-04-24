import { request } from './http.js';
import { consignmentEndpoints } from './endpoints.js';

export async function getAllConsignments() {
  const data = await request(consignmentEndpoints.readAll());
  return Array.isArray(data) ? data : [];
}

export function getConsignmentById(id) {
  return request(consignmentEndpoints.readById(id));
}

export async function searchConsignmentsByCustomer(name) {
  const data = await request(consignmentEndpoints.readByCustomer(name));
  return Array.isArray(data) ? data : [];
}

export function saveConsignment(payload) {
  return request(consignmentEndpoints.create(), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateConsignment(id, payload) {
  if (id === undefined || id === null || id === '') {
    throw new Error('Update failed: missing consignment id');
  }

  return request(consignmentEndpoints.updateById(id), {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteConsignment(id) {
  if (id === undefined || id === null || id === '') {
    throw new Error('Delete failed: missing consignment id');
  }

  return request(consignmentEndpoints.deleteById(id), { method: 'DELETE' });
}
