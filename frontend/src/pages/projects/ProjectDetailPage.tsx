import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getProject, getTasks, getAssets, createAsset, createTask, deleteAsset, deleteProject, getUsers, createTaskComment } from '../../services/api';
import { ArrowLeft, Github, Link2, Plus, Trash2, ListTodo, FolderKanban, ExternalLink, X, Eye, Users, Clock, MessageSquare, Send } from 'lucide-react';

export default function ProjectDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { role } = useAuthStore();
    const canEdit = role === 'ADMIN' || role === 'PM';

    const [project, setProject] = useState<any>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [assets, setAssets] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [showAssetForm, setShowAssetForm] = useState(false);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [assetForm, setAssetForm] = useState({ asset_type: 'GITHUB', url: '', description: '' });
    const [taskForm, setTaskForm] = useState({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', sprint: '', assigned_to_id: '' });

    const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);
    const [newComment, setNewComment] = useState('');

    const load = () => {
        if (!id) return;
        getProject(Number(id)).then((r) => setProject(r.data)).catch(() => { });
        getTasks({ project: id }).then((r) => setTasks(r.data.results ?? r.data)).catch(() => { });
        getAssets({ project: id }).then((r) => setAssets(r.data.results ?? r.data)).catch(() => { });
        getUsers().then((r) => setAllUsers(r.data.results ?? r.data)).catch(() => { });
    };
    useEffect(load, [id]);

    const handleAddAsset = async (e: React.FormEvent) => {
        e.preventDefault();
        await createAsset({ ...assetForm, project: Number(id) });
        setShowAssetForm(false);
        setAssetForm({ asset_type: 'GITHUB', url: '', description: '' });
        load();
    };

    const devUsers = allUsers.filter((u: any) => u.role === 'DEV');

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload: any = { title: taskForm.title, description: taskForm.description, status: taskForm.status, priority: taskForm.priority, sprint: taskForm.sprint, project: Number(id) };
        if (taskForm.assigned_to_id) payload.assigned_to_id = Number(taskForm.assigned_to_id);
        await createTask(payload);
        setShowTaskForm(false);
        setTaskForm({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', sprint: '', assigned_to_id: '' });
        load();
    };

    const handleAddComment = async (taskId: number) => {
        if (!newComment.trim()) return;
        await createTaskComment({ task: taskId, content: newComment });
        setNewComment('');
        load();
    };

    const handleDeleteAsset = async (assetId: number) => {
        await deleteAsset(assetId);
        load();
    };

    const githubAssets = assets.filter((a) => a.asset_type === 'GITHUB');
    const otherAssets = assets.filter((a) => a.asset_type !== 'GITHUB');
    const devs = [...new Set(tasks.filter((t: any) => t.assigned_to).map((t: any) => t.assigned_to?.username))];

    const statusBadge = (status: string) => {
        const map: Record<string, string> = { TODO: 'badge-todo', IN_PROGRESS: 'badge-progress', REVIEW: 'badge-review', DONE: 'badge-done' };
        return <span className={`badge ${map[status] ?? 'badge-todo'}`}>{status.replace('_', ' ')}</span>;
    };

    const priorityBadge = (priority: string) => {
        const pMap: Record<string, string> = { LOW: '#94a3b8', MEDIUM: '#6366f1', HIGH: '#f97316', URGENT: '#ef4444' };
        const color = pMap[priority] || '#94a3b8';
        return <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, backgroundColor: `${color}20`, color: color }}>
            {priority}
        </span>;
    };

    if (!project) return <div style={{ padding: '2rem', color: '#64748b' }}>Loading...</div>;

    return (
        <div className="animate-in">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
                <button className="btn btn-outline" style={{ padding: '0.4rem' }} onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} />
                </button>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FolderKanban size={24} color="#6366f1" /> {project.name}
                    </h1>
                    <p style={{ color: '#94a3b8', marginTop: 2, fontSize: '0.9rem' }}>{project.description}</p>
                </div>
                {role === 'ADMIN' && (
                    <button className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', borderColor: '#ef444440', color: '#ef4444', fontSize: '0.8rem' }}
                        onClick={async () => {
                            if (window.confirm(`Delete project "${project.name}"? This will also delete all tasks and assets.`)) {
                                await deleteProject(project.id);
                                navigate('/projects');
                            }
                        }}>
                        <Trash2 size={14} /> Delete Project
                    </button>
                )}
                {!canEdit && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.4rem 0.75rem', borderRadius: '0.5rem', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                        <Eye size={14} color="#818cf8" />
                        <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 500 }}>View Only</span>
                    </div>
                )}
            </div>

            {/* Project Info Bar */}
            <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #6366f180)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', fontWeight: 700, color: '#fff',
                    }}>{project.pm?.username?.charAt(0).toUpperCase() ?? '?'}</div>
                    <div>
                        <p style={{ fontSize: '0.7rem', color: '#64748b' }}>Project Manager</p>
                        <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>{project.pm?.username ?? 'Unassigned'}</p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Users size={16} color="#06b6d4" />
                    <div>
                        <p style={{ fontSize: '0.7rem', color: '#64748b' }}>Developers ({devs.length})</p>
                        <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>{devs.length > 0 ? devs.join(', ') : 'None assigned'}</p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={16} color="#94a3b8" />
                    <div>
                        <p style={{ fontSize: '0.7rem', color: '#64748b' }}>Started</p>
                        <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>{project.start_date ?? '—'}</p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ListTodo size={16} color="#eab308" />
                    <div>
                        <p style={{ fontSize: '0.7rem', color: '#64748b' }}>Tasks</p>
                        <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>{tasks.length} total · {tasks.filter(t => t.status === 'DONE').length} done</p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* ── GitHub Repositories ── */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Github size={18} /> GitHub Repositories
                        </h3>
                        {canEdit && (
                            <button className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                                onClick={() => { setShowAssetForm(!showAssetForm); setAssetForm({ asset_type: 'GITHUB', url: '', description: '' }); }}>
                                <Plus size={14} /> Add
                            </button>
                        )}
                    </div>

                    {canEdit && showAssetForm && assetForm.asset_type === 'GITHUB' && (
                        <form onSubmit={handleAddAsset} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem', padding: '1rem', background: '#0f172a', borderRadius: '0.75rem' }}>
                            <input placeholder="https://github.com/user/repo" required value={assetForm.url} onChange={(e) => setAssetForm({ ...assetForm, url: e.target.value })} />
                            <input placeholder="Description (e.g. Frontend repo)" value={assetForm.description} onChange={(e) => setAssetForm({ ...assetForm, description: e.target.value })} />
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button type="submit" className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}><Plus size={14} /> Add Repo</button>
                                <button type="button" className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }} onClick={() => setShowAssetForm(false)}><X size={14} /></button>
                            </div>
                        </form>
                    )}

                    {githubAssets.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {githubAssets.map((a: any) => (
                                <div key={a.id} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '0.75rem', borderRadius: '0.5rem', background: '#0f172a', border: '1px solid #1e293b',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                                        <Github size={18} color="#94a3b8" />
                                        <div style={{ minWidth: 0 }}>
                                            <a href={a.url} target="_blank" rel="noopener noreferrer"
                                                style={{ color: '#818cf8', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                {a.url.replace('https://github.com/', '')} <ExternalLink size={12} />
                                            </a>
                                            {a.description && <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>{a.description}</p>}
                                        </div>
                                    </div>
                                    {canEdit && (
                                        <button className="btn btn-outline" style={{ padding: '0.25rem', borderColor: '#ef444440', color: '#ef4444' }}
                                            onClick={() => handleDeleteAsset(a.id)}>
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem 0' }}>No GitHub repos linked yet</p>
                    )}
                </div>

                {/* ── Other Assets ── */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Link2 size={18} /> Project Assets
                        </h3>
                        {canEdit && (
                            <button className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                                onClick={() => { setShowAssetForm(!showAssetForm); setAssetForm({ asset_type: 'GDRIVE', url: '', description: '' }); }}>
                                <Plus size={14} /> Add
                            </button>
                        )}
                    </div>

                    {canEdit && showAssetForm && assetForm.asset_type !== 'GITHUB' && (
                        <form onSubmit={handleAddAsset} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem', padding: '1rem', background: '#0f172a', borderRadius: '0.75rem' }}>
                            <select value={assetForm.asset_type} onChange={(e) => setAssetForm({ ...assetForm, asset_type: e.target.value })}>
                                <option value="GDRIVE">Google Drive</option>
                                <option value="DOC">Document</option>
                            </select>
                            <input placeholder="URL" required value={assetForm.url} onChange={(e) => setAssetForm({ ...assetForm, url: e.target.value })} />
                            <input placeholder="Description" value={assetForm.description} onChange={(e) => setAssetForm({ ...assetForm, description: e.target.value })} />
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button type="submit" className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}><Plus size={14} /> Add</button>
                                <button type="button" className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }} onClick={() => setShowAssetForm(false)}><X size={14} /></button>
                            </div>
                        </form>
                    )}

                    {otherAssets.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {otherAssets.map((a: any) => (
                                <div key={a.id} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '0.75rem', borderRadius: '0.5rem', background: '#0f172a', border: '1px solid #1e293b',
                                }}>
                                    <div style={{ minWidth: 0 }}>
                                        <a href={a.url} target="_blank" rel="noopener noreferrer"
                                            style={{ color: '#818cf8', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                                            {a.description || a.url} <ExternalLink size={12} />
                                        </a>
                                        <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>{a.asset_type === 'GDRIVE' ? 'Google Drive' : 'Document'}</p>
                                    </div>
                                    {canEdit && (
                                        <button className="btn btn-outline" style={{ padding: '0.25rem', borderColor: '#ef444440', color: '#ef4444' }}
                                            onClick={() => handleDeleteAsset(a.id)}>
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem 0' }}>No assets linked yet</p>
                    )}
                </div>
            </div>

            {/* ── Tasks ── */}
            <div className="card" style={{ marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ListTodo size={18} color="#06b6d4" /> Project Tasks
                    </h3>
                    {canEdit && (
                        <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                            onClick={() => setShowTaskForm(!showTaskForm)}>
                            <Plus size={14} /> Add Task
                        </button>
                    )}
                </div>

                {canEdit && showTaskForm && (
                    <form onSubmit={handleAddTask} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem', padding: '1rem', background: '#0f172a', borderRadius: '0.75rem' }}>
                        <input placeholder="Task title" required value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} />
                        <input placeholder="Sprint (e.g. Sprint 1)" value={taskForm.sprint} onChange={(e) => setTaskForm({ ...taskForm, sprint: e.target.value })} />
                        <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                            <option value="LOW">Low Priority</option>
                            <option value="MEDIUM">Medium Priority</option>
                            <option value="HIGH">High Priority</option>
                            <option value="URGENT">Urgent</option>
                        </select>
                        <select value={taskForm.assigned_to_id} onChange={(e) => setTaskForm({ ...taskForm, assigned_to_id: e.target.value })}>
                            <option value="">— Assign Developer —</option>
                            {devUsers.map((u: any) => (
                                <option key={u.id} value={u.id}>{u.username} ({u.email})</option>
                            ))}
                        </select>
                        <textarea placeholder="Description" style={{ gridColumn: '1 / -1' }} value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />
                        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
                            <button type="submit" className="btn btn-primary" style={{ fontSize: '0.75rem' }}><Plus size={14} /> Create Task</button>
                            <button type="button" className="btn btn-outline" style={{ fontSize: '0.75rem' }} onClick={() => setShowTaskForm(false)}>Cancel</button>
                        </div>
                    </form>
                )}

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #334155' }}>
                            <th style={{ textAlign: 'left', padding: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>Task</th>
                            <th style={{ textAlign: 'left', padding: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>Priority</th>
                            <th style={{ textAlign: 'left', padding: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>Sprint</th>
                            <th style={{ textAlign: 'left', padding: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>Status</th>
                            <th style={{ textAlign: 'left', padding: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>Assignee</th>
                            <th style={{ textAlign: 'right', padding: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.length > 0 ? tasks.map((t: any) => (
                            <React.Fragment key={t.id}>
                                <tr style={{ borderBottom: expandedTaskId === t.id ? 'none' : '1px solid #1e293b', background: expandedTaskId === t.id ? '#1e293b50' : 'transparent' }}>
                                    <td style={{ padding: '0.75rem', fontWeight: 500 }}>{t.title}</td>
                                    <td style={{ padding: '0.75rem' }}>{priorityBadge(t.priority)}</td>
                                    <td style={{ padding: '0.75rem', color: '#94a3b8' }}>{t.sprint || '—'}</td>
                                    <td style={{ padding: '0.75rem' }}>{statusBadge(t.status)}</td>
                                    <td style={{ padding: '0.75rem', color: '#94a3b8' }}>{t.assigned_to?.username ?? '—'}</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                        <button className="btn btn-outline" style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                            onClick={() => setExpandedTaskId(expandedTaskId === t.id ? null : t.id)}>
                                            <MessageSquare size={14} />
                                            {t.comments?.length || 0}
                                        </button>
                                    </td>
                                </tr>
                                {expandedTaskId === t.id && (
                                    <tr style={{ borderBottom: '1px solid #1e293b', background: '#1e293b50' }}>
                                        <td colSpan={6} style={{ padding: '1rem', paddingTop: 0 }}>
                                            <div style={{ background: '#0f172a', borderRadius: '0.5rem', padding: '1rem', border: '1px solid #334155' }}>
                                                <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.75rem' }}>Task Comments & Activity</h4>

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: 250, overflowY: 'auto', marginBottom: '1rem' }}>
                                                    {t.comments && t.comments.length > 0 ? t.comments.map((c: any) => (
                                                        <div key={c.id} style={{ display: 'flex', gap: '0.75rem' }}>
                                                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#6366f130', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>
                                                                {c.user?.username?.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div style={{ background: '#1e293b', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', borderTopLeftRadius: 0, flex: 1 }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                                                                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{c.user?.username}</span>
                                                                    <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{new Date(c.created_at).toLocaleString()}</span>
                                                                </div>
                                                                <p style={{ fontSize: '0.8rem', color: '#cbd5e1', whiteSpace: 'pre-wrap' }}>{c.content}</p>
                                                            </div>
                                                        </div>
                                                    )) : (
                                                        <p style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center', fontStyle: 'italic', padding: '1rem 0' }}>No comments yet.</p>
                                                    )}
                                                </div>

                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <input
                                                        type="text"
                                                        placeholder="Add a comment..."
                                                        value={newComment}
                                                        onChange={(e) => setNewComment(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(t.id)}
                                                        style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
                                                    />
                                                    <button className="btn btn-primary" style={{ padding: '0.5rem' }} onClick={() => handleAddComment(t.id)} disabled={!newComment.trim()}>
                                                        <Send size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        )) : (
                            <tr><td colSpan={6} style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b' }}>No tasks yet</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
