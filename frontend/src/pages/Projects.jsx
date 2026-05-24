import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Plus, Search, Filter, MoreVertical, Calendar, Trash2 } from 'lucide-react';
import CreateProjectModal from '../components/CreateProjectModal';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

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

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects/');
      setProjects(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div className="animate-pulse">Loading projects...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
            <Filter size={18} />
            Filters
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 rounded-lg text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm shadow-indigo-100 transition-all"
          >
            <Plus size={18} />
            New Project
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <div key={project.id} className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all overflow-hidden flex flex-col">
            <div className="p-5 flex-1">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  project.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                  project.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {project.status.replace('_', ' ')}
                </span>
                <div className="flex items-center gap-2">
                  <button className="text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteProject(project.id, project.title)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    aria-label={`Delete ${project.title}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                {project.title}
              </h3>
              <p className="text-sm text-slate-500 line-clamp-2 mb-6">
                {project.description || 'No description provided.'}
              </p>
              
              <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {new Date(project.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">
                    {project.tasks?.length || 0}
                  </div>
                  Tasks
                </div>
              </div>
            </div>
            
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-indigo-600">
                  {project.owner?.[0]?.toUpperCase()}
                </div>
              </div>
              <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                Manage Project →
              </button>
            </div>
          </div>
        ))}
        {filteredProjects.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderKanban size={32} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No projects found</h3>
            <p className="text-slate-500">Try adjusting your search or create a new project.</p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateProjectModal 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={fetchProjects} 
        />
      )}
    </div>
  );
}

