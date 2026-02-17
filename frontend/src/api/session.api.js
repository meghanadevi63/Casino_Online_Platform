import api from "./axios";

export const listSessions = () =>
  api.get("/sessions");

export const sessionRounds = (session_id) =>
  api.get(`/sessions/${session_id}/rounds`);

export const sessionBets = (session_id) =>
  api.get(`/sessions/${session_id}/bets`);
