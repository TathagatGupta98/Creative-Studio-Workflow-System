import { useState, useEffect } from 'react';
import { X, Calendar, User, Folder } from 'lucide-react';
import api from '../api/axios';
import NeoSelect from './NeoSelect';

export default function CreateTaskModal({ onClose, onSuccess, initialProjectId, currentUser }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: initialProjectId || '',
    assignees: [],
    priority: 'MEDIUM',
    status: 'DRAFT',
    deadline: ''
  });

  const getAvailableUsersForProject = (project, previousAssignees = []) => {
    const members = project?.members_details || [];
    const availableUsers = members.length > 0
      ? members
      : currentUser
        ? [{ id: currentUser.id, username: currentUser.username }]
        : [];

    const filteredAssignees = previousAssignees.filter((assigneeId) =>
      availableUsers.some((member) => String(member.id) === String(assigneeId))
    );

    return {
      availableUsers,
      assignees: filteredAssignees.length > 0
        ? filteredAssignees
        : availableUsers.length > 0
          ? [String(availableUsers[0].id)]
          : [],
    };
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setError('');
        const projRes = await api.get('/projects/');
        const projectList = Array.isArray(projRes.data) ? projRes.data : [];

        setProjects(projectList);

        const selectedProject = projectList.find(
          (project) => String(project.id) === String(formData.project)
        ) || projectList[0];

        if (selectedProject) {
          const { assignees } = getAvailableUsersForProject(selectedProject, formData.assignees);
          setFormData((prev) => ({
            ...prev,
            project: prev.project || selectedProject.id,
            assignees,
          }));
        }
      } catch (err) {
        console.error('Failed to fetch modal data:', err);
        setError('Failed to load project or user data.');
      } finally {
        setFetching(false);
      }
    }
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const selectedProject = projects.find(
    (project) => String(project.id) === String(formData.project)
  );
  const users = getAvailableUsersForProject(selectedProject, formData.assignees).availableUsers;

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
      if (formData.assignees.length === 0) {
        setError('Select at least one assignee.');
        setLoading(false);
        return;
      }

      const tags = tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        project: formData.project ? Number(formData.project) : formData.project,
        assignees: formData.assignees.map((assigneeId) => Number(assigneeId)),
        deadline: formData.deadline || null,
        tags,
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

  const toggleAssignee = (assigneeId) => {
    setFormData((prev) => {
      const assignees = prev.assignees.includes(assigneeId)
        ? prev.assignees.filter((id) => id !== assigneeId)
        : [...prev.assignees, assigneeId];
      return { ...prev, assignees };
    });
  };

  if (fetching) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#1c1c0f]/40 backdrop-blur-sm p-4">
      <div className="neo-surface neo-border-thick neo-shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b-2 border-[var(--neo-border)] flex items-center justify-between bg-[var(--neo-surface-muted)]">
          <h3 className="neo-title-md">Create New Task</h3>
          <button onClick={onClose} className="neo-icon-btn neo-radius-none p-2">
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="neo-label-md block mb-2">Task Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="neo-input neo-radius-none w-full"
              placeholder="What needs to be done?"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="neo-label-md block mb-2 flex items-center gap-2">
                <Folder size={14} /> Project
              </label>
              <NeoSelect
                 value={formData.project}
                 onChange={(e) => {
                   const nextProjectId = e.target.value;
                   const nextProject = projects.find(
                     (project) => String(project.id) === String(nextProjectId)
                   );
                   const { assignees } = getAvailableUsersForProject(nextProject, formData.assignees);

                   setFormData((prev) => ({
                     ...prev,
                     project: nextProjectId,
                     assignees,
                   }));
                 }}
                 options={projects.map(p => ({ value: p.id, label: p.title }))}
                 placeholder="Select Project"
              />
            </div>
            <div>
              <label className="neo-label-md block mb-2 flex items-center gap-2">
                <User size={14} /> Assignees
              </label>
              <div className="neo-border neo-radius-none px-3 py-2 text-sm max-h-40 overflow-y-auto space-y-2 bg-[var(--neo-surface)]">
                {users.map((user) => (
                  <label key={user.id} className="flex items-center gap-2 neo-body-md">
                    <input
                      type="checkbox"
                      className="h-4 w-4 border-2 border-[var(--neo-border)] accent-[var(--neo-blue)]"
                      checked={formData.assignees.includes(String(user.id))}
                      onChange={() => toggleAssignee(String(user.id))}
                    />
                    <span>{user.username}</span>
                  </label>
                ))}
                {users.length === 0 && (
                  <p className="neo-label-sm text-[var(--neo-text-muted)]">
                    Add members to the project to assign tasks.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="neo-label-md block mb-2">Priority</label>
              <NeoSelect
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                options={[
                   { value: 'LOW', label: 'Low' },
                   { value: 'MEDIUM', label: 'Medium' },
                   { value: 'HIGH', label: 'High' }
                ]}
              />
            </div>
            <div>
              <label className="neo-label-md block mb-2 flex items-center gap-2">
                <Calendar size={14} /> Deadline
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                className="neo-input neo-radius-none w-full"
              />
            </div>
          </div>

          <div>
            <label className="neo-label-md block mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="neo-input neo-radius-none w-full min-h-[100px]"
              placeholder="Task details..."
            />
          </div>

          <div>
            <label className="neo-label-md block mb-2">Tags</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="neo-input neo-radius-none w-full"
              placeholder="e.g., branding, homepage, urgent"
            />
            <p className="neo-label-sm text-[var(--neo-text-muted)] mt-2">Separate tags with commas.</p>
          </div>

          {error && (
            <div className="neo-border neo-shadow px-4 py-3 bg-[var(--neo-red)] text-white neo-body-md">
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
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
