import axios from "./axios";

export const getPlatformOverview = (params) =>
  axios.get("/super/analytics/overview", { params });

export const getPlatformTimeseries = (params) =>
  axios.get("/super/analytics/timeseries", { params });


export const getTenantAnalytics = () =>
  axios.get("/super/analytics/tenants");

export const getGameAnalytics = () =>
  axios.get("/super/analytics/games");
