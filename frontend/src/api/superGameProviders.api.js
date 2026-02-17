import axios from "./axios";

export const getGameProviders = () =>
  axios.get("/super/game-providers");

export const createGameProvider = (data) =>
  axios.post("/super/game-providers", data);

export const updateGameProvider = (providerId, data) =>
  axios.patch(`/super/game-providers/${providerId}`, data);

export const getProviderGames = (providerId) => 
  axios.get(`/super/providers/${providerId}/games`);