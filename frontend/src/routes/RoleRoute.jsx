import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/**
 * Bloque l'accès à une route si l'utilisateur n'a pas le rôle requis.
 *
 * Usage : <RoleRoute allow="admin"><AdminLayout/></RoleRoute>
 */
export default function RoleRoute({ allow, children }) {
  const { role, isAuthenticated } = useAuth();
  const allowed = Array.isArray(allow) ? allow : [allow];

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!allowed.includes(role)) return <Navigate to="/app" replace />;

  return children ?? <Outlet />;
}
