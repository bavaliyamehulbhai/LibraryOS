import api from "./api";

export const getCopies = async (params) => {
  const response = await api.get("/v1/copies", { params });
  return response.data;
};

export const getCopy = async (id) => {
  const response = await api.get(`/v1/copies/${id}`);
  return response.data;
};

export const getCopyHistory = async (id) => {
  const response = await api.get(`/v1/copies/${id}/history`);
  return response.data;
};

export const createCopy = async (data) => {
  const response = await api.post("/v1/copies", data);
  return response.data;
};

export const bulkCreateCopies = async (data) => {
  const response = await api.post("/v1/copies/bulk", data);
  return response.data;
};

export const issueCopy = async (data) => {
  const response = await api.post("/v1/copies/issue", data);
  return response.data;
};

export const returnCopy = async (data) => {
  const response = await api.post("/v1/copies/return", data);
  return response.data;
};

export const reserveCopy = async (data) => {
  const response = await api.post("/v1/copies/reserve", data);
  return response.data;
};

export const markLost = async (data) => {
  const response = await api.post("/v1/copies/lost", data);
  return response.data;
};

export const markDamaged = async (data) => {
  const response = await api.post("/v1/copies/damaged", data);
  return response.data;
};

export const assignShelf = async ({ id, data }) => {
  const response = await api.put(`/v1/copies/${id}/shelf`, data);
  return response.data;
};

export const updateCondition = async ({ id, data }) => {
  const response = await api.put(`/v1/copies/${id}/condition`, data);
  return response.data;
};
