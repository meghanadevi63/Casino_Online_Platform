import api from "./axios";

export const getWalletsByPlayerId = (playerId) => {
  return api.get(`/wallets/${playerId}`);
};

export const depositToWallet = (amount) => {
  return api.post("/wallets/deposit", {
    amount,
  });
};


export const withdrawRequest = (amount) => api.post("/wallets/withdraw", { amount });


export const getMyWithdrawals = () => api.get("/wallets/withdrawals/me");



export const getTransactionHistory = (params) => api.get("/wallets/transactions/me", { params });