import api from "./api";

export const getPlatformMetrics = () => {
  return api.get("/v1/platform/metrics");
};

export const getPlatformTenants = () => {
  return api.get("/v1/platform/tenants");
};

export const getPlatformIncidents = () => {
  return api.get("/v1/platform/incidents");
};

export const getExecutiveInsights = () => {
  return api.get("/v1/platform/executive-insights");
};

export const suspendTenant = (id) => {
  return api.post(`/v1/platform/tenants/${id}/suspend`);
};

export const reactivateTenant = (id) => {
  return api.post(`/v1/platform/tenants/${id}/reactivate`);
};
