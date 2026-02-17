import api from "./axios";

export const getCurrentUser = () => {
  return api.get("/users/me");
};

export const updateProfile = (data) => api.patch("/users/me", data);
export const updatePassword = (data) => api.patch("/users/me/password", data);

