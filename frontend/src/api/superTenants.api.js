import axios from "./axios";


export const createSuperTenant = (data) =>
  axios.post("/super/tenants", data);

export const fetchSuperTenants = () =>
  axios.get("/super/tenants");

export const fetchSuperTenantById = (tenantId) =>
  axios.get(`/super/tenants/${tenantId}`);

export const updateSuperTenant = (tenantId, data) =>
  axios.patch(`/super/tenants/${tenantId}`, data);

