import api from "./axios";

export const getAvailableJackpots = () => api.get("/raffle/available");
export const joinJackpot = (jackpotId) => api.post(`/raffle/${jackpotId}/join`);