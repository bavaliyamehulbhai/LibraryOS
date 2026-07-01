import api from "./api";
import axios from "axios";
import { getApiUrl } from "./runtimeConfig";

export const generateSingleQR = async (data) => {
  const response = await api.post("/v1/qr/generate", data);
  return response.data;
};

export const generateBulkQR = async (data) => {
  const response = await api.post("/v1/qr/generate-bulk", data);
  return response.data;
};

export const scanQR = async (data) => {
  const response = await api.post("/v1/qr/scan", data);
  return response.data;
};

export const getQRStats = async () => {
  const response = await api.get("/v1/qr/stats");
  return response.data;
};

// Public method, might not need the auth interceptor depending on the setup.
// If the backend has public bypass, api instance might work, otherwise we use axios direct.
export const getPublicQRData = async (copyId, libraryId) => {
  // Pass libraryId as query param for tenant resolution on public routes
  const response = await axios.get(`${getApiUrl()}/v1/qr/${copyId}?libraryId=${libraryId}`);
  return response.data;
};
