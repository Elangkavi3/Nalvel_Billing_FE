import API from "./api";
import { consignmentEndpoints } from "./endpoints";
import { normalizeConsignment, normalizeConsignments } from "../utils/consignment";

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
    consignmentEndpoints.readByDateRange(
      startDate,
      endDate
    )
  );

  return normalizeConsignments(response.data);
}
