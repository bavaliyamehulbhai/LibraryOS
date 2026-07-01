import api from "./api";

export const getCategories = async (params) => {
  const response = await api.get("/v1/categories", { params });
  return response.data;
};

export const getCategoryById = async (id) => {
  const response = await api.get(`/v1/categories/${id}`);
  return response.data;
};

export const createCategory = async (data) => {
  const response = await api.post("/v1/categories", data);
  return response.data;
};

export const updateCategory = async ({ id, data }) => {
  const response = await api.put(`/v1/categories/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/v1/categories/${id}`);
  return response.data;
};

export const getCategoryStats = async (id) => {
  const response = await api.get(`/v1/categories/${id}/stats`);
  return response.data;
};
