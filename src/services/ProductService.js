import http from "./HttpService";

export const apiEndpoint = `/api/products`;

export function getProducts(params = {}) {
  return http.get(`${apiEndpoint}`, {
    params: params
  });
}

export function getProductsByQuantity(params = {}) {
  return http.get(`${apiEndpoint}`, {
    params: params
  });
}

export function getProduct(id) {
  return http.get(`${apiEndpoint}/${id}`);
}

export function getProductsByCategory(params = "") {
  return http.get(`${apiEndpoint}${params}`);
}

export function deleteProduct(id) {
  return http.delete(`${apiEndpoint}/${id}`);
}

export default {
  apiEndpoint, 
  getProducts, 
  getProduct, 
  getProductsByCategory,
  deleteProduct, 
  getProductsByQuantity
}