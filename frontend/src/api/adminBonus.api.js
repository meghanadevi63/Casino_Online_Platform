import api from "./axios";

export const createBonus = (data) => api.post("/admin/bonuses", data);
export const getAdminBonuses = () => api.get("/admin/bonuses");
export const getActiveBonusUsage = () => api.get("/admin/bonuses/active-usage");