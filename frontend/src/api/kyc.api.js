import api from "./axios";

export const uploadKYC = (formData) => {
  return api.post("/kyc/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};