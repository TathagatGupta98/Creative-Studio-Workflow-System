import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import api from '../api/axios';

export default function CreateProjectModal({ onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchUsers() {
      try {
        setFetchingUsers(true);
        const response = await api.get('/users/list/?scope=all');
        setUsers(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setFetchingUsers(false);
      }
    }

    fetchUsers();
  }, []);

  const toggleMember = (userId) => {
    setSelectedMembers((prev) => (
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        title,
        description,
        members: selectedMembers,
      };

      await api.post('/projects/', payload);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-900">Create New Project</h3>
          <button onClick={onClose} className="p-1 hover:bg-white rounded-md transition-colors border border-transparent hover:border-slate-200">
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Project Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="e.g., Summer Campaign 2026"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[100px]"
              placeholder="What is this project about?"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Team Members</label>
            <div className="border border-slate-200 rounded-xl px-3 py-2 text-sm max-h-40 overflow-y-auto space-y-2">
              {fetchingUsers && (
                <p className="text-slate-500">Loading users...</p>
              )}
              {!fetchingUsers && users.length === 0 && (
                <p className="text-slate-500">No users available.</p>
              )}
              {!fetchingUsers && users.map((user) => (
                <label key={user.id} className="flex items-center gap-2 text-slate-700">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    checked={selectedMembers.includes(user.id)}
                    onChange={() => toggleMember(user.id)}
                  />
                  <span>{user.username}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Members added here will appear in the task assignee list.
            </p>
          </div>

          {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
