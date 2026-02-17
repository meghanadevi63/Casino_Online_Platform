import api from "./axios";

export const registerPlayer = (data) =>
  api.post("/auth/register", data);

export const loginPlayer = (data) =>
  api.post("/auth/login", data);

export const loginAdmin = (data) =>
  api.post("/admin/login", data);
