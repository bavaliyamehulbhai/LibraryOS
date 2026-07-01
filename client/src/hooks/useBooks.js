import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBooks, getBookById, createBook, updateBook, deleteBook, getIsbnStats } from "../services/bookService";

export const useBooks = (params) => {
  return useQuery({
    queryKey: ["books", params],
    queryFn: () => getBooks(params)
  });
};

export const useBook = (id) => {
  return useQuery({
    queryKey: ["book", id],
    queryFn: () => getBookById(id),
    enabled: !!id
  });
};

export const useISBNStats = () => {
  return useQuery({
    queryKey: ["isbnStats"],
    queryFn: () => getIsbnStats()
  });
};

export const useCreateBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    }
  });
};

export const useUpdateBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateBook,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["book", variables.id] });
    }
  });
};

export const useDeleteBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    }
  });
};
