import { useQuery } from "@tanstack/react-query";
import {
  globalSearch,
  bookSearch,
  authorSearch,
  publisherSearch,
  copySearch,
  shelfSearch,
  getSuggestions,
  getSearchStats
} from "../services/searchService";

export const useGlobalSearch = (query) => useQuery({
  queryKey: ["search", "global", query],
  queryFn: () => globalSearch(query),
  enabled: !!query && query.length > 2,
  staleTime: 60000
});

export const useBookSearch = (query, filters) => useQuery({
  queryKey: ["search", "books", query, filters],
  queryFn: () => bookSearch(query, filters),
  enabled: !!query,
  staleTime: 60000
});

export const useSearchSuggestions = (query) => useQuery({
  queryKey: ["search", "suggestions", query],
  queryFn: () => getSuggestions(query),
  enabled: !!query && query.length > 1,
  staleTime: 60000
});

export const useSearchStats = () => useQuery({
  queryKey: ["searchStats"],
  queryFn: getSearchStats
});
