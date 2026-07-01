import api from "./api";

export const globalSearch = async (query) => {
  const response = await api.get(`/v1/search?q=${encodeURIComponent(query)}`);
  return response.data;
};

export const bookSearch = async (query, filters = {}) => {
  const params = new URLSearchParams();
  if (query) params.append("q", query);
  if (filters.category) params.append("category", filters.category);
  if (filters.author) params.append("author", filters.author);
  if (filters.publisher) params.append("publisher", filters.publisher);
  
  const response = await api.get(`/v1/search/books?${params.toString()}`);
  return response.data;
};

export const authorSearch = async (query) => {
  const response = await api.get(`/v1/search/authors?q=${encodeURIComponent(query)}`);
  return response.data;
};

export const publisherSearch = async (query) => {
  const response = await api.get(`/v1/search/publishers?q=${encodeURIComponent(query)}`);
  return response.data;
};

export const copySearch = async (query) => {
  const response = await api.get(`/v1/search/copies?q=${encodeURIComponent(query)}`);
  return response.data;
};

export const shelfSearch = async (query) => {
  const response = await api.get(`/v1/search/shelves?q=${encodeURIComponent(query)}`);
  return response.data;
};

export const getSuggestions = async (query) => {
  const response = await api.get(`/v1/search/suggestions?q=${encodeURIComponent(query)}`);
  return response.data;
};

export const getSearchStats = async () => {
  const response = await api.get(`/v1/search/stats`);
  return response.data;
};
