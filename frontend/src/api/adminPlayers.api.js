import api from "./axios";

export const fetchAdminPlayers = () =>
  api.get("/admin/players");

export const fetchAdminPlayerById = (playerId) =>
  api.get(`/admin/players/${playerId}`);

export const updateAdminPlayerStatus = (playerId, status) =>
  api.patch(`/admin/players/${playerId}/status`, { status });


export const fetchAdminPlayerSummary = (playerId) =>
  api.get(`/admin/players/${playerId}/summary`);
