import api from "./api";

export const getPublishers = async (params) => {
  const response = await api.get("/v1/publishers", { params });
  return response.data;
};

export const getPublisherById = async (id) => {
  const response = await api.get(`/v1/publishers/${id}`);
  return response.data;
};

export const createPublisher = async (data) => {
  const response = await api.post("/v1/publishers", data);
  return response.data;
};

export const updatePublisher = async ({ id, data }) => {
  const response = await api.put(`/v1/publishers/${id}`, data);
  return response.data;
};

export const deletePublisher = async (id) => {
  const response = await api.delete(`/v1/publishers/${id}`);
  return response.data;
};

export const getPublisherStats = async (id) => {
  const response = await api.get(`/v1/publishers/${id}/stats`);
  return response.data;
};
