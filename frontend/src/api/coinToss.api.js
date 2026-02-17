import api from "./axios";

export const playCoinToss = (data) =>
  api.post("/games/coin-toss/play", data);
