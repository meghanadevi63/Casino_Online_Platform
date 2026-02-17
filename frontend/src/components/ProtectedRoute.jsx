import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";


const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user, loadingUser } =
    useContext(AuthContext);

  //  Wait until user is resolved
  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  }

  //  Not logged in
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  //  Block inactive users
  if (user.status && user.status !== "active") {
    return <Navigate to="/login" replace />;
  }

  //  Role restriction
  if (allowedRoles && !allowedRoles.includes(user.role_id)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
