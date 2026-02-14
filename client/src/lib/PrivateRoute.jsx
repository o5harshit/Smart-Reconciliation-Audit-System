import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export const PrivateRoute = ({ children }) => {
  const userInfo = useSelector((state) => state.auth.user);
  const isAuthenticated = !!userInfo;
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};
