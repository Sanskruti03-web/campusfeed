"use client";

import { useEffect, useState } from 'react';
import { notificationsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Bell, MessageSquare, Heart } from 'lucide-react';

interface Notification {
    id: number;
    type: string;
    content: string;
    post_id?: number;
    actor_name: string;
    is_read: boolean;
    created_at: string;
}

export default function NotificationsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifs = async () => {
            try {
                const res = await notificationsAPI.list();
                setNotifications(res.data.notifications);
                // Mark all as read on entering the page? Or manual?
                // Let's mark all as read for convenience
                await notificationsAPI.markAllAsRead();
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchNotifs();
    }, [user]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'comment_reply': return <MessageSquare className="text-blue-500" />;
            case 'post_reaction': return <Heart className="text-pink-500" />;
            default: return <Bell className="text-[var(--color-highlight)]" />;
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
            <h1 className="text-2xl font-bold font-outfit mb-6 px-4">Notifications</h1>

            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-highlight)]"></div>
                </div>
            ) : notifications.length === 0 ? (
                <div className="text-center py-20 bg-[var(--color-surface)] rounded-3xl mx-4 border border-[var(--color-border)]">
                    <Bell className="mx-auto h-12 w-12 text-[var(--color-text-muted)] opacity-50 mb-4" />
                    <p className="text-[var(--color-text-muted)]">No notifications yet.</p>
                </div>
            ) : (
                <div className="space-y-2 mx-4">
                    {notifications.map(notif => (
                        <div
                            key={notif.id}
                            onClick={() => notif.post_id && router.push(`/posts/${notif.post_id}`)}
                            className="flex items-start gap-4 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl cursor-pointer hover:bg-[var(--color-surface-soft)] transition-colors"
                        >
                            <div className="mt-1 p-2 bg-[var(--color-bg-deep)] rounded-full">
                                {getIcon(notif.type)}
                            </div>
                            <div className="flex-1">
                                <p className="text-[var(--color-text)] leading-snug">
                                    <span className="font-semibold">{notif.actor_name}</span> {notif.content.replace(notif.actor_name + ' ', '')}
                                </p>
                                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                                </p>
                            </div>
                            {!notif.is_read && (
                                <div className="w-2 h-2 rounded-full bg-[var(--color-highlight)] mt-2" />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
