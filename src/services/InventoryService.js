import http from "./HttpService";

export const apiEndpoint = `/api/product-inventory-entries`;

export function getInventories(params = "") {
  return http.get(`${apiEndpoint}${params}`);
}

export function getInventroy(id) {
  return http.get(`${apiEndpoint}/${id}`);
}

export default {
  apiEndpoint, 
  getInventories, 
  getInventroy, 
}