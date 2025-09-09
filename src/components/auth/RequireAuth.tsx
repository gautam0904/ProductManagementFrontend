import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import type { RootState } from "../../store";

interface Props {
  children: React.ReactElement;
}

interface LocationState {
  from: {
    pathname: string;
    search: string;
    hash: string;
    state: unknown;
    key: string;
  };
}

const RequireAuth: React.FC<Props> = ({ children }) => {
  const token = useSelector((s: RootState) => s.auth.token);
  const location = useLocation();

  if (!token) {
    // Save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAuth;
