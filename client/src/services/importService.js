import api from "./api";

export const uploadImportFile = async (formData) => {
  const response = await api.post("/v1/import/import", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data;
};

export const getImportProgress = async (jobId) => {
  const response = await api.get(`/v1/import/${jobId}/progress`);
  return response.data;
};

export const getImportHistory = async () => {
  const response = await api.get("/v1/import/history");
  return response.data;
};

export const getImportStats = async () => {
  const response = await api.get("/v1/import/stats");
  return response.data;
};
