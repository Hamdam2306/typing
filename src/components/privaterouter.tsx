import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import type { RootState } from "../pages/auth/login/store";
import type { JSX } from "react";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const user = useSelector((state: RootState) => state.auth.uid);

  if (!user) {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

export default PrivateRoute;
