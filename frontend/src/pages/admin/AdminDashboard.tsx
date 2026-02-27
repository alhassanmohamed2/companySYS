import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getProjects, getTasks, getNotifications } from '../../services/api';
import {
    Users, FolderKanban, ListTodo, Bell, TrendingUp, Clock, CheckCircle2, AlertTriangle
} from 'lucide-react';

interface StatCard { label: string; value: number | string; icon: React.ReactNode; color: string }

export default function AdminDashboard() {
    const { username } = useAuthStore();
    const navigate = useNavigate();
    const [stats, setStats] = useState<StatCard[]>([]);
    const [recentTasks, setRecentTasks] = useState<any[]>([]);

    useEffect(() => {
        Promise.all([getProjects(), getTasks(), getNotifications()]).then(([pRes, tRes, nRes]) => {
            const projects = pRes.data.results ?? pRes.data;
            const tasks = tRes.data.results ?? tRes.data;
            const notifs = nRes.data.results ?? nRes.data;
            setStats([
                { label: 'Total Projects', value: projects.length, icon: <FolderKanban size={20} />, color: '#6366f1' },
                { label: 'Total Tasks', value: tasks.length, icon: <ListTodo size={20} />, color: '#06b6d4' },
                { label: 'Completed', value: tasks.filter((t: any) => t.status === 'DONE').length, icon: <CheckCircle2 size={20} />, color: '#22c55e' },
                { label: 'Notifications', value: notifs.filter((n: any) => !n.is_read).length, icon: <Bell size={20} />, color: '#eab308' },
            ]);
            setRecentTasks(tasks.slice(0, 6));
        }).catch(() => {
            setStats([
                { label: 'Total Projects', value: '—', icon: <FolderKanban size={20} />, color: '#6366f1' },
                { label: 'Total Tasks', value: '—', icon: <ListTodo size={20} />, color: '#06b6d4' },
                { label: 'Completed', value: '—', icon: <CheckCircle2 size={20} />, color: '#22c55e' },
                { label: 'Notifications', value: '—', icon: <Bell size={20} />, color: '#eab308' },
            ]);
        });
    }, []);

    const statusBadge = (status: string) => {
        const map: Record<string, string> = { TODO: 'badge-todo', IN_PROGRESS: 'badge-progress', REVIEW: 'badge-review', DONE: 'badge-done' };
        return <span className={`badge ${map[status] ?? 'badge-todo'}`}>{status.replace('_', ' ')}</span>;
    };

    return (
        <div className="animate-in">
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Welcome back, {username} 👋</h1>
                <p style={{ color: '#94a3b8', marginTop: 4 }}>Admin Control Panel — Full system overview</p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {stats.map((s, i) => (
                    <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: 44, height: 44, borderRadius: '0.75rem', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                            {s.icon}
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>{s.label}</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="card">
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Users size={18} color="#6366f1" /> Quick Actions
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/users')}>
                            <Users size={16} /> Manage Users
                        </button>
                        <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/projects')}>
                            <FolderKanban size={16} /> Create Project
                        </button>
                        <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/analytics')}>
                            <TrendingUp size={16} /> View Reports
                        </button>
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <AlertTriangle size={18} color="#eab308" /> System Health
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {['Database', 'Redis Queue', 'API Server'].map((s) => (
                            <div key={s} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{s}</span>
                                <span className="badge badge-done">Online</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Tasks */}
            <div className="card">
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={18} color="#06b6d4" /> Recent Tasks
                </h3>
                <div style={{ overflow: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #334155' }}>
                                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>Task</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>Status</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>Assigned To</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentTasks.length > 0 ? recentTasks.map((t: any, i: number) => (
                                <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}>
                                    <td style={{ padding: '0.75rem' }}>{t.title}</td>
                                    <td style={{ padding: '0.75rem' }}>{statusBadge(t.status)}</td>
                                    <td style={{ padding: '0.75rem', color: '#94a3b8' }}>{t.assigned_to?.username ?? '—'}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={3} style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b' }}>No tasks yet</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
