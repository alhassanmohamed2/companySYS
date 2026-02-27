import { useEffect, useState } from 'react';
import { getProjects, getTasks } from '../../services/api';
import { BarChart3, FolderKanban, TrendingUp, Clock, Users, CheckCircle2 } from 'lucide-react';

export default function CeoDashboard() {
    const [projectCount, setProjectCount] = useState(0);
    const [taskStats, setTaskStats] = useState({ total: 0, done: 0, inProgress: 0, overdue: 0 });
    const [projects, setProjects] = useState<any[]>([]);

    useEffect(() => {
        Promise.all([getProjects(), getTasks()]).then(([pRes, tRes]) => {
            const p = pRes.data.results ?? pRes.data;
            const t = tRes.data.results ?? tRes.data;
            setProjectCount(p.length);
            setProjects(p.slice(0, 5));
            setTaskStats({
                total: t.length,
                done: t.filter((x: any) => x.status === 'DONE').length,
                inProgress: t.filter((x: any) => x.status === 'IN_PROGRESS').length,
                overdue: t.filter((x: any) => x.due_date && new Date(x.due_date) < new Date() && x.status !== 'DONE').length,
            });
        }).catch(() => { });
    }, []);

    const completionRate = taskStats.total > 0 ? Math.round((taskStats.done / taskStats.total) * 100) : 0;

    return (
        <div className="animate-in">
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Executive Overview</h1>
                <p style={{ color: '#94a3b8', marginTop: 4 }}>High-level analytics &amp; performance metrics</p>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Active Projects', value: projectCount, icon: <FolderKanban size={20} />, color: '#6366f1' },
                    { label: 'Completion Rate', value: `${completionRate}%`, icon: <TrendingUp size={20} />, color: '#22c55e' },
                    { label: 'In Progress', value: taskStats.inProgress, icon: <Clock size={20} />, color: '#06b6d4' },
                    { label: 'Overdue', value: taskStats.overdue, icon: <BarChart3 size={20} />, color: '#ef4444' },
                ].map((s, i) => (
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

            {/* Progress Bar */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircle2 size={18} color="#22c55e" /> Overall Task Completion
                </h3>
                <div style={{ background: '#334155', borderRadius: 9999, height: 12, overflow: 'hidden' }}>
                    <div style={{
                        width: `${completionRate}%`, height: '100%',
                        background: 'linear-gradient(90deg, #6366f1, #22c55e)',
                        borderRadius: 9999, transition: 'width 1s ease',
                    }} />
                </div>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 8 }}>
                    {taskStats.done} of {taskStats.total} tasks completed
                </p>
            </div>

            {/* Project Overview */}
            <div className="card">
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Users size={18} color="#6366f1" /> Project Overview
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #334155' }}>
                            <th style={{ textAlign: 'left', padding: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>Project</th>
                            <th style={{ textAlign: 'left', padding: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>PM</th>
                            <th style={{ textAlign: 'left', padding: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>Start Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.length > 0 ? projects.map((p: any, i: number) => (
                            <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}>
                                <td style={{ padding: '0.75rem', fontWeight: 500 }}>{p.name}</td>
                                <td style={{ padding: '0.75rem', color: '#94a3b8' }}>{p.pm?.username ?? '—'}</td>
                                <td style={{ padding: '0.75rem', color: '#94a3b8' }}>{p.start_date ?? '—'}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan={3} style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b' }}>No projects yet</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
