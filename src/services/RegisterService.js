import http from "./HttpService";

export const apiEndpoint = `/api/cash-registers`;

export function getRegisters(params = "") {
  return http.get(`${apiEndpoint}${params}`);
}

export function getRegister(id) {
  return http.get(`${apiEndpoint}/${id}`);
}

export function deleteRegister(id) {}

export default {
  apiEndpoint, 
  getRegisters, 
  getRegister, 
  deleteRegister
}