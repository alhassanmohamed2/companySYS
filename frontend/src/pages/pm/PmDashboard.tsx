import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getProjects, getTasks, createProject } from '../../services/api';
import { FolderKanban, Plus, ListTodo } from 'lucide-react';

export default function PmDashboard() {
    const { username } = useAuthStore();
    const navigate = useNavigate();
    const [projects, setProjects] = useState<any[]>([]);
    const [tasks, setTasks] = useState<any[]>([]);
    const [showNewProject, setShowNewProject] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', description: '', start_date: '' });

    const load = () => {
        getProjects().then((r) => setProjects(r.data.results ?? r.data)).catch(() => { });
        getTasks().then((r) => setTasks(r.data.results ?? r.data)).catch(() => { });
    };
    useEffect(load, []);

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createProject(newProject);
            setShowNewProject(false);
            setNewProject({ name: '', description: '', start_date: '' });
            load();
        } catch { }
    };

    const statusCounts = {
        todo: tasks.filter((t) => t.status === 'TODO').length,
        inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
        review: tasks.filter((t) => t.status === 'REVIEW').length,
        done: tasks.filter((t) => t.status === 'DONE').length,
    };

    const statusBadge = (status: string) => {
        const map: Record<string, string> = { TODO: 'badge-todo', IN_PROGRESS: 'badge-progress', REVIEW: 'badge-review', DONE: 'badge-done' };
        return <span className={`badge ${map[status] ?? 'badge-todo'}`}>{status.replace('_', ' ')}</span>;
    };

    return (
        <div className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>PM Workspace</h1>
                    <p style={{ color: '#94a3b8', marginTop: 4 }}>Manage your projects &amp; teams, {username}</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowNewProject(!showNewProject)}>
                    <Plus size={18} /> New Project
                </button>
            </div>

            {/* New Project Form */}
            {showNewProject && (
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Create New Project</h3>
                    <form onSubmit={handleCreateProject} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <input placeholder="Project Name" required value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} />
                        <input type="date" required value={newProject.start_date} onChange={(e) => setNewProject({ ...newProject, start_date: e.target.value })} />
                        <textarea placeholder="Description" style={{ gridColumn: '1 / -1' }} value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} />
                        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
                            <button type="submit" className="btn btn-primary"><Plus size={16} /> Create</button>
                            <button type="button" className="btn btn-outline" onClick={() => setShowNewProject(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Sprint Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { label: 'To-Do', value: statusCounts.todo, color: '#94a3b8' },
                    { label: 'In Progress', value: statusCounts.inProgress, color: '#818cf8' },
                    { label: 'In Review', value: statusCounts.review, color: '#eab308' },
                    { label: 'Done', value: statusCounts.done, color: '#22c55e' },
                ].map((s, i) => (
                    <div key={i} className="card" style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '2rem', fontWeight: 700, color: s.color }}>{s.value}</p>
                        <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Projects List */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FolderKanban size={18} color="#6366f1" /> My Projects
                </h3>
                {projects.length > 0 ? (
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {projects.map((p: any, i: number) => (
                            <div key={i} onClick={() => navigate(`/projects/${p.id}`)} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '1rem', borderRadius: '0.75rem', background: '#0f172a',
                                border: '1px solid #1e293b', cursor: 'pointer', transition: 'border-color 0.15s',
                            }}
                                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#6366f1')}
                                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1e293b')}
                            >
                                <div>
                                    <p style={{ fontWeight: 600 }}>{p.name}</p>
                                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>{p.description?.slice(0, 80)}</p>
                                </div>
                                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{p.start_date}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>No projects yet. Create one to get started!</p>
                )}
            </div>

            {/* Tasks Table */}
            <div className="card">
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ListTodo size={18} color="#06b6d4" /> All Tasks
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #334155' }}>
                            <th style={{ textAlign: 'left', padding: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>Task</th>
                            <th style={{ textAlign: 'left', padding: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>Sprint</th>
                            <th style={{ textAlign: 'left', padding: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>Status</th>
                            <th style={{ textAlign: 'left', padding: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>Assignee</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.length > 0 ? tasks.map((t: any, i: number) => (
                            <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}>
                                <td style={{ padding: '0.75rem', fontWeight: 500 }}>{t.title}</td>
                                <td style={{ padding: '0.75rem', color: '#94a3b8' }}>{t.sprint || '—'}</td>
                                <td style={{ padding: '0.75rem' }}>{statusBadge(t.status)}</td>
                                <td style={{ padding: '0.75rem', color: '#94a3b8' }}>{t.assigned_to?.username ?? '—'}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan={4} style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b' }}>No tasks yet</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
