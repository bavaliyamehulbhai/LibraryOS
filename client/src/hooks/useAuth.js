import { useSelector } from "react-redux";

export const useAuth = () => {
  return {
    user: useSelector((state) => state.auth.user),
    loading: useSelector((state) => state.auth.loading),
    isAuthenticated: useSelector((state) => state.auth.isAuthenticated),
    requires2FA: useSelector((state) => state.auth.requires2FA),
    token: useSelector((state) => state.auth.token),
    error: useSelector((state) => state.auth.error)
  };
};
