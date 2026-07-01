import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getInventory,
  getInventoryStats,
  getInventoryHistory,
  getInventoryByBook,
  addStock,
  removeStock,
  issueBook,
  returnBook,
  reserveBook,
  markDamaged,
  markLost
} from "../services/inventoryService";

export const useInventoryList = () => {
  return useQuery({
    queryKey: ["inventory"],
    queryFn: () => getInventory()
  });
};

export const useInventoryStats = () => {
  return useQuery({
    queryKey: ["inventoryStats"],
    queryFn: () => getInventoryStats()
  });
};

export const useInventoryHistory = (bookId = null) => {
  return useQuery({
    queryKey: ["inventoryHistory", bookId],
    queryFn: () => getInventoryHistory(bookId)
  });
};

export const useInventoryByBook = (bookId) => {
  return useQuery({
    queryKey: ["inventory", bookId],
    queryFn: () => getInventoryByBook(bookId),
    enabled: !!bookId
  });
};

export const useAddStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addStock,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ["inventoryStats"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryHistory"] });
    }
  });
};

export const useRemoveStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeStock,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ["inventoryStats"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryHistory"] });
    }
  });
};

export const useIssueBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: issueBook,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ["inventoryStats"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryHistory"] });
    }
  });
};

export const useReturnBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: returnBook,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ["inventoryStats"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryHistory"] });
    }
  });
};

export const useReserveBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reserveBook,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ["inventoryStats"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryHistory"] });
    }
  });
};

export const useMarkDamaged = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markDamaged,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ["inventoryStats"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryHistory"] });
    }
  });
};

export const useMarkLost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markLost,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ["inventoryStats"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryHistory"] });
    }
  });
};
