import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  requestExport, 
  getExportProgress, 
  getExportHistory, 
  scheduleExport, 
  getScheduledExports, 
  getExportStats 
} from "../services/exportService";

export const useRequestExport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: requestExport,
    onSuccess: () => {
      queryClient.invalidateQueries(["exportHistory"]);
      queryClient.invalidateQueries(["exportStats"]);
    }
  });
};

export const useExportProgress = (jobId) => useQuery({
  queryKey: ["exportProgress", jobId],
  queryFn: () => getExportProgress(jobId),
  enabled: !!jobId,
  refetchInterval: (data) => {
    if (data?.data?.status === "COMPLETED" || data?.data?.status === "FAILED") {
      return false;
    }
    return 2000;
  }
});

export const useExportHistory = () => useQuery({
  queryKey: ["exportHistory"],
  queryFn: getExportHistory
});

export const useScheduleExport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: scheduleExport,
    onSuccess: () => {
      queryClient.invalidateQueries(["scheduledExports"]);
    }
  });
};

export const useScheduledExports = () => useQuery({
  queryKey: ["scheduledExports"],
  queryFn: getScheduledExports
});

export const useExportStats = () => useQuery({
  queryKey: ["exportStats"],
  queryFn: getExportStats
});
