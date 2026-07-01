import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

const getAuditLogs = async (params) => {
  const { data } = await api.get("/v1/audit/logs", { params });
  return data;
};

const getActivityLogs = async () => {
  const { data } = await api.get("/v1/audit/activity");
  return data;
};

const getSecurityLogs = async () => {
  const { data } = await api.get("/v1/audit/security");
  return data;
};

const getComplianceReport = async () => {
  const { data } = await api.get("/v1/audit/compliance-report");
  return data;
};

const getAuditStats = async () => {
  const { data } = await api.get("/v1/audit/stats");
  return data;
};

export const useAuditLogs = (params) => useQuery({
  queryKey: ["auditLogs", params],
  queryFn: () => getAuditLogs(params),
  keepPreviousData: true
});

export const useActivityLogs = () => useQuery({
  queryKey: ["activityLogs"],
  queryFn: getActivityLogs
});

export const useSecurityLogs = () => useQuery({
  queryKey: ["securityLogs"],
  queryFn: getSecurityLogs
});

export const useComplianceReport = () => useQuery({
  queryKey: ["complianceReport"],
  queryFn: getComplianceReport
});

export const useAuditStats = () => useQuery({
  queryKey: ["auditStats"],
  queryFn: getAuditStats
});
