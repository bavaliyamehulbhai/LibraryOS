import api from "./api";

export const generateSingle = async (data) => {
  const response = await api.post("/v1/barcode/generate", data);
  return response.data;
};

export const generateBulk = async (data) => {
  const response = await api.post("/v1/barcode/generate-bulk", data);
  return response.data;
};

export const getPrintData = async (data) => {
  const response = await api.post("/v1/barcode/print-data", data);
  return response.data;
};

export const scanBarcode = async (data) => {
  const response = await api.post("/v1/barcode/scan", data);
  return response.data;
};

export const getBarcodeStats = async () => {
  const response = await api.get("/v1/barcode/stats");
  return response.data;
};
