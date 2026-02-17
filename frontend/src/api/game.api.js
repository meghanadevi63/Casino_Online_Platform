import api from "./axios";

export const getGames = () => {
  return api.get("/games");
};

export const getGameById = (gameId) =>
  api.get(`/games/${gameId}`);




export const checkGameEligibility = (gameId) =>
  api.get(`/games/${gameId}/eligibility`);

export const playEvenOddRound = (payload) => {
  return api.post("/games/even-odd/play", payload);
};



export const startGameSession = (gameId) => {
  return api.post(`/games/${gameId}/session/start`);
};

export const endGameSession = (sessionId) => {
  return api.post(`/games/sessions/${sessionId}/end`);
};

export const getSessionRounds = (sessionId) => {
  return api.get(`/games/history/sessions/${sessionId}`);
};