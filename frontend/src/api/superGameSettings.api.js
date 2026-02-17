import axios from "./axios";


export const getGameCountries = (gameId) => 
  axios.get(`/super/games/${gameId}/countries`);

export const updateGameCountry = (gameId, countryCode, isAllowed) => 
  axios.patch(`/super/games/${gameId}/countries/${countryCode}`, { is_allowed: isAllowed });


export const getGameCurrencies = (gameId) => 
  axios.get(`/super/games/${gameId}/currencies`);

export const updateGameCurrency = (gameId, currencyId, isAllowed) => 
  axios.patch(`/super/games/${gameId}/currencies/${currencyId}`, { is_allowed: isAllowed });