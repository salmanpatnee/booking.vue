import http from "./HttpService";

export const apiEndpoint = `/api/product-exchanges`;

export function getExchanges(params = "") {
  return http.get(`${apiEndpoint}${params}`);
}

export function getExchange(id) {
  return http.get(`${apiEndpoint}/${id}`);
}

export function deleteExchange(id) {}

export default {
  apiEndpoint, 
  getExchanges, 
  getExchange, 
  deleteExchange
}