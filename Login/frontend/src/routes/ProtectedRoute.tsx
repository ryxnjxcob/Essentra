// src/routes/ProtectedRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  user: any;
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ user, children }) => {
  const location = useLocation();

  if (!user) {
    return (
      <Navigate to="/app/login" state={{ from: location.pathname }} replace />
    );
  }

  return children;
};

export default ProtectedRoute;
