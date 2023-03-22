import http from "./HttpService";

export const apiEndpoint = `/api/expenses`;

export function getExpenses(params = "") {
  return http.get(`${apiEndpoint}${params}`);
}

export function getExpense(id) {
  return http.get(`${apiEndpoint}/${id}`);
}

export function deleteExpense(id) {
  return http.delete(`${apiEndpoint}/${id}`);
}

export default {
  apiEndpoint, 
  getExpenses, 
  getExpense, 
  deleteExpense
}