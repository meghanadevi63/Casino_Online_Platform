import api from "./axios";

export const getAdminWithdrawals = (status) => 
    api.get("/admin/withdrawals", { params: { status } });

export const processWithdrawalAction = (id, action, data = {}) => 
    api.post(`/admin/withdrawals/${id}/action`, { action, ...data });