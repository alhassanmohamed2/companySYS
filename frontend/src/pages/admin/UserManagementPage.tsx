import { useEffect, useState } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../../services/api';
import { Users, Plus, Trash2, Edit2, X, Check } from 'lucide-react';

const ROLES = ['ADMIN', 'CEO', 'PM', 'DEV'];
const roleBadgeColor: Record<string, string> = {
    ADMIN: '#ef4444', CEO: '#eab308', PM: '#6366f1', DEV: '#06b6d4',
};

export default function UserManagementPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState({ username: '', email: '', role: 'DEV', password: '' });

    const load = () => {
        getUsers().then((r) => setUsers(r.data.results ?? r.data)).catch(() => { });
    };
    useEffect(load, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editId) {
                const { password, ...rest } = form;
                await updateUser(editId, rest);
            } else {
                await createUser(form);
            }
            setShowForm(false);
            setEditId(null);
            setForm({ username: '', email: '', role: 'DEV', password: '' });
            load();
        } catch { }
    };

    const handleEdit = (u: any) => {
        setEditId(u.id);
        setForm({ username: u.username, email: u.email || '', role: u.role, password: '' });
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Delete this user?')) {
            await deleteUser(id);
            load();
        }
    };

    return (
        <div className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Users size={24} /> User Management
                    </h1>
                    <p style={{ color: '#94a3b8', marginTop: 4 }}>{users.length} user{users.length !== 1 ? 's' : ''} registered</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ username: '', email: '', role: 'DEV', password: '' }); }}>
                    <Plus size={18} /> Add User
                </button>
            </div>

            {/* Create / Edit Form */}
            {showForm && (
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{editId ? 'Edit User' : 'Create New User'}</h3>
                        <button className="btn btn-outline" style={{ padding: '0.3rem' }} onClick={() => { setShowForm(false); setEditId(null); }}>
                            <X size={16} />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <input placeholder="Username" required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
                        <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                        {!editId && (
                            <input placeholder="Password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                        )}
                        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
                            <button type="submit" className="btn btn-primary"><Check size={16} /> {editId ? 'Update' : 'Create'}</button>
                            <button type="button" className="btn btn-outline" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Users Table */}
            <div className="card">
                <div style={{ overflow: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #334155' }}>
                                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>Username</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>Email</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>Role</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>Status</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>Joined</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u: any) => (
                                <tr key={u.id} style={{ borderBottom: '1px solid #1e293b' }}>
                                    <td style={{ padding: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{
                                                width: 32, height: 32, borderRadius: '50%',
                                                background: `linear-gradient(135deg, ${roleBadgeColor[u.role] || '#6366f1'}, ${roleBadgeColor[u.role] || '#6366f1'}80)`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.75rem', fontWeight: 700, color: '#fff',
                                            }}>{u.username?.charAt(0).toUpperCase()}</div>
                                            <span style={{ fontWeight: 500 }}>{u.username}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '0.75rem', color: '#94a3b8' }}>{u.email || '—'}</td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <span style={{
                                            display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: 9999,
                                            fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                                            background: `${roleBadgeColor[u.role] || '#6366f1'}20`,
                                            color: roleBadgeColor[u.role] || '#6366f1',
                                        }}>{u.role}</span>
                                    </td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <span className={`badge ${u.is_active ? 'badge-done' : 'badge-todo'}`}>{u.is_active ? 'Active' : 'Inactive'}</span>
                                    </td>
                                    <td style={{ padding: '0.75rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                                        {new Date(u.date_joined).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                                            <button className="btn btn-outline" style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleEdit(u)}>
                                                <Edit2 size={14} />
                                            </button>
                                            <button className="btn btn-outline" style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', borderColor: '#ef444440', color: '#ef4444' }} onClick={() => handleDelete(u.id)}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No users found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
