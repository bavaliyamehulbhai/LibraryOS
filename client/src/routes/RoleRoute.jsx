import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // If there's no user, let ProtectedRoute handle it, or navigate to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Support both hardcoded roles (user.role) and custom RBAC roles (user.roleId.name)
  const currentRole = user.role || user.roleId?.name;

  if (!allowedRoles.includes(currentRole)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default RoleRoute;
