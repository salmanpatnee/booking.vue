import http from "./HttpService";

export const apiEndpoint = `/api/brands`;

export function getBrands(params = "") {
  return http.get(`${apiEndpoint}${params}`);
}

export function getBrand(id) {
  return http.get(`${apiEndpoint}/${id}`);
}

export function deleteBrand(id) {
  return http.delete(`${apiEndpoint}/${id}`);
}

export default {
  apiEndpoint, 
  getBrands, 
  getBrand, 
  deleteBrand
}