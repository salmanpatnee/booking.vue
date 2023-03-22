import http from "./HttpService";

export const apiEndpoint = `/api/categories`;

export function getCategories(params = "") {
  return http.get(`${apiEndpoint}${params}`);
}

export function getCategory(id) {
  return http.get(`${apiEndpoint}/${id}`);
}

export function deleteCategory(id) {
  return http.delete(`${apiEndpoint}/${id}`);
}

export default {
  apiEndpoint, 
  getCategories, 
  getCategory, 
  deleteCategory
}