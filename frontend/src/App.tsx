import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/auth/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagementPage from './pages/admin/UserManagementPage';
import CeoDashboard from './pages/ceo/CeoDashboard';
import PmDashboard from './pages/pm/PmDashboard';
import DevDashboard from './pages/dev/DevDashboard';
import NotificationsPage from './pages/notifications/NotificationsPage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';
import SettingsPage from './pages/settings/SettingsPage';
import './index.css';

function RoleDashboard() {
  const role = useAuthStore((s) => s.role);
  switch (role) {
    case 'ADMIN': return <AdminDashboard />;
    case 'CEO': return <CeoDashboard />;
    case 'PM': return <PmDashboard />;
    case 'DEV': return <DevDashboard />;
    default: return <DevDashboard />;
  }
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate);
  useEffect(() => { hydrate(); }, [hydrate]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<RoleDashboard />} />
          <Route path="projects" element={<PmDashboard />} />
          <Route path="projects/:id" element={<ProjectDetailPage />} />
          <Route path="tasks" element={<DevDashboard />} />
          <Route path="analytics" element={<CeoDashboard />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="assets" element={<PmDashboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
