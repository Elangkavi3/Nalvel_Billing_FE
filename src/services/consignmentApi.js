import { request } from './http.js';
import { consignmentEndpoints } from './endpoints.js';
import { normalizeConsignment, normalizeConsignments } from '../utils/consignment.js';

export async function getAllConsignments() {
  const data = await request(consignmentEndpoints.readAll());
  return normalizeConsignments(data);
}

export async function getConsignmentById(id) {
  const data = await request(consignmentEndpoints.readById(id));
  return normalizeConsignment(data);
}

export async function searchConsignmentsByCustomer(name) {
  const data = await request(consignmentEndpoints.readByCustomer(name));
  return normalizeConsignments(data);
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
