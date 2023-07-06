import http from "./HttpService";

export const apiEndpoint = `/api/parts`;

export function getParts(params = {}) {
  return http.get(`${apiEndpoint}`, {
    params: params
  });
}

export function getPartsByQuantity(params = {}) {
  return http.get(`${apiEndpoint}`, {
    params: params
  });
}

export function getPart(id) {
  return http.get(`${apiEndpoint}/${id}`);
}

export function getPartsByCategory(params = "") {
  return http.get(`${apiEndpoint}${params}`);
}

export function deleteProduct(id) {
  return http.delete(`${apiEndpoint}/${id}`);
}

export default {
  apiEndpoint, 
  getParts, 
  getPart, 
  getPartsByCategory,
  deleteProduct, 
  getPartsByQuantity
}