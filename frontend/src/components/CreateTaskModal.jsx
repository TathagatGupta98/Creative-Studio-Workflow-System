import { useState, useEffect } from 'react';
import { X, Calendar, User, Folder } from 'lucide-react';
import api from '../api/axios';

export default function CreateTaskModal({ onClose, onSuccess, initialProjectId, currentUser }) {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: initialProjectId || '',
    assigned_to: '',
    priority: 'MEDIUM',
    status: 'DRAFT',
    deadline: ''
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [projRes, tasksRes] = await Promise.all([
          api.get('/projects/'),
          api.get('/projects/tasks/')
        ]);
        
        setProjects(projRes.data);
        
        // Discover users from existing tasks + current user
        const discoveredUsers = [];
        const userMap = new Map();
        
        if (currentUser) {
          userMap.set(currentUser.id, currentUser.username);
          discoveredUsers.push({ id: currentUser.id, username: currentUser.username });
        }
        
        tasksRes.data.forEach(task => {
          if (task.assigned_to && !userMap.has(task.assigned_to)) {
            userMap.set(task.assigned_to, task.assigned_to_username);
            discoveredUsers.push({ id: task.assigned_to, username: task.assigned_to_username });
          }
        });
        
        setUsers(discoveredUsers);
        
        if (!formData.project && projRes.data.length > 0) {
          setFormData(prev => ({ ...prev, project: projRes.data[0].id }));
        }
      } catch (err) {
        console.error('Failed to fetch modal data:', err);
      } finally {
        setFetching(false);
      }
    }
    fetchData();
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        project: formData.project ? Number(formData.project) : formData.project,
        assigned_to: formData.assigned_to ? Number(formData.assigned_to) : null,
        deadline: formData.deadline || null,
        tags: [],
      };

      await api.post('/projects/tasks/', payload);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-900">Create New Task</h3>
          <button onClick={onClose} className="p-1 hover:bg-white rounded-md transition-colors border border-transparent hover:border-slate-200">
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Task Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="What needs to be done?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Folder size={14} /> Project
              </label>
              <select
                value={formData.project}
                onChange={(e) => setFormData({...formData, project: e.target.value})}
                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                required
              >
                <option value="">Select Project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <User size={14} /> Assignee
              </label>
              <select
                value={formData.assigned_to}
                onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="">Unassigned</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar size={14} /> Deadline
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px]"
              placeholder="Task details..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-lg transition-all disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
