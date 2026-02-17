import api from "./axios";

export const fetchTenants = async () => {
  return await api.get("/tenants/");
};
