import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  generateSingleQR,
  generateBulkQR,
  scanQR,
  getQRStats,
  getPublicQRData,
  selfCheckoutQR,
  selfReturnQR
} from "../services/qrService";

export const useQRStats = () => useQuery({ queryKey: ["qrStats"], queryFn: getQRStats });

export const useGenerateSingleQR = () => {
  const qc = useQueryClient();
  return useMutation({ 
    mutationFn: generateSingleQR,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["qrStats"] });
      qc.invalidateQueries({ queryKey: ["copies"] });
    }
  });
};

export const useGenerateBulkQR = () => {
  const qc = useQueryClient();
  return useMutation({ 
    mutationFn: generateBulkQR,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["qrStats"] });
      qc.invalidateQueries({ queryKey: ["copies"] });
    }
  });
};

export const useScanQR = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: scanQR,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["qrStats"] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["copies"] });
    }
  });
};

export const useSelfCheckoutQR = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: selfCheckoutQR,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["qrStats"] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["copies"] });
      qc.invalidateQueries({ queryKey: ["activeTransactions"] });
    }
  });
};

export const useSelfReturnQR = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: selfReturnQR,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["qrStats"] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["copies"] });
      qc.invalidateQueries({ queryKey: ["activeTransactions"] });
    }
  });
};

export const usePublicQRData = (copyId, libraryId) => useQuery({
  queryKey: ["publicQR", copyId],
  queryFn: () => getPublicQRData(copyId, libraryId),
  enabled: !!copyId && !!libraryId,
  retry: false
});
