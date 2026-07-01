import { useQuery } from "@tanstack/react-query";
import { getDashboardMaster } from "../services/dashboardService";

export const useDashboardMaster = () => useQuery({
  queryKey: ["dashboard", "master"],
  queryFn: getDashboardMaster,
  refetchInterval: 300000 // Refetch every 5 minutes automatically
});
