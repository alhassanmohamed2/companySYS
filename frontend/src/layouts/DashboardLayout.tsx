import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
    LayoutDashboard, FolderKanban, ListTodo, Bell, LogOut, Users, BarChart3, Link2, Settings
} from 'lucide-react';

const roleLabels: Record<string, string> = {
    ADMIN: 'System Admin',
    CEO: 'CEO',
    PM: 'Project Manager',
    DEV: 'Developer',
};

export default function DashboardLayout() {
    const { username, role, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const linkStyle = (isActive: boolean): React.CSSProperties => ({
        display: 'flex', alignItems: 'center', gap: 10, padding: '0.625rem 1rem',
        borderRadius: '0.5rem', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500,
        color: isActive ? '#818cf8' : '#94a3b8',
        background: isActive ? 'rgba(99,102,241,0.1)' : 'transparent',
        transition: 'all 0.15s',
    });

    return (
        <div style={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
            {/* Sidebar */}
            <aside style={{
                width: 260, flexShrink: 0, padding: '1.5rem 1rem',
                background: 'rgba(15, 23, 42, 0.95)', borderRight: '1px solid #1e293b',
                display: 'flex', flexDirection: 'column',
            }}>
                <div style={{ marginBottom: '2rem', padding: '0 0.5rem' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 700, background: 'linear-gradient(90deg,#6366f1,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        CompanySYS
                    </h2>
                    <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>{roleLabels[role ?? ''] ?? 'User'}</p>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                    <NavLink to="/" end style={({ isActive }) => linkStyle(isActive)}>
                        <LayoutDashboard size={18} /> Dashboard
                    </NavLink>
                    {(role === 'ADMIN' || role === 'PM' || role === 'CEO') && (
                        <NavLink to="/projects" style={({ isActive }) => linkStyle(isActive)}>
                            <FolderKanban size={18} /> Projects
                        </NavLink>
                    )}
                    {(role === 'ADMIN' || role === 'PM' || role === 'DEV') && (
                        <NavLink to="/tasks" style={({ isActive }) => linkStyle(isActive)}>
                            <ListTodo size={18} /> Tasks
                        </NavLink>
                    )}
                    {(role === 'ADMIN' || role === 'PM') && (
                        <NavLink to="/assets" style={({ isActive }) => linkStyle(isActive)}>
                            <Link2 size={18} /> Assets
                        </NavLink>
                    )}
                    {(role === 'ADMIN' || role === 'CEO') && (
                        <NavLink to="/analytics" style={({ isActive }) => linkStyle(isActive)}>
                            <BarChart3 size={18} /> Analytics
                        </NavLink>
                    )}
                    <NavLink to="/notifications" style={({ isActive }) => linkStyle(isActive)}>
                        <Bell size={18} /> Notifications
                    </NavLink>
                    {role === 'ADMIN' && (
                        <NavLink to="/users" style={({ isActive }) => linkStyle(isActive)}>
                            <Users size={18} /> Users
                        </NavLink>
                    )}
                    <NavLink to="/settings" style={({ isActive }) => linkStyle(isActive)}>
                        <Settings size={18} /> Settings
                    </NavLink>
                </nav>

                <div style={{ borderTop: '1px solid #1e293b', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 0.5rem', marginBottom: 12 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.875rem', fontWeight: 700, color: '#fff',
                        }}>
                            {username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{username}</p>
                            <p style={{ fontSize: '0.7rem', color: '#64748b' }}>{roleLabels[role ?? '']}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main style={{ flex: 1, padding: '2rem', overflow: 'auto' }}>
                <Outlet />
            </main>
        </div>
    );
}
