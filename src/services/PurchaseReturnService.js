import http from "./HttpService";

export const apiEndpoint = `/api/purchase-returns`;

export function getPurchaseReturns(params = "") {
  return http.get(`${apiEndpoint}${params}`);
}

export function getPurchaseReturn(id) {
  return http.get(`${apiEndpoint}/${id}`);
}

export function deletePurchaseReturn(id) {}

export default {
  apiEndpoint,
  getPurchaseReturns,
  getPurchaseReturn,
  deletePurchaseReturn,
};
