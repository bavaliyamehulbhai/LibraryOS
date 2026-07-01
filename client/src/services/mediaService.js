import api from "./api";

export const getGallery = async (params) => {
  const response = await api.get("/v1/media/gallery", { params });
  return response.data;
};

export const getCoverStats = async () => {
  const response = await api.get("/v1/media/cover-stats");
  return response.data;
};

export const uploadCover = async (bookId, formData) => {
  const response = await api.post(`/v1/media/${bookId}/upload-cover`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data;
};

export const replaceCover = async (bookId, formData) => {
  const response = await api.put(`/v1/media/${bookId}/replace-cover`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data;
};

export const removeCover = async (bookId) => {
  const response = await api.delete(`/v1/media/${bookId}/remove-cover`);
  return response.data;
};
