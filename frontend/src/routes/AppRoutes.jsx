import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import PublicLayout from '@/layouts/PublicLayout';
import ClientLayout from '@/layouts/ClientLayout';
import AdminLayout from '@/layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import Loader from '@/components/ui/Loader';
import { useAuth } from '@/hooks/useAuth';

// Public pages (eager — petits bundles)
import LandingPage from '@/pages/public/LandingPage';
import LoginPage from '@/pages/public/LoginPage';
import RegisterPage from '@/pages/public/RegisterPage';

// Client pages (lazy — chargées à la demande pour optimiser le FCP)
const DashboardPage = lazy(() => import('@/pages/client/DashboardPage'));
const AccountsPage = lazy(() => import('@/pages/client/AccountsPage'));
const AccountDetailPage = lazy(() => import('@/pages/client/AccountDetailPage'));
const TransferPage = lazy(() => import('@/pages/client/TransferPage'));
const TransactionsPage = lazy(() => import('@/pages/client/TransactionsPage'));
const ProfilePage = lazy(() => import('@/pages/client/ProfilePage'));

// Admin pages
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const UsersManagementPage = lazy(() => import('@/pages/admin/UsersManagementPage'));
const AccountsManagementPage = lazy(() => import('@/pages/admin/AccountsManagementPage'));
const StatsPage = lazy(() => import('@/pages/admin/StatsPage'));
const AuditLogsPage = lazy(() => import('@/pages/admin/AuditLogsPage'));

/**
 * Redirige vers le bon espace selon le rôle quand on hit "/app" en tant qu'admin
 * ou inversement.
 */
function HomeRedirect() {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <LandingPage />;
  return <Navigate to={isAdmin ? '/admin' : '/app'} replace />;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loader full label="Chargement..." />}>
      <Routes>
        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Client (auth requise) */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <ClientLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="accounts" element={<AccountsPage />} />
          <Route path="accounts/:id" element={<AccountDetailPage />} />
          <Route path="transfer" element={<TransferPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Admin (rôle admin requis) */}
        <Route
          path="/admin"
          element={
            <RoleRoute allow="admin">
              <AdminLayout />
            </RoleRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<UsersManagementPage />} />
          <Route path="accounts" element={<AccountsManagementPage />} />
          <Route path="stats" element={<StatsPage />} />
          <Route path="audit" element={<AuditLogsPage />} />
        </Route>

        {/* Profile shortcut */}
        <Route
          path="/profile"
          element={<Navigate to="/app/profile" replace />}
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
