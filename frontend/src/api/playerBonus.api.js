import api from "./axios";

export const getMyBonuses = () => api.get("/bonuses/my-progress");
export const claimBonus = (usageId) => api.post(`/bonuses/claim/${usageId}`);

export const cancelBonus = (usageId) => api.post(`/bonuses/cancel/${usageId}`); 