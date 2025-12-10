import { Navigate } from "react-router-dom";
import { getStoredUser } from "../hooks/useAuth";

function ProtectedRoute({ children, allowed }) {
  const user = getStoredUser();
  const token = localStorage.getItem("token");

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  if (allowed && !allowed.includes(user.tipousuario)) {
    const fallback = user.tipousuario === "ofertante" ? "/ofertante" : "/consumidor";
    return <Navigate to={fallback} replace />;
  }

  return children;
}

export default ProtectedRoute;
