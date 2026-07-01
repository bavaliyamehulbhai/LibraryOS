import api from "./api";

export const getAuthors = async (params) => {
  const response = await api.get("/v1/authors", { params });
  return response.data;
};

export const getAuthorById = async (id) => {
  const response = await api.get(`/v1/authors/${id}`);
  return response.data;
};

export const createAuthor = async (data) => {
  const response = await api.post("/v1/authors", data);
  return response.data;
};

export const updateAuthor = async ({ id, data }) => {
  const response = await api.put(`/v1/authors/${id}`, data);
  return response.data;
};

export const deleteAuthor = async (id) => {
  const response = await api.delete(`/v1/authors/${id}`);
  return response.data;
};

export const getAuthorStats = async (id) => {
  const response = await api.get(`/v1/authors/${id}/stats`);
  return response.data;
};
