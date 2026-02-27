import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { getTasks, updateTask } from '../../services/api';
import { ArrowRight, Clock, GitPullRequest } from 'lucide-react';

const COLUMNS = [
    { key: 'TODO', label: 'To-Do', color: '#94a3b8', bg: '#33415520' },
    { key: 'IN_PROGRESS', label: 'In Progress', color: '#818cf8', bg: '#6366f115' },
    { key: 'REVIEW', label: 'Review', color: '#eab308', bg: '#eab30815' },
    { key: 'DONE', label: 'Done', color: '#22c55e', bg: '#22c55e15' },
];

const NEXT_STATUS: Record<string, string> = { TODO: 'IN_PROGRESS', IN_PROGRESS: 'REVIEW', REVIEW: 'DONE' };

export default function DevDashboard() {
    const { username } = useAuthStore();
    const [tasks, setTasks] = useState<any[]>([]);

    const load = () => {
        getTasks().then((r) => setTasks(r.data.results ?? r.data)).catch(() => { });
    };
    useEffect(load, []);

    const moveTask = async (id: number, newStatus: string) => {
        await updateTask(id, { status: newStatus });
        load();
    };

    return (
        <div className="animate-in">
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Developer Workspace</h1>
                <p style={{ color: '#94a3b8', marginTop: 4 }}>Your assigned tasks, {username}</p>
            </div>

            {/* Kanban Board */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', minHeight: 400 }}>
                {COLUMNS.map((col) => {
                    const colTasks = tasks.filter((t) => t.status === col.key);
                    return (
                        <div key={col.key} style={{ borderRadius: '1rem', padding: '1rem', background: col.bg, border: `1px solid ${col.color}20` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: col.color }}>{col.label}</h3>
                                <span style={{
                                    width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.7rem', fontWeight: 700, background: `${col.color}20`, color: col.color,
                                }}>{colTasks.length}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {colTasks.map((t: any) => (
                                    <div key={t.id} className="card" style={{ padding: '1rem' }}>
                                        <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 6 }}>{t.title}</p>
                                        {t.sprint && <p style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: 8 }}>Sprint: {t.sprint}</p>}
                                        {t.due_date && (
                                            <p style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                                                <Clock size={12} /> Due: {t.due_date}
                                            </p>
                                        )}
                                        {t.github_pr_url && (
                                            <a href={t.github_pr_url} target="_blank" rel="noopener noreferrer"
                                                style={{ fontSize: '0.7rem', color: '#818cf8', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8, textDecoration: 'none' }}>
                                                <GitPullRequest size={12} /> View PR
                                            </a>
                                        )}
                                        {NEXT_STATUS[col.key] && (
                                            <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', fontSize: '0.75rem', padding: '0.4rem' }}
                                                onClick={() => moveTask(t.id, NEXT_STATUS[col.key])}>
                                                Move <ArrowRight size={12} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {colTasks.length === 0 && (
                                    <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.8rem', padding: '2rem 0' }}>No tasks</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
