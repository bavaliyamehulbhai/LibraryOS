import api from "./api";

export const requestExport = async (data) => {
  const response = await api.post("/v1/export", data);
  return response.data;
};

export const getExportProgress = async (jobId) => {
  const response = await api.get(`/v1/export/${jobId}/progress`);
  return response.data;
};

export const getExportHistory = async () => {
  const response = await api.get("/v1/export/history");
  return response.data;
};

export const scheduleExport = async (data) => {
  const response = await api.post("/v1/export/scheduled", data);
  return response.data;
};

export const getScheduledExports = async () => {
  const response = await api.get("/v1/export/scheduled");
  return response.data;
};

export const getExportStats = async () => {
  const response = await api.get("/v1/export/stats");
  return response.data;
};
