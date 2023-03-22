import http from "./HttpService";

export const apiEndpoint = `/api/roles`;

export function getRoles(params = "") {
  return http.get(`${apiEndpoint}${params}`);
}

export function getRole(id) {
  return http.get(`${apiEndpoint}/${id}`);
}

export function deleteRole(id) {
  return http.delete(`${apiEndpoint}/${id}`);
}

export default {
  apiEndpoint, 
  getRoles, 
  getRole, 
  deleteRole
}