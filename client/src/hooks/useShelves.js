import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAnalytics,
  getMovements,
  getFloors,
  createFloor,
  getSections,
  createSection,
  getRacks,
  createRack,
  getShelves,
  createShelf,
  getShelfDetails,
  assignCopy,
  getCopyLocation
} from "../services/shelfService";

export const useShelfAnalytics = () => useQuery({ queryKey: ["shelfAnalytics"], queryFn: getAnalytics });
export const useShelfMovements = () => useQuery({ queryKey: ["shelfMovements"], queryFn: getMovements });

export const useFloors = () => useQuery({ queryKey: ["floors"], queryFn: getFloors });
export const useCreateFloor = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createFloor, onSuccess: () => qc.invalidateQueries({ queryKey: ["floors"] }) });
};

export const useSections = () => useQuery({ queryKey: ["sections"], queryFn: getSections });
export const useCreateSection = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createSection, onSuccess: () => qc.invalidateQueries({ queryKey: ["sections"] }) });
};

export const useRacks = () => useQuery({ queryKey: ["racks"], queryFn: getRacks });
export const useCreateRack = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createRack, onSuccess: () => qc.invalidateQueries({ queryKey: ["racks"] }) });
};

export const useShelves = () => useQuery({ queryKey: ["shelves"], queryFn: getShelves });
export const useCreateShelf = () => {
  const qc = useQueryClient();
  return useMutation({ 
    mutationFn: createShelf, 
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shelves"] });
      qc.invalidateQueries({ queryKey: ["shelfAnalytics"] });
    }
  });
};

export const useShelfDetails = (id) => useQuery({
  queryKey: ["shelf", id],
  queryFn: () => getShelfDetails(id),
  enabled: !!id
});

export const useAssignCopy = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: assignCopy,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shelves"] });
      qc.invalidateQueries({ queryKey: ["shelf"] });
      qc.invalidateQueries({ queryKey: ["shelfAnalytics"] });
      qc.invalidateQueries({ queryKey: ["shelfMovements"] });
      qc.invalidateQueries({ queryKey: ["copies"] });
      qc.invalidateQueries({ queryKey: ["copy"] });
    }
  });
};

export const useCopyLocation = (copyId) => useQuery({
  queryKey: ["copyLocation", copyId],
  queryFn: () => getCopyLocation(copyId),
  enabled: !!copyId
});
