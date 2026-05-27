import API from "./api";
import { userEndpoints } from "./endpoints";

export async function registerUser(data) {
  const response = await API.post(userEndpoints.register(), data);
  return response.data;
}

export async function resetUserPassword(data) {
  const response = await API.post(userEndpoints.resetPassword(), data);
  return response.data;
}
