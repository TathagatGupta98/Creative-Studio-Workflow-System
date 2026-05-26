import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import api from '../api/axios';
import NeoSelect from './NeoSelect';

export default function CreateProjectModal({ onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const statusOptions = [
    { value: 'DRAFT', label: 'Draft' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
  ];

  useEffect(() => {
    async function fetchUsers() {
      try {
        setFetchingUsers(true);
        // Only fetch users for the CURRENT studio
        const response = await api.get('/users/list/');
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
        status,
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
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#1c1c0f]/40 backdrop-blur-sm p-4">
      <div className="neo-surface neo-border-thick neo-shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b-2 border-[var(--neo-border)] flex items-center justify-between bg-[var(--neo-surface-muted)]">
          <h3 className="neo-title-md">Create New Project</h3>
          <button onClick={onClose} className="neo-icon-btn neo-radius-none p-2">
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="neo-label-md block mb-2">Project Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="neo-input neo-radius-none w-full"
              placeholder="e.g., Summer Campaign 2026"
            />
          </div>

          <div>
            <label className="neo-label-md block mb-2">Initial Status</label>
            <NeoSelect 
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={statusOptions}
            />
          </div>
          
          <div>
            <label className="neo-label-md block mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="neo-input neo-radius-none w-full min-h-[110px]"
              placeholder="What is this project about?"
            />
          </div>

          <div>
            <label className="neo-label-md block mb-2">Team Members</label>
            <div className="neo-border neo-radius-none px-3 py-2 text-sm max-h-40 overflow-y-auto space-y-2 bg-[var(--neo-surface)]">
              {fetchingUsers && (
                <p className="neo-body-md text-[var(--neo-text-muted)]">Loading users...</p>
              )}
              {!fetchingUsers && users.length === 0 && (
                <p className="neo-body-md text-[var(--neo-text-muted)]">No users in studio.</p>
              )}
              {!fetchingUsers && users.map((user) => (
                <label key={user.id} className="flex items-center gap-2 neo-body-md">
                  <input
                    type="checkbox"
                    className="h-4 w-4 border-2 border-[var(--neo-border)] accent-[var(--neo-blue)]"
                    checked={selectedMembers.includes(user.id)}
                    onChange={() => toggleMember(user.id)}
                  />
                  <span>{user.username}</span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="neo-border neo-shadow px-3 py-2 bg-[var(--neo-red)] text-white neo-body-md">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 neo-btn neo-radius-none px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 neo-btn neo-btn-secondary neo-radius-none px-4 py-2 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
