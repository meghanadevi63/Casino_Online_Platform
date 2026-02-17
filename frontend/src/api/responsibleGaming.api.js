import axios from "./axios";

export const getResponsibleLimits = () => {
  return axios.get("/responsible-gaming/limits");
};

export const setResponsibleLimits = (data) => {
  return axios.post("/responsible-gaming/limits", data);
};

export const selfExclude = (data) => {
  return axios.post("/responsible-gaming/self-exclude", data);
};

export const getResponsibleLimitsUsage = () => {
  return axios.get("/responsible-gaming/limits/usage");
};
