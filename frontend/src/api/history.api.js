import api from "./axios";

/* Get my game sessions*/
export const getMySessions = () => {
  return api.get("/games/history/sessions");
};

/*Get rounds for a session*/
export const getSessionRounds = (sessionId) => {
  return api.get(`/games/history/sessions/${sessionId}`);
};

/* Get bets for a session*/
export const getSessionBets = (sessionId) => {
  return api.get(`/games/history/sessions/${sessionId}/bets`);
};
