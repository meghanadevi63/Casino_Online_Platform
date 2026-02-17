import axios from "./axios";



/*
  Get global games catalog
  GET /super/games
 */
export const getSuperGames = () => {
  return axios.get("/super/games");
};

/*
  Create new global game
  POST /super/games
 */
export const createSuperGame = (data) => {
  return axios.post("/super/games", data);
};


export const updateSuperGame = (gameId, data) =>
  axios.patch(`/super/games/${gameId}`, data);




