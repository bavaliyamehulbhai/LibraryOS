import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthors, getAuthorById, createAuthor, updateAuthor, deleteAuthor, getAuthorStats } from "../services/authorService";

export const useAuthors = (params) => {
  return useQuery({
    queryKey: ["authors", params],
    queryFn: () => getAuthors(params)
  });
};

export const useAuthor = (id) => {
  return useQuery({
    queryKey: ["author", id],
    queryFn: () => getAuthorById(id),
    enabled: !!id
  });
};

export const useAuthorStats = (id) => {
  return useQuery({
    queryKey: ["authorStats", id],
    queryFn: () => getAuthorStats(id),
    enabled: !!id
  });
};

export const useCreateAuthor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAuthor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authors"] });
    }
  });
};

export const useUpdateAuthor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAuthor,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["authors"] });
      queryClient.invalidateQueries({ queryKey: ["author", variables.id] });
    }
  });
};

export const useDeleteAuthor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAuthor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authors"] });
    }
  });
};
