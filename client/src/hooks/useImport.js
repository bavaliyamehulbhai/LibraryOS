import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadImportFile, getImportProgress, getImportHistory, getImportStats } from "../services/importService";

export const useUploadImport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadImportFile,
    onSuccess: () => {
      queryClient.invalidateQueries(["importHistory"]);
    }
  });
};

export const useImportProgress = (jobId) => useQuery({
  queryKey: ["importProgress", jobId],
  queryFn: () => getImportProgress(jobId),
  enabled: !!jobId,
  refetchInterval: (data) => {
    if (data?.data?.status === "COMPLETED" || data?.data?.status === "FAILED") {
      return false; // Stop polling
    }
    return 2000; // Poll every 2 seconds
  }
});

export const useImportHistory = () => useQuery({
  queryKey: ["importHistory"],
  queryFn: getImportHistory
});

export const useImportStats = () => useQuery({
  queryKey: ["importStats"],
  queryFn: getImportStats
});
