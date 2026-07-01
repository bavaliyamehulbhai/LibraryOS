import api from "./api";

export const getDashboardMaster = async () => {
  const response = await api.get("/v1/dashboard/master");
  return response.data;
};
