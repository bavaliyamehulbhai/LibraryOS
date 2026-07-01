import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  generateSingle,
  generateBulk,
  getPrintData,
  scanBarcode,
  getBarcodeStats
} from "../services/barcodeService";

export const useBarcodeStats = () => useQuery({ queryKey: ["barcodeStats"], queryFn: getBarcodeStats });

export const useGenerateSingle = () => {
  return useMutation({ mutationFn: generateSingle });
};

export const useGenerateBulk = () => {
  return useMutation({ mutationFn: generateBulk });
};

export const usePrintData = () => {
  return useMutation({ mutationFn: getPrintData });
};

export const useScanBarcode = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: scanBarcode,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["barcodeStats"] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["copies"] });
    }
  });
};
