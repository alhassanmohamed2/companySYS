import { useEffect, useState } from 'react';
import { getNotifications, markNotificationRead } from '../../services/api';
import { Bell, CheckCircle2, Inbox } from 'lucide-react';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);

    const load = () => {
        getNotifications().then((r) => setNotifications(r.data.results ?? r.data)).catch(() => { });
    };
    useEffect(load, []);

    const handleMarkRead = async (id: number) => {
        await markNotificationRead(id);
        load();
    };

    const unread = notifications.filter((n) => !n.is_read);
    const read = notifications.filter((n) => n.is_read);

    return (
        <div className="animate-in">
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Bell size={24} /> Notifications
                </h1>
                <p style={{ color: '#94a3b8', marginTop: 4 }}>{unread.length} unread notification{unread.length !== 1 ? 's' : ''}</p>
            </div>

            {notifications.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <Inbox size={48} color="#334155" style={{ margin: '0 auto 1rem' }} />
                    <p style={{ color: '#64748b' }}>No notifications yet</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[...unread, ...read].map((n: any) => (
                        <div key={n.id} className="card" style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            opacity: n.is_read ? 0.6 : 1,
                            borderLeftWidth: 3, borderLeftStyle: 'solid',
                            borderLeftColor: n.is_read ? '#334155' : '#6366f1',
                        }}>
                            <div>
                                <p style={{ fontSize: '0.9rem' }}>{n.message}</p>
                                <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 4 }}>
                                    {new Date(n.created_at).toLocaleString()}
                                </p>
                            </div>
                            {!n.is_read && (
                                <button className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
                                    onClick={() => handleMarkRead(n.id)}>
                                    <CheckCircle2 size={14} /> Mark Read
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
