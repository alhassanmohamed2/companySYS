import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LogIn, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const login = useAuthStore((s) => s.login);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(username, password);
            navigate('/');
        } catch {
            setError('Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
            width: '100%',
        }}>
            <div className="animate-in" style={{
                width: '100%', maxWidth: 420, padding: '2.5rem',
                background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(16px)',
                borderRadius: '1.25rem', border: '1px solid rgba(99,102,241,0.2)',
                boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: '1rem', margin: '0 auto 1rem',
                        background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <ShieldCheck size={28} color="#fff" />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>CompanySYS</h1>
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: 4 }}>
                        Enterprise Project Management
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {error && (
                        <div style={{
                            padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.85rem',
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444',
                        }}>{error}</div>
                    )}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6, fontWeight: 500 }}>
                            Username
                        </label>
                        <input
                            type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            required style={{ width: '100%' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6, fontWeight: 500 }}>
                            Password
                        </label>
                        <input
                            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required style={{ width: '100%' }}
                        />
                    </div>
                    <button className="btn btn-primary" type="submit" disabled={loading}
                        style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '0.75rem' }}>
                        <LogIn size={18} />
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                    Demo: admin / pm1 / dev1 / ceo — password: password123
                </p>
            </div>
        </div>
    );
}
