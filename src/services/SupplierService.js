import http from "./HttpService";

// export const apiEndpoint = `/api/accounts`;
export const apiEndpoint = `/api/suppliers`;

export function getSuppliers(params = "") {
  return http.get(`${apiEndpoint}${params}`);
}

export function getSupplier(id) {
  return http.get(`${apiEndpoint}/${id}`);
}
export function deleteSupplier(id) {
  return http.delete(`${apiEndpoint}/${id}`);
}
export function getLedger(id, params = "") {
  return http.get(`${apiEndpoint}/${id}/ledger${params}`);
}

export default {
  apiEndpoint, 
  getSuppliers, 
  getSupplier, 
  deleteSupplier, 
  getLedger
}