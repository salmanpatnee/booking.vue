import http from "./HttpService";

export const apiEndpoint = `/api/users`;

export function getUsers(params = "") {
  return http.get(`${apiEndpoint}${params}`);
}

export function getUser(id) {
  return http.get(`${apiEndpoint}/${id}`);
}

export function deleteUser(id) {
  return http.delete(`${apiEndpoint}/${id}`);
}

export default {
  apiEndpoint,
  getUsers,
  getUser,
  deleteUser,
};
