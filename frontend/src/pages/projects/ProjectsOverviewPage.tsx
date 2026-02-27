import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getProjects, getTasks } from '../../services/api';
import { FolderKanban, Users, Eye, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function ProjectsOverviewPage() {
    const { role } = useAuthStore();
    const navigate = useNavigate();
    const [projects, setProjects] = useState<any[]>([]);
    const [tasks, setTasks] = useState<any[]>([]);

    useEffect(() => {
        getProjects().then((r) => setProjects(r.data.results ?? r.data)).catch(() => { });
        getTasks().then((r) => setTasks(r.data.results ?? r.data)).catch(() => { });
    }, []);

    const getProjectTasks = (projectId: number) => tasks.filter((t: any) => t.project === projectId);
    const getStatusCount = (projectTasks: any[], status: string) => projectTasks.filter((t: any) => t.status === status).length;

    return (
        <div className="animate-in">
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FolderKanban size={24} /> All Projects
                </h1>
                <p style={{ color: '#94a3b8', marginTop: 4 }}>
                    {role === 'CEO' ? 'Company-wide project overview' : 'Projects you\'re involved in'} — {projects.length} project{projects.length !== 1 ? 's' : ''}
                </p>
            </div>

            {projects.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {projects.map((p: any) => {
                        const pTasks = getProjectTasks(p.id);
                        const done = getStatusCount(pTasks, 'DONE');
                        const inProgress = getStatusCount(pTasks, 'IN_PROGRESS');
                        const review = getStatusCount(pTasks, 'REVIEW');
                        const todo = getStatusCount(pTasks, 'TODO');
                        const total = pTasks.length;
                        const progress = total > 0 ? Math.round((done / total) * 100) : 0;
                        const devs = [...new Set(pTasks.filter((t: any) => t.assigned_to).map((t: any) => t.assigned_to?.username))];

                        return (
                            <div key={p.id} className="card" style={{ cursor: 'pointer', transition: 'border-color 0.15s', border: '1px solid transparent' }}
                                onClick={() => navigate(`/projects/${p.id}`)}
                                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#6366f1')}
                                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <FolderKanban size={18} color="#6366f1" /> {p.name}
                                        </h3>
                                        {p.description && <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 4 }}>{p.description}</p>}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Eye size={14} color="#64748b" />
                                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>View Only</span>
                                    </div>
                                </div>

                                {/* PM & Developers */}
                                <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{
                                            width: 28, height: 28, borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #6366f1, #6366f180)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.65rem', fontWeight: 700, color: '#fff',
                                        }}>{p.pm?.username?.charAt(0).toUpperCase() ?? '?'}</div>
                                        <div>
                                            <p style={{ fontSize: '0.7rem', color: '#64748b' }}>Project Manager</p>
                                            <p style={{ fontSize: '0.8rem', fontWeight: 500 }}>{p.pm?.username ?? 'Unassigned'}</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Users size={16} color="#06b6d4" />
                                        <div>
                                            <p style={{ fontSize: '0.7rem', color: '#64748b' }}>Developers</p>
                                            <p style={{ fontSize: '0.8rem', fontWeight: 500 }}>
                                                {devs.length > 0 ? devs.join(', ') : 'No devs assigned'}
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Clock size={16} color="#94a3b8" />
                                        <div>
                                            <p style={{ fontSize: '0.7rem', color: '#64748b' }}>Started</p>
                                            <p style={{ fontSize: '0.8rem', fontWeight: 500 }}>{p.start_date ?? '—'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div style={{ marginBottom: '0.75rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Progress</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: progress === 100 ? '#22c55e' : '#818cf8' }}>{progress}%</span>
                                    </div>
                                    <div style={{ height: 6, borderRadius: 999, background: '#1e293b', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', borderRadius: 999, width: `${progress}%`, background: progress === 100 ? '#22c55e' : 'linear-gradient(90deg, #6366f1, #06b6d4)', transition: 'width 0.3s' }} />
                                    </div>
                                </div>

                                {/* Task status breakdown */}
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    {[
                                        { label: 'To-Do', value: todo, color: '#94a3b8', icon: <AlertCircle size={12} /> },
                                        { label: 'In Progress', value: inProgress, color: '#818cf8', icon: <Clock size={12} /> },
                                        { label: 'Review', value: review, color: '#eab308', icon: <Eye size={12} /> },
                                        { label: 'Done', value: done, color: '#22c55e', icon: <CheckCircle2 size={12} /> },
                                    ].map((s) => (
                                        <div key={s.label} style={{
                                            flex: 1, padding: '0.5rem', borderRadius: '0.5rem', background: '#0f172a',
                                            textAlign: 'center', border: '1px solid #1e293b',
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: s.color }}>
                                                {s.icon}
                                                <span style={{ fontSize: '1rem', fontWeight: 700 }}>{s.value}</span>
                                            </div>
                                            <p style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 2 }}>{s.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    No projects found
                </div>
            )}
        </div>
    );
}
