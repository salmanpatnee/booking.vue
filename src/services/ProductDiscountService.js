import http from "./HttpService";

export const apiEndpoint = `/api/discounts`;

export function getProductDiscounts(params = "") {
  return http.get(`${apiEndpoint}${params}`);
}

export function getProductDiscount(id) {
  return http.get(`${apiEndpoint}/${id}`);
}

export default {
  apiEndpoint, 
  getProductDiscounts, 
  getProductDiscount, 
}