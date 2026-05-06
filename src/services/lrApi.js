import API from "./api";
import { lrEndpoints } from "./endpoints";

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
  const response = await API.get(
    lrEndpoints.readById(id)
  );

  return response.data;
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
  const response = await API.delete(
    lrEndpoints.deleteById(id)
  );

  return response.data;
}