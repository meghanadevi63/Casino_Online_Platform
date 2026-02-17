import api from "./axios";

export const createJackpot = (data) => api.post("/admin/raffle", data);
export const getAdminJackpots = () => api.get("/admin/raffle");
export const triggerDraw = (jackpotId) => api.post(`/admin/raffle/${jackpotId}/draw`);

//   Fetch currencies allowed only for this admin's tenant
export const getTenantCurrencies = () => api.get("/admin/raffle/currencies");

//  Cancel a jackpot and trigger automatic player refunds
export const cancelJackpot = (jackpotId) => api.delete(`/admin/raffle/${jackpotId}`);