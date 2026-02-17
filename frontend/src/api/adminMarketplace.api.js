import axios from "./axios";

export const getMarketplaceGames = () => 
  axios.get("/tenant/marketplace");


export const addGameToLibrary = (data) => 
  axios.post("/tenant/marketplace/add", data);

export const requestAccess = (payload) =>
  axios.post("/tenant/marketplace/request-access", payload);

export const getMyRequests = () => 
  axios.get("/tenant/marketplace/requests");