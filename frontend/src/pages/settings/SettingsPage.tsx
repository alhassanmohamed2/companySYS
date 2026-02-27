import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { getMe, updateMe, changePassword } from '../../services/api';
import { Settings, User, Lock, Check, AlertCircle } from 'lucide-react';

const roleLabels: Record<string, string> = {
    ADMIN: 'System Admin', CEO: 'CEO', PM: 'Project Manager', DEV: 'Developer',
};

export default function SettingsPage() {
    const { username, role } = useAuthStore();
    const [profile, setProfile] = useState({ username: '', email: '' });
    const [passwords, setPasswords] = useState({ old_password: '', new_password: '', confirm: '' });
    const [profileMsg, setProfileMsg] = useState<{ type: string; text: string } | null>(null);
    const [pwMsg, setPwMsg] = useState<{ type: string; text: string } | null>(null);

    useEffect(() => {
        getMe().then((r) => setProfile({ username: r.data.username, email: r.data.email || '' })).catch(() => { });
    }, []);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateMe({ email: profile.email });
            setProfileMsg({ type: 'success', text: 'Profile updated!' });
            setTimeout(() => setProfileMsg(null), 3000);
        } catch {
            setProfileMsg({ type: 'error', text: 'Failed to update profile.' });
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwMsg(null);
        if (passwords.new_password !== passwords.confirm) {
            setPwMsg({ type: 'error', text: 'New passwords do not match.' });
            return;
        }
        if (passwords.new_password.length < 6) {
            setPwMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
            return;
        }
        try {
            await changePassword(passwords.old_password, passwords.new_password);
            setPwMsg({ type: 'success', text: 'Password changed successfully! Use your new password next time you log in.' });
            setPasswords({ old_password: '', new_password: '', confirm: '' });
        } catch (err: any) {
            const msg = err.response?.data?.old_password || 'Failed to change password.';
            setPwMsg({ type: 'error', text: typeof msg === 'string' ? msg : msg[0] });
        }
    };

    const MsgBox = ({ msg }: { msg: { type: string; text: string } }) => (
        <div style={{
            padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.85rem', marginBottom: '1rem',
            display: 'flex', alignItems: 'center', gap: 8,
            background: msg.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${msg.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
            color: msg.type === 'success' ? '#22c55e' : '#ef4444',
        }}>
            {msg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
            {msg.text}
        </div>
    );

    return (
        <div className="animate-in">
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Settings size={24} /> Settings
                </h1>
                <p style={{ color: '#94a3b8', marginTop: 4 }}>Manage your account and security</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Profile Card */}
                <div className="card">
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <User size={18} color="#6366f1" /> Profile
                    </h3>
                    {profileMsg && <MsgBox msg={profileMsg} />}
                    <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6, fontWeight: 500 }}>Username</label>
                            <input value={profile.username} disabled style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6, fontWeight: 500 }}>Email</label>
                            <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} style={{ width: '100%' }} placeholder="your@email.com" />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6, fontWeight: 500 }}>Role</label>
                            <input value={roleLabels[role ?? ''] ?? 'User'} disabled style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed' }} />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                            <Check size={16} /> Save Profile
                        </button>
                    </form>
                </div>

                {/* Password Card */}
                <div className="card">
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Lock size={18} color="#eab308" /> Change Password
                    </h3>
                    {pwMsg && <MsgBox msg={pwMsg} />}
                    <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6, fontWeight: 500 }}>Current Password</label>
                            <input type="password" required value={passwords.old_password} onChange={(e) => setPasswords({ ...passwords, old_password: e.target.value })} style={{ width: '100%' }} placeholder="Enter current password" />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6, fontWeight: 500 }}>New Password</label>
                            <input type="password" required value={passwords.new_password} onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })} style={{ width: '100%' }} placeholder="At least 6 characters" />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6, fontWeight: 500 }}>Confirm New Password</label>
                            <input type="password" required value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} style={{ width: '100%' }} placeholder="Re-enter new password" />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                            <Lock size={16} /> Change Password
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
