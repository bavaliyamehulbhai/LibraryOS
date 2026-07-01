import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getGallery, getCoverStats, uploadCover, replaceCover, removeCover } from "../services/mediaService";

export const useGallery = (params) => useQuery({
  queryKey: ["gallery", params],
  queryFn: () => getGallery(params),
  keepPreviousData: true
});

export const useCoverStats = () => useQuery({
  queryKey: ["coverStats"],
  queryFn: getCoverStats
});

export const useUploadCover = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookId, formData }) => uploadCover(bookId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries(["gallery"]);
      queryClient.invalidateQueries(["coverStats"]);
      queryClient.invalidateQueries(["books"]);
    }
  });
};

export const useReplaceCover = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookId, formData }) => replaceCover(bookId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries(["gallery"]);
      queryClient.invalidateQueries(["coverStats"]);
      queryClient.invalidateQueries(["books"]);
    }
  });
};

export const useRemoveCover = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeCover,
    onSuccess: () => {
      queryClient.invalidateQueries(["gallery"]);
      queryClient.invalidateQueries(["coverStats"]);
      queryClient.invalidateQueries(["books"]);
    }
  });
};
