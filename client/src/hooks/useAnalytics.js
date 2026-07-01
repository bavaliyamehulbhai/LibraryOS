import { useQuery } from "@tanstack/react-query";
import { 
  getDashboardAnalytics, 
  getBookAnalytics, 
  getCategoryAnalytics, 
  getInventoryAnalytics, 
  getTrendAnalytics, 
  getExecutiveReport 
} from "../services/analyticsService";

export const useDashboardAnalytics = () => useQuery({
  queryKey: ["analytics", "dashboard"],
  queryFn: getDashboardAnalytics
});

export const useBookAnalytics = () => useQuery({
  queryKey: ["analytics", "books"],
  queryFn: getBookAnalytics
});

export const useCategoryAnalytics = () => useQuery({
  queryKey: ["analytics", "categories"],
  queryFn: getCategoryAnalytics
});

export const useInventoryAnalytics = () => useQuery({
  queryKey: ["analytics", "inventory"],
  queryFn: getInventoryAnalytics
});

export const useTrendAnalytics = () => useQuery({
  queryKey: ["analytics", "trends"],
  queryFn: getTrendAnalytics
});

export const useExecutiveReport = () => useQuery({
  queryKey: ["analytics", "executiveReport"],
  queryFn: getExecutiveReport
});
