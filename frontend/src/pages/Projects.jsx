import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';
import { 
  Plus, 
  Filter, 
  Calendar, 
  Trash2, 
  LayoutGrid, 
  List, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import CreateProjectModal from '../components/CreateProjectModal';
import ManageProjectModal from '../components/ManageProjectModal';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskDetail from '../components/TaskDetail';
import { useAuth } from '../context/AuthContext';

export default function Projects() {
  const { user: currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  
  // Layout and Task Integration States
  const [viewMode, setViewMode] = useState(localStorage.getItem('projectsViewMode') || 'grid');
  const [expandedProjectIds, setExpandedProjectIds] = useState(new Set());
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [createTaskProjectId, setCreateTaskProjectId] = useState(null);

  const toggleProjectExpand = (projectId) => {
    setExpandedProjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  };

  const handleOpenCreateTask = (projectId) => {
    setCreateTaskProjectId(projectId);
    setShowCreateTaskModal(true);
  };

  const getTaskStats = (projectTasks) => {
    const tasks = projectTasks || [];
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  };

  const getMiniStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <div className="w-2.5 h-2.5 bg-[var(--neo-mint)] border border-[var(--neo-border)] shrink-0" title="Completed" />;
      case 'REVIEW':
        return <div className="w-2.5 h-2.5 bg-[var(--neo-yellow)] border border-[var(--neo-border)] shrink-0" title="Review" />;
      case 'REVISION':
        return <div className="w-2.5 h-2.5 bg-[var(--neo-blue-bright)] border border-[var(--neo-border)] shrink-0" title="Revision" />;
      case 'APPROVED':
        return <div className="w-2.5 h-2.5 bg-[var(--neo-mint)] border border-[var(--neo-border)] shrink-0" title="Approved" />;
      default:
        return <div className="w-2.5 h-2.5 bg-[var(--neo-surface-high)] border border-[var(--neo-border)] shrink-0" title="Draft" />;
    }
  };

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

          {/* Grid vs List view buttons */}
          <div className="flex neo-border bg-[var(--neo-surface)]">
            <button
              onClick={() => {
                setViewMode('grid');
                localStorage.setItem('projectsViewMode', 'grid');
              }}
              className={`p-2 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[var(--neo-blue)] text-white'
                  : 'hover:bg-[var(--neo-surface-muted)] text-[var(--neo-text)]'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={18} />
            </button>
            <div className="w-[2px] bg-[var(--neo-border)]" />
            <button
              onClick={() => {
                setViewMode('list');
                localStorage.setItem('projectsViewMode', 'list');
              }}
              className={`p-2 transition-colors ${
                viewMode === 'list'
                  ? 'bg-[var(--neo-blue)] text-white'
                  : 'hover:bg-[var(--neo-surface-muted)] text-[var(--neo-text)]'
              }`}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="neo-btn neo-btn-secondary neo-radius-none px-4 py-2 flex items-center gap-2"
          >
            <Plus size={18} />
            Create Project
          </button>
        </div>
      </div>

      <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-6"}>
        {filteredProjects.map((project) => {
          const taskStats = getTaskStats(project.tasks);

          if (viewMode === 'list') {
            return (
              <div 
                key={project.id} 
                className="neo-border neo-shadow neo-shadow-hover bg-[var(--neo-surface)] flex flex-col transition-all"
              >
                {/* Horizontal row layout */}
                <div className="flex flex-col md:flex-row items-stretch border-b-2 md:border-b-0 border-[var(--neo-border)]">
                  {/* Left accent status strip */}
                  <div className={`w-full md:w-3 min-h-[12px] ${getStatusBar(project.status)} border-b-2 md:border-b-0 md:border-r-2 border-[var(--neo-border)]`} />
                  
                  {/* Content block */}
                  <div className="p-5 flex-1 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Title and Metadata */}
                    <div className="min-w-0 md:flex-[1.5]">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className={`neo-chip ${getStatusClass(project.status)}`}>
                          {getStatusLabel(project.status)}
                        </span>
                        <div className="flex items-center gap-1.5 neo-label-sm text-[var(--neo-text-muted)]">
                          <Calendar size={12} />
                          {formatDate(project.created_at)}
                        </div>
                      </div>
                      <h3 className="neo-title-md truncate">{project.title}</h3>
                      {project.description && (
                        <p className="neo-body-sm text-[var(--neo-text-muted)] mt-1 line-clamp-1">
                          {project.description}
                        </p>
                      )}
                    </div>

                    {/* Progress Bar in center */}
                    <div className="md:flex-1 min-w-[180px]">
                      <div className="flex justify-between items-center mb-1 neo-label-sm text-[var(--neo-text-muted)]">
                        <span>Task Completion</span>
                        <span className="font-bold">{taskStats.percentage}% ({taskStats.completed}/{taskStats.total})</span>
                      </div>
                      <div className="w-full h-3 neo-border bg-[var(--neo-surface-muted)] overflow-hidden">
                        <div
                          className="h-full bg-[var(--neo-mint)] transition-all duration-300 border-r-2 border-[var(--neo-border)]"
                          style={{ width: `${taskStats.percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Team avatars and controls */}
                    <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 md:flex-1">
                      {/* Owner and Members details */}
                      <div className="flex items-center gap-2">
                        {/* Owner */}
                        <div className="w-8 h-8 neo-border bg-[var(--neo-yellow)] flex items-center justify-center" title={`Owner: ${project.owner || 'Unknown'}`}>
                          <span className="neo-label-sm">{project.owner?.[0]?.toUpperCase() || 'U'}</span>
                        </div>
                        {/* Member initials */}
                        {project.members_details?.slice(0, 2).map((member) => (
                          <div key={member.id} className="w-8 h-8 neo-border bg-[var(--neo-surface-muted)] flex items-center justify-center" title={`Member: ${member.username}`}>
                            <span className="neo-label-sm">{member.username?.[0]?.toUpperCase()}</span>
                          </div>
                        ))}
                        {project.members_details?.length > 2 && (
                          <div className="w-8 h-8 neo-border bg-[var(--neo-surface-high)] flex items-center justify-center" title={`${project.members_details.length - 2} more members`}>
                            <span className="neo-label-sm">+{project.members_details.length - 2}</span>
                          </div>
                        )}
                      </div>

                      {/* Controls and Toggles */}
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setEditingProject(project)}
                          className="neo-btn neo-radius-none px-3 py-1.5 neo-label-sm hover:bg-[var(--neo-surface-muted)]"
                        >
                          Manage
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProject(project.id, project.title)}
                          className="neo-icon-btn neo-radius-none p-1.5 text-[var(--neo-text)] hover:text-white hover:bg-[var(--neo-red)]"
                          aria-label={`Delete ${project.title}`}
                        >
                          <Trash2 size={15} />
                        </button>
                        
                        {taskStats.total > 0 ? (
                          <button
                            onClick={() => toggleProjectExpand(project.id)}
                            className="neo-btn neo-btn-secondary neo-radius-none px-3 py-1.5 neo-label-sm flex items-center gap-1"
                          >
                            <span>Tasks</span>
                            {expandedProjectIds.has(project.id) ? (
                              <ChevronUp size={14} />
                            ) : (
                              <ChevronDown size={14} />
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenCreateTask(project.id)}
                            className="neo-btn neo-radius-none px-3 py-1.5 neo-label-sm border-2 border-dashed flex items-center gap-1"
                          >
                            <Plus size={14} />
                            Add Task
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Tasks List for Line View */}
                {expandedProjectIds.has(project.id) && taskStats.total > 0 && (
                  <div className="border-t-2 border-[var(--neo-border)] bg-[var(--neo-surface-muted)] p-5 animate-in slide-in-from-top-4 duration-200">
                    <h4 className="neo-label-md font-bold mb-3">Tasks for {project.title}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {project.tasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => setSelectedTaskId(task.id)}
                          className="neo-surface neo-border neo-shadow-press p-3 cursor-pointer hover:bg-[var(--neo-surface-high)] flex items-center justify-between gap-3 bg-white transition-all"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {getMiniStatusIcon(task.status)}
                            <span className="neo-label-sm font-bold truncate text-[var(--neo-text)]">
                              {task.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {task.priority && (
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 border border-[var(--neo-border)] ${
                                  task.priority === 'HIGH'
                                    ? 'bg-[var(--neo-red)] text-white'
                                    : task.priority === 'MEDIUM'
                                    ? 'bg-[var(--neo-yellow)]'
                                    : 'bg-[var(--neo-surface-variant)]'
                                }`}
                              >
                                {task.priority}
                              </span>
                            )}
                            <div className="w-5 h-5 border border-[var(--neo-border)] bg-[var(--neo-surface-muted)] flex items-center justify-center text-[9px] font-bold" title={`Assignee initials`}>
                              {task.assignees_details?.[0]?.username?.[0]?.toUpperCase() || '?'}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <button
                        onClick={() => handleOpenCreateTask(project.id)}
                        className="neo-surface border-2 border-dashed border-[var(--neo-border)] hover:bg-[var(--neo-surface-high)] p-3 flex items-center justify-center gap-2 neo-label-sm text-[var(--neo-text-muted)] font-bold transition-all"
                      >
                        <Plus size={14} />
                        Add New Task
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          }

          // Otherwise, return standard Grid View card
          return (
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
                <p className="neo-body-md text-[var(--neo-text-muted)] mb-4 line-clamp-3">
                  {project.description || 'No description provided.'}
                </p>

                {/* Progress bar inside Card */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1 neo-label-sm text-[var(--neo-text-muted)]">
                    <span>Task Progress</span>
                    <span className="font-bold">
                      {taskStats.percentage}% ({taskStats.completed}/{taskStats.total})
                    </span>
                  </div>
                  <div className="w-full h-3 neo-border bg-[var(--neo-surface-muted)] overflow-hidden">
                    <div
                      className="h-full bg-[var(--neo-mint)] transition-all duration-300 border-r-2 border-[var(--neo-border)]"
                      style={{ width: `${taskStats.percentage}%` }}
                    />
                  </div>
                </div>

                <div className="mt-auto flex items-center gap-4 neo-label-sm text-[var(--neo-text-muted)]">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    {formatDate(project.created_at)}
                  </div>
                </div>

                {/* Task Collapsible Accordion Toggle */}
                {taskStats.total > 0 ? (
                  <button
                    onClick={() => toggleProjectExpand(project.id)}
                    className="w-full py-2 px-3 mt-4 neo-border bg-[var(--neo-surface-muted)] flex items-center justify-between text-left hover:bg-[var(--neo-surface-high)] transition-all neo-shadow-press"
                  >
                    <span className="neo-label-sm font-bold flex items-center gap-2">
                      Tasks ({taskStats.total})
                    </span>
                    {expandedProjectIds.has(project.id) ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenCreateTask(project.id)}
                    className="w-full py-2 px-3 mt-4 border-2 border-dashed border-[var(--neo-border)] flex items-center justify-center gap-2 neo-label-sm hover:bg-[var(--neo-surface-muted)] transition-colors"
                  >
                    <Plus size={14} />
                    Add First Task
                  </button>
                )}

                {/* Expanded Tasks List */}
                {expandedProjectIds.has(project.id) && taskStats.total > 0 && (
                  <div className="mt-3 border-2 border-[var(--neo-border)] bg-[var(--neo-surface)] p-2 space-y-2 max-h-56 overflow-y-auto neo-shadow-press">
                    {project.tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTaskId(task.id)}
                        className="p-2 border border-[var(--neo-border)] hover:bg-[var(--neo-surface-muted)] cursor-pointer flex items-center justify-between gap-3 bg-[var(--neo-surface)] transition-all"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {getMiniStatusIcon(task.status)}
                          <span className="neo-label-sm font-bold truncate text-[var(--neo-text)]">
                            {task.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {task.priority && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 border border-[var(--neo-border)] ${
                                task.priority === 'HIGH'
                                  ? 'bg-[var(--neo-red)] text-white'
                                  : task.priority === 'MEDIUM'
                                  ? 'bg-[var(--neo-yellow)]'
                                  : 'bg-[var(--neo-surface-variant)]'
                              }`}
                            >
                              {task.priority}
                            </span>
                          )}
                          <div className="w-5 h-5 border border-[var(--neo-border)] bg-[var(--neo-surface-muted)] flex items-center justify-center text-[9px] font-bold" title={`Assignee initials`}>
                            {task.assignees_details?.[0]?.username?.[0]?.toUpperCase() || '?'}
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => handleOpenCreateTask(project.id)}
                      className="w-full py-1.5 border border-dashed border-[var(--neo-border)] hover:bg-[var(--neo-surface-muted)] flex items-center justify-center gap-1.5 neo-label-sm text-[var(--neo-text-muted)] font-bold transition-all"
                    >
                      <Plus size={12} />
                      Add Task
                    </button>
                  </div>
                )}
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
          );
        })}
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

      {selectedTaskId && (
        <TaskDetail 
          taskId={selectedTaskId} 
          onClose={() => setSelectedTaskId(null)} 
          onUpdate={fetchProjects}
        />
      )}

      {showCreateTaskModal && (
        <CreateTaskModal 
          onClose={() => {
            setShowCreateTaskModal(false);
            setCreateTaskProjectId(null);
          }} 
          onSuccess={() => {
            fetchProjects();
            setShowCreateTaskModal(false);
            setCreateTaskProjectId(null);
          }} 
          initialProjectId={createTaskProjectId}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}

