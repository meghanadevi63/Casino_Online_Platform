import api from "./axios";

export const fetchPendingKYC = () => {
  return api.get("/admin/kyc/pending");
};

export const fetchKYCDocument = (documentId) => {
  return api.get(`/admin/kyc/${documentId}`);
};

export const processKYC = (documentId, payload) => {
  return api.post(`/admin/kyc/${documentId}/action`, payload);
};

export const fetchKYCHistory = (userId) => {
  return api.get(`/admin/kyc/history/${userId}`);
};