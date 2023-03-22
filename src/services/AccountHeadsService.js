import http from "./HttpService";

export const apiEndpoint = `/api/account-heads`;

export function getHeads(params = "") {
  return http.get(`${apiEndpoint}${params}`);
}

export function getHead(id) {
  return http.get(`${apiEndpoint}/${id}`);
}


export default {
  apiEndpoint, 
  getHeads, 
  getHead, 
}