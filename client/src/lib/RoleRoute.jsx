import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function RoleRoute({ allowedRoles = [], children }) {
  const user = useSelector((state) => state.auth.user);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/reconciliation-dashboard" replace />;
  }

  return children;
}

