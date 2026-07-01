import api from "./api";

export const getAnalytics = async () => {
  const response = await api.get("/v1/locations/analytics");
  return response.data;
};

export const getMovements = async () => {
  const response = await api.get("/v1/locations/movements");
  return response.data;
};

export const getFloors = async () => {
  const response = await api.get("/v1/locations/floors");
  return response.data;
};

export const createFloor = async (data) => {
  const response = await api.post("/v1/locations/floors", data);
  return response.data;
};

export const getSections = async () => {
  const response = await api.get("/v1/locations/sections");
  return response.data;
};

export const createSection = async (data) => {
  const response = await api.post("/v1/locations/sections", data);
  return response.data;
};

export const getRacks = async () => {
  const response = await api.get("/v1/locations/racks");
  return response.data;
};

export const createRack = async (data) => {
  const response = await api.post("/v1/locations/racks", data);
  return response.data;
};

export const getShelves = async () => {
  const response = await api.get("/v1/locations/shelves");
  return response.data;
};

export const createShelf = async (data) => {
  const response = await api.post("/v1/locations/shelves", data);
  return response.data;
};

export const getShelfDetails = async (id) => {
  const response = await api.get(`/v1/locations/shelves/${id}`);
  return response.data;
};

export const assignCopy = async (data) => {
  const response = await api.post("/v1/locations/assign-copy", data);
  return response.data;
};

export const getCopyLocation = async (copyId) => {
  const response = await api.get(`/v1/locations/copies/${copyId}/location`);
  return response.data;
};
