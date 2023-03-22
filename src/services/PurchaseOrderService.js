import http from "./HttpService";

export const apiEndpoint = `/api/purchase-orders`;

export function getPurchaseOrders(params = "") {
  return http.get(`${apiEndpoint}${params}`);
}

export function getPurchaseOrder(id, params="") {
  return http.get(`${apiEndpoint}/${id}${params}`);
}
export function deletePurchaseOrder(id) {
  return http.delete(`${apiEndpoint}/${id}`);
}
export default {
  apiEndpoint, 
  getPurchaseOrders, 
  getPurchaseOrder, 
  deletePurchaseOrder, 
}