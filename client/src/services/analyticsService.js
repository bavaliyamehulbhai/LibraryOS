import api from "./api";

export const getDashboardAnalytics = async () => {
  const response = await api.get("/v1/analytics/dashboard");
  return response.data;
};

export const getBookAnalytics = async () => {
  const response = await api.get("/v1/analytics/books");
  return response.data;
};

export const getCategoryAnalytics = async () => {
  const response = await api.get("/v1/analytics/categories");
  return response.data;
};

export const getInventoryAnalytics = async () => {
  const response = await api.get("/v1/analytics/inventory");
  return response.data;
};

export const getTrendAnalytics = async () => {
  const response = await api.get("/v1/analytics/trends");
  return response.data;
};

export const getExecutiveReport = async () => {
  const response = await api.get("/v1/analytics/executive-report");
  return response.data;
};
