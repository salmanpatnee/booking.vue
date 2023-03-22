import http from "./HttpService";

export const apiEndpoint = `/api/sales-returns`;

export function getSaleReturns(params = "") {
  return http.get(`${apiEndpoint}${params}`);
}

export function getSaleReturn(id) {
  return http.get(`${apiEndpoint}/${id}`);
}

export function deleteSaleReturn(id) {}

export default {
  apiEndpoint, 
  getSaleReturns, 
  getSaleReturn, 
  deleteSaleReturn
}