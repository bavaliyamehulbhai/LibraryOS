import api from "./api";

export const getInventory = async () => {
  const response = await api.get("/v1/inventory");
  return response.data;
};

export const getInventoryStats = async () => {
  const response = await api.get("/v1/inventory/stats");
  return response.data;
};

export const getInventoryHistory = async (bookId) => {
  const url = bookId ? `/v1/inventory/history?bookId=${bookId}` : "/v1/inventory/history";
  const response = await api.get(url);
  return response.data;
};

export const getInventoryByBook = async (bookId) => {
  const response = await api.get(`/v1/inventory/${bookId}`);
  return response.data;
};

export const addStock = async (data) => {
  const response = await api.post("/v1/inventory/add-stock", data);
  return response.data;
};

export const removeStock = async (data) => {
  const response = await api.post("/v1/inventory/remove-stock", data);
  return response.data;
};

export const issueBook = async (data) => {
  const response = await api.post("/v1/inventory/issue", data);
  return response.data;
};

export const returnBook = async (data) => {
  const response = await api.post("/v1/inventory/return", data);
  return response.data;
};

export const reserveBook = async (data) => {
  const response = await api.post("/v1/inventory/reserve", data);
  return response.data;
};

export const markDamaged = async (data) => {
  const response = await api.post("/v1/inventory/damaged", data);
  return response.data;
};

export const markLost = async (data) => {
  const response = await api.post("/v1/inventory/lost", data);
  return response.data;
};
