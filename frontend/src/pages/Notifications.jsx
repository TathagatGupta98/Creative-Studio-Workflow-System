import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';
import { Bell, Check, Trash2, Clock } from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get('/projects/notifications/');
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/projects/notifications/${id}/`, { is_read: true });
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/projects/notifications/${id}/`);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  if (loading) return <div className="animate-pulse">Loading notifications...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="neo-title-md">Notifications</h2>
        <button className="neo-btn neo-radius-none px-3 py-2">Mark all as read</button>
      </div>

      <div className="flex flex-col gap-4">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`neo-border-thick neo-shadow px-4 py-4 flex items-start gap-4 ${
                notification.is_read ? 'bg-[var(--neo-surface)]' : 'bg-[var(--neo-surface-muted)]'
              }`}
            >
              <div className="w-10 h-10 neo-border bg-[var(--neo-yellow)] flex items-center justify-center">
                <Bell size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="neo-body-md">
                  {notification.message}
                </p>
                <div className="flex items-center gap-2 mt-2 neo-label-sm text-[var(--neo-text-muted)]">
                  <Clock size={12} />
                  {new Date(notification.created_at).toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!notification.is_read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="neo-icon-btn neo-radius-none p-2"
                    title="Mark as read"
                  >
                    <Check size={16} />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="neo-icon-btn neo-radius-none p-2 hover:bg-[var(--neo-red)] hover:text-white"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="neo-surface neo-border neo-shadow px-6 py-12 text-center">
            <div className="w-16 h-16 neo-border bg-[var(--neo-surface-muted)] flex items-center justify-center mx-auto mb-4">
              <Bell size={28} className="text-[var(--neo-text-muted)]" />
            </div>
            <p className="neo-body-md text-[var(--neo-text-muted)]">All caught up. No new notifications.</p>
          </div>
        )}
      </div>
    </div>
  );
}
