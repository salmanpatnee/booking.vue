import http from "./HttpService";

export const apiEndpoint = `/api/locations`;

export function getLocations(params = "") {
  return http.get(`${apiEndpoint}${params}`);
}

export function getLocation(id) {
  return http.get(`${apiEndpoint}/${id}`);
}

export function deleteLocation(id) {
  return http.delete(`${apiEndpoint}/${id}`);
}

export default {
  apiEndpoint, 
  getLocations, 
  getLocation, 
  deleteLocation
}