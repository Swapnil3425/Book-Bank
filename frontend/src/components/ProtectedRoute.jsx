import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoadingSpinner from "./LoadingSpinner";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, initializing } = useAuth();

  if (initializing) return <LoadingSpinner />;

  // No user → redirect to login (demo users ARE set as user so this is fine)
  if (!user) return <Navigate to="/login" replace />;

  // Role check — demo user already has the correct role set
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

