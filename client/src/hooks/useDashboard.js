import { useQuery } from "@tanstack/react-query";
import { getDashboardMaster } from "../services/dashboardService";

export const useDashboardMaster = (days = 30) => useQuery({
  queryKey: ["dashboard", "master", days],
  queryFn: () => getDashboardMaster(days),
  refetchInterval: 300000 // Refetch every 5 minutes automatically
});
