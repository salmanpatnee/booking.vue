import http from "./HttpService";

export const apiEndpoint = `/api`;

export function login() {
  return http.post(`${apiEndpoint}/login`);
}

export function logout() {
  return http.post(`${apiEndpoint}/logout`);
}

export default {
  login,
  logout
}