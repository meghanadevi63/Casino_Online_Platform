import axios from "./axios";


export const getTenantCountries = (tenantId) =>
  axios.get(`/super/tenants/${tenantId}/countries`);

export const addTenantCountry = (tenantId, data) =>
  axios.post(`/super/tenants/${tenantId}/countries`, data);

export const updateTenantCountry = (tenantId, countryCode, data) =>
  axios.patch(
    `/super/tenants/${tenantId}/countries/${countryCode}`,
    data
  );

export const deleteTenantCountry = (tenantId, countryCode) =>
  axios.delete(
    `/super/tenants/${tenantId}/countries/${countryCode}`
  );


export const getTenantCountryCurrencies = (
  tenantId,
  countryCode
) =>
  axios.get(
    `/super/tenants/${tenantId}/countries/${countryCode}/currencies`
  );

export const addTenantCountryCurrency = (
  tenantId,
  countryCode,
  data
) =>
  axios.post(
    `/super/tenants/${tenantId}/countries/${countryCode}/currencies`,
    data
  );

export const updateTenantCountryCurrency = (
  tenantId,
  countryCode,
  currencyId,
  params
) =>
  axios.patch(
    `/super/tenants/${tenantId}/countries/${countryCode}/currencies/${currencyId}`,
    null,
    { params }
  );
