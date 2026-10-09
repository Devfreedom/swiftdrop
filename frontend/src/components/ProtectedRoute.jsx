// Route guard: needs login; optionally needs one of `roles`.
import { Navigate } from "react-router-dom";
import { useAuth, roleHome } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { user, token, loading } = useAuth();
  if (loading) return <p className="muted">Loading…</p>;
  if (!token) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to={roleHome(user.role)} replace />;
  }
  return children;
}
