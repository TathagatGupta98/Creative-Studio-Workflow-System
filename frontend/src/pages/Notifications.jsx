import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Bell, Check, Trash2, Clock } from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/projects/notifications/');
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
        <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Mark all as read</button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <div key={notification.id} className={`p-4 flex items-start gap-4 transition-colors ${notification.is_read ? 'bg-white' : 'bg-indigo-50/30'}`}>
              <div className={`mt-1 p-2 rounded-lg ${notification.is_read ? 'bg-slate-100 text-slate-400' : 'bg-indigo-100 text-indigo-600'}`}>
                <Bell size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${notification.is_read ? 'text-slate-600' : 'text-slate-900 font-medium'}`}>
                  {notification.message}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                    <Clock size={12} />
                    {new Date(notification.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!notification.is_read && (
                  <button 
                    onClick={() => markAsRead(notification.id)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all"
                    title="Mark as read"
                  >
                    <Check size={16} />
                  </button>
                )}
                <button 
                  onClick={() => deleteNotification(notification.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell size={32} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">All caught up! No new notifications.</p>
          </div>
        )}
      </div>
    </div>
  );
}
