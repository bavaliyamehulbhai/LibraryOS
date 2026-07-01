import api from "./api";

const getSecurityMetrics = async () => {
  const { data } = await api.get("/v1/security/dashboard");
  return data;
};

const getSecurityAlerts = async () => {
  const { data } = await api.get("/v1/security/alerts");
  return data;
};

const getLoginActivity = async () => {
  const { data } = await api.get("/v1/security/activity");
  return data;
};

const getLoginTrends = async () => {
  const { data } = await api.get("/v1/security/trends");
  return data;
};

const securityService = {
  getSecurityMetrics,
  getSecurityAlerts,
  getLoginActivity,
  getLoginTrends
};

export default securityService;
