import API from "./api";
import { advancePaymentEndpoints } from "./endpoints";

export async function saveAdvancePayment(
  consignmentId,
  data
) {
  const response = await API.post(
    advancePaymentEndpoints.create(consignmentId),
    data
  );

  return response.data;
}

export async function getAdvancePaymentsByConsignmentId(
  consignmentId
) {
  const response = await API.get(
    advancePaymentEndpoints.readByConsignmentId(
      consignmentId
    )
  );

  return response.data;
}

export async function updateAdvancePayment(id, data) {
  const response = await API.put(
    advancePaymentEndpoints.updateById(id),
    data
  );

  return response.data;
}

export async function deleteAdvancePayment(id) {
  const response = await API.delete(
    advancePaymentEndpoints.deleteById(id)
  );

  return response.data;
}