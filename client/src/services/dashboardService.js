import api from "./api";

export const getDashboardMaster = async (days = 30) => {
  const response = await api.get(`/v1/dashboard/master?days=${days}`);
  return response.data;
};
