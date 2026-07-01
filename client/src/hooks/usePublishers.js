import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPublishers, getPublisherById, createPublisher, updatePublisher, deletePublisher, getPublisherStats } from "../services/publisherService";

export const usePublishers = (params) => {
  return useQuery({
    queryKey: ["publishers", params],
    queryFn: () => getPublishers(params)
  });
};

export const usePublisher = (id) => {
  return useQuery({
    queryKey: ["publisher", id],
    queryFn: () => getPublisherById(id),
    enabled: !!id
  });
};

export const usePublisherStats = (id) => {
  return useQuery({
    queryKey: ["publisherStats", id],
    queryFn: () => getPublisherStats(id),
    enabled: !!id
  });
};

export const useCreatePublisher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPublisher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publishers"] });
    }
  });
};

export const useUpdatePublisher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePublisher,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["publishers"] });
      queryClient.invalidateQueries({ queryKey: ["publisher", variables.id] });
    }
  });
};

export const useDeletePublisher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePublisher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publishers"] });
    }
  });
};
