import axios from "./axios";

export const getMyGames = () => axios.get("/tenant/games");

export const updateMyGame = (gameId, data) => 
  axios.patch(`/tenant/games/${gameId}`, data);