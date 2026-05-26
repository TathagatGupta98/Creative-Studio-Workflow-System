import { useState } from 'react';
import api from '../api/axios';
import { X, Save, AlertCircle } from 'lucide-react';
import NeoSelect from './NeoSelect';

export default function ManageProjectModal({ project, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description || '',
    status: project.status
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const statusOptions = [
    { value: 'DRAFT', label: 'Draft' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.patch(`/projects/${project.id}/`, formData);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to update project:', err);
      setError('Failed to update project. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--neo-border)]/60 backdrop-blur-sm">
      <div className="w-full max-w-md neo-surface neo-border-thick neo-shadow bg-white animate-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b-4 border-[var(--neo-border)]">
          <h2 className="neo-title-md">Manage Project</h2>
          <button
            onClick={onClose}
            className="neo-icon-btn p-1 hover:rotate-90 transition-transform"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-[var(--neo-red)] text-white neo-border neo-label-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="neo-label-md">Project Title</label>
            <input
              type="text"
              required
              className="neo-input neo-radius-none w-full"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="neo-label-md">Status</label>
            <NeoSelect
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={statusOptions}
            />
          </div>

          <div className="space-y-2">
            <label className="neo-label-md">Description</label>
            <textarea
              className="neo-input neo-radius-none w-full h-32 resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 neo-btn neo-radius-none py-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 neo-btn neo-btn-secondary neo-radius-none py-3 flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
