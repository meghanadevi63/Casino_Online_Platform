import api from "./axios";

export const getTenantAdmins = (tenantId) =>
  api.get(`/super/tenants/${tenantId}/admins`);

export const createTenantAdmin = (tenantId, payload) =>
  api.post(`/super/tenants/${tenantId}/admins`, payload);

export const getTenantOverview = (tenantId) =>
  api.get(`/super/tenants/${tenantId}/overview`);

export const updateTenantStatus = (tenantId, payload) =>
  api.patch(`/super/tenants/${tenantId}/status`, payload);
