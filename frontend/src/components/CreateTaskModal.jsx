import { useState, useEffect } from 'react';
import { X, Calendar, User, Folder } from 'lucide-react';
import api from '../api/axios';

export default function CreateTaskModal({ onClose, onSuccess, initialProjectId, currentUser }) {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  
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
        setError('');
        const projRes = await api.get('/projects/');
        const projectList = Array.isArray(projRes.data) ? projRes.data : [];

        setProjects(projectList);

        if (!formData.project && projectList.length > 0) {
          setFormData(prev => ({ ...prev, project: projectList[0].id }));
        }
      } catch (err) {
        console.error('Failed to fetch modal data:', err);
        setError('Failed to load project or user data.');
      } finally {
        setFetching(false);
      }
    }
    fetchData();
  }, [currentUser]);

  useEffect(() => {
    const selectedProject = projects.find(
      (project) => String(project.id) === String(formData.project)
    );
    const members = selectedProject?.members_details || [];
    const availableUsers = members.length > 0
      ? members
      : currentUser
        ? [{ id: currentUser.id, username: currentUser.username }]
        : [];

    setUsers(availableUsers);

    if (
      formData.assigned_to &&
      !availableUsers.some((member) => String(member.id) === String(formData.assigned_to))
    ) {
      setFormData((prev) => ({ ...prev, assigned_to: '' }));
    }
  }, [projects, formData.project, currentUser]);

  const getErrorMessage = (err) => {
    const data = err?.response?.data;
    if (!data) return 'Failed to create task.';
    if (typeof data === 'string') return data;
    if (data.detail) return data.detail;

    const entries = Object.entries(data);
    if (entries.length === 0) return 'Failed to create task.';

    return entries
      .map(([key, value]) => {
        const message = Array.isArray(value) ? value.join(' ') : value;
        return `${key}: ${message}`;
      })
      .join(' | ');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
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
      setError(getErrorMessage(err));
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
              {users.length === 0 && (
                <p className="text-xs text-slate-500 mt-2">
                  Add members to the project to assign tasks.
                </p>
              )}
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

          {error && (
            <div className="flex items-center gap-2 text-rose-600 bg-rose-50 px-4 py-2 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

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
