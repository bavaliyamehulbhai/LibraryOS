import api from "./api";

export const getBooks = async (params) => {
  const response = await api.get("/v1/books", { params });
  return response.data;
};

export const getBookById = async (id) => {
  const response = await api.get(`/v1/books/${id}`);
  return response.data;
};

export const createBook = async (data) => {
  const response = await api.post("/v1/books", data);
  return response.data;
};

export const updateBook = async ({ id, data }) => {
  const response = await api.put(`/v1/books/${id}`, data);
  return response.data;
};

export const deleteBook = async (id) => {
  const response = await api.delete(`/v1/books/${id}`);
  return response.data;
};

export const getIsbnStats = async () => {
  const response = await api.get("/v1/books/isbn-stats");
  return response.data;
};

export const fetchExternalIsbn = async (isbn) => {
  const response = await api.get(`/v1/books/external-isbn/${isbn}`);
  return response.data;
};
