import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';
import { Plus, Filter, Calendar, Trash2 } from 'lucide-react';
import CreateProjectModal from '../components/CreateProjectModal';
import ManageProjectModal from '../components/ManageProjectModal';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const handleDeleteProject = async (projectId, projectTitle) => {
    const confirmed = window.confirm(
      `Delete "${projectTitle}" and all its tasks, comments, attachments, and notifications?`
    );
    if (!confirmed) return;

    try {
      await api.delete(`/projects/${projectId}/`);
      fetchProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const fetchProjects = useCallback(async () => {
    try {
      const response = await api.get('/projects/');
      setProjects(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusLabel = (status) => (status || 'DRAFT').replace('_', ' ');
  const getStatusClass = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'neo-chip--completed';
      case 'IN_PROGRESS':
        return 'neo-chip--active';
      case 'REVIEW':
        return 'neo-chip--review';
      case 'OVERDUE':
        return 'neo-chip--overdue';
      default:
        return 'neo-chip--draft';
    }
  };

  const getStatusBar = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-[var(--neo-mint)]';
      case 'IN_PROGRESS':
        return 'bg-[var(--neo-blue)]';
      case 'REVIEW':
        return 'bg-[var(--neo-yellow)]';
      case 'OVERDUE':
        return 'bg-[var(--neo-red)]';
      default:
        return 'bg-[var(--neo-surface-variant)]';
    }
  };

  const formatDate = (value) => {
    if (!value) return 'No date';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'No date';
    return date.toLocaleDateString();
  };

  if (loading) return <div className="animate-pulse">Loading projects...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div>
          <h2 className="neo-title-xl">Projects</h2>
          <p className="neo-body-lg text-[var(--neo-text-muted)]">
            Manage your active creative workflows.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 min-w-[220px]">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="neo-input neo-radius-none w-full pl-10"
            />
          </div>
          <button className="neo-btn neo-radius-none px-4 py-2 flex items-center gap-2">
            <Filter size={18} />
            Filters
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="neo-btn neo-btn-secondary neo-radius-none px-4 py-2 flex items-center gap-2"
          >
            <Plus size={18} />
            Create Project
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="neo-border neo-shadow neo-shadow-hover bg-[var(--neo-surface)] flex flex-col">
            <div className={`h-3 w-full ${getStatusBar(project.status)} border-b-2 border-[var(--neo-border)]`} />
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <span className={`neo-chip ${getStatusClass(project.status)}`}>
                  {getStatusLabel(project.status)}
                </span>
                <div className="flex items-center gap-2">
                  
                  <button
                    type="button"
                    onClick={() => handleDeleteProject(project.id, project.title)}
                    className="neo-icon-btn neo-radius-none p-2 text-[var(--neo-text)] hover:text-white hover:bg-[var(--neo-red)]"
                    aria-label={`Delete ${project.title}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3 className="neo-title-md mb-2">{project.title}</h3>
              <p className="neo-body-md text-[var(--neo-text-muted)] mb-6 line-clamp-3">
                {project.description || 'No description provided.'}
              </p>

              <div className="mt-auto flex items-center gap-4 neo-label-sm text-[var(--neo-text-muted)]">
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  {formatDate(project.created_at)}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 neo-border bg-[var(--neo-surface-muted)] flex items-center justify-center">
                    {project.tasks?.length || 0}
                  </div>
                  Tasks
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t-2 border-[var(--neo-border)] bg-[var(--neo-surface-muted)] flex items-center justify-between">
              <div className="w-8 h-8 neo-border bg-[var(--neo-yellow)] flex items-center justify-center">
                <span className="neo-label-sm">{project.owner?.username?.[0]?.toUpperCase() || 'U'}</span>
              </div>
              <button 
                onClick={() => setEditingProject(project)}
                className="neo-label-md underline hover:text-[var(--neo-blue)] transition-colors"
              >
                Manage Project
              </button>
            </div>
          </div>
        ))}
        {filteredProjects.length === 0 && (
          <div className="col-span-full py-16 text-center neo-surface neo-border neo-shadow">
            <h3 className="neo-title-md">No projects found</h3>
            <p className="neo-body-md text-[var(--neo-text-muted)]">
              Try adjusting your search or create a new project.
            </p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchProjects}
        />
      )}

      {editingProject && (
        <ManageProjectModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSuccess={fetchProjects}
        />
      )}
    </div>
  );
}

