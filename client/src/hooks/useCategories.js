import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory, getCategoryStats } from "../services/categoryService";

export const useCategories = (params) => {
  return useQuery({
    queryKey: ["categories", params],
    queryFn: () => getCategories(params)
  });
};

export const useCategory = (id) => {
  return useQuery({
    queryKey: ["category", id],
    queryFn: () => getCategoryById(id),
    enabled: !!id
  });
};

export const useCategoryStats = (id) => {
  return useQuery({
    queryKey: ["categoryStats", id],
    queryFn: () => getCategoryStats(id),
    enabled: !!id
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    }
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCategory,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["category", variables.id] });
    }
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    }
  });
};
