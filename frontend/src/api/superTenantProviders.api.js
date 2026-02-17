import axios from "./axios"; // your axios instance

export const getTenantProviders = (tenantId) =>
  axios.get(`/super/tenants/${tenantId}/providers`);

export const addTenantProvider = (tenantId, payload) =>
  axios.post(`/super/tenants/${tenantId}/providers`, payload);

export const updateTenantProvider = (tenantId, providerId, payload) =>
  axios.patch(`/super/tenants/${tenantId}/providers/${providerId}`, payload);
