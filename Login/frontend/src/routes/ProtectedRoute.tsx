import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ user, children }: any) => {
  if (!user) return <Navigate to="/app/login" replace />;

  return children;
};

export default ProtectedRoute;
