import { request } from './http.js';

const API_BASE = '/api/consignment';

export async function getAllConsignments() {
  const data = await request(`${API_BASE}/getAllData`);
  return Array.isArray(data) ? data : [];
}

export async function searchConsignmentsByCustomer(name) {
  const data = await request(`${API_BASE}/byCustomer?name=${encodeURIComponent(name)}`);
  return Array.isArray(data) ? data : [];
}

export function saveConsignment(payload) {
  return request(`${API_BASE}/save`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateConsignment(id, payload) {
  return request(`${API_BASE}/update/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteConsignment(id) {
  return request(`${API_BASE}/${id}`, { method: 'DELETE' });
}
