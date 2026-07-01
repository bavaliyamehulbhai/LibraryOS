import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCopies,
  getCopy,
  getCopyHistory,
  createCopy,
  bulkCreateCopies,
  issueCopy,
  returnCopy,
  reserveCopy,
  markLost,
  markDamaged,
  assignShelf,
  updateCondition
} from "../services/copyService";

export const useCopies = (params) => {
  return useQuery({
    queryKey: ["copies", params],
    queryFn: () => getCopies(params)
  });
};

export const useCopy = (id) => {
  return useQuery({
    queryKey: ["copy", id],
    queryFn: () => getCopy(id),
    enabled: !!id
  });
};

export const useCopyHistory = (id) => {
  return useQuery({
    queryKey: ["copyHistory", id],
    queryFn: () => getCopyHistory(id),
    enabled: !!id
  });
};

export const useCreateCopy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCopy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["copies"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    }
  });
};

export const useBulkCreateCopies = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkCreateCopies,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["copies"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    }
  });
};

// Creates a generic mutation wrapper to invalidate both copies and inventory after state changes
const useCopyActionMutation = (mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["copies"] });
      if (data?.data?._id) {
        queryClient.invalidateQueries({ queryKey: ["copy", data.data._id] });
        queryClient.invalidateQueries({ queryKey: ["copyHistory", data.data._id] });
      }
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    }
  });
};

export const useIssueCopy = () => useCopyActionMutation(issueCopy);
export const useReturnCopy = () => useCopyActionMutation(returnCopy);
export const useReserveCopy = () => useCopyActionMutation(reserveCopy);
export const useMarkLost = () => useCopyActionMutation(markLost);
export const useMarkDamaged = () => useCopyActionMutation(markDamaged);
export const useAssignShelf = () => useCopyActionMutation(assignShelf);
export const useUpdateCondition = () => useCopyActionMutation(updateCondition);
