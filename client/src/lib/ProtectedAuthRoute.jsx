import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom"; // ✅ use component

const ProtectedAuthRoute = ({ children }) => {
  const user = useSelector((state) => state.auth.user);
  const userInfo = !!user;

  if (userInfo) {
    return <Navigate to="/reconciliation-dashboard" replace />;
  }

  return children;
};

export default ProtectedAuthRoute;
