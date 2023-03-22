import http from "./HttpService";

export const apiEndpoint = `/api/trial-balance`;

export function getTrailBalance() {
  return http.get(apiEndpoint);
}

export default {
getTrailBalance, 
}