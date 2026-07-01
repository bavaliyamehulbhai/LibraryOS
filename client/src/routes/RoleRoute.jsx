import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <div>Loading...</div>;
  }

  // If there's no user, let ProtectedRoute handle it, or navigate to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default RoleRoute;
