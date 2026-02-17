import axios from "./axios";

export const getTenantGames = (tenantId) =>
  axios.get(`/super/tenants/${tenantId}/games`);

export const enableTenantGame = (tenantId, data) =>
  axios.post(`/super/tenants/${tenantId}/games`, data);

export const updateTenantGame = (tenantId, gameId, data) =>
  axios.patch(`/super/tenants/${tenantId}/games/${gameId}`, data);

export const getAllGames = () =>
  axios.get("/super/games");
