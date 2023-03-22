import http from "./HttpService";

export const apiEndpoint = `/api/expense-types`;

export function getTypes(params = "") {
  return http.get(`${apiEndpoint}${params}`);
}

export function getType(id) {
  return http.get(`${apiEndpoint}/${id}`);
}

export function deleteType(id) {
  return http.delete(`${apiEndpoint}/${id}`);
}

export default {
  apiEndpoint, 
  getTypes, 
  getType, 
  deleteType
}