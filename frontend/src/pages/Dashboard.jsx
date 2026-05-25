import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { FolderKanban, CheckCircle2, Clock, AlertCircle, Trash2, ArrowRight } from 'lucide-react';
import CreateProjectModal from '../components/CreateProjectModal';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeTasks: 0,
    completedTasks: 0,
    overdueTasks: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        api.get('/projects/'),
        api.get('/projects/tasks/')
      ]);

      const projects = Array.isArray(projectsRes.data) ? projectsRes.data : [];
      const tasks = Array.isArray(tasksRes.data) ? tasksRes.data : [];

      setStats({
        totalProjects: projects.length,
        activeTasks: tasks.filter(t => t.status !== 'COMPLETED').length,
        completedTasks: tasks.filter(t => t.status === 'COMPLETED').length,
        overdueTasks: tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'COMPLETED').length
      });

      setRecentProjects(projects.slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchDashboardData();
  }, [fetchDashboardData]);

  const handleDeleteProject = async (projectId, projectTitle) => {
    const confirmed = window.confirm(
      `Delete "${projectTitle}" and all its tasks, comments, attachments, and notifications?`
    );
    if (!confirmed) return;

    try {
      await api.delete(`/projects/${projectId}/`);
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  if (loading) return <div className="animate-pulse">Loading...</div>;

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

  const formatDate = (value) => {
    if (!value) return 'No date';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'No date';
    return date.toLocaleDateString();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div>
          <h2 className="neo-title-lg">Overview</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Projects"
            value={stats.totalProjects}
            icon={<FolderKanban size={18} />}
            tone="neutral"
          />
          <StatCard
            title="Active Tasks"
            value={stats.activeTasks}
            icon={<Clock size={18} />}
            tone="yellow"
          />
          <StatCard
            title="Completed"
            value={stats.completedTasks}
            icon={<CheckCircle2 size={18} />}
            tone="mint"
          />
          <StatCard
            title="Overdue"
            value={stats.overdueTasks}
            icon={<AlertCircle size={18} />}
            tone="red"
          />
        </div>

        <div className="flex items-end justify-between border-b-4 border-[var(--neo-border)] pb-2">
          <h3 className="neo-title-md">Recent Projects</h3>
          <Link
            to="/projects"
            className="neo-label-md px-2 py-1 border-2 border-transparent hover:border-[var(--neo-border)] hover:bg-[var(--neo-yellow)]"
          >
            View All
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          {recentProjects.length > 0 ? (
            recentProjects.map((project) => (
              <div
                key={project.id}
                className="neo-surface neo-border neo-shadow neo-shadow-hover flex items-center justify-between px-4 py-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 neo-border bg-[var(--neo-surface-high)] flex items-center justify-center">
                    <span className="neo-label-md">
                      {project.title?.[0]?.toUpperCase() || 'P'}
                    </span>
                  </div>
                  <div>
                    <h4 className="neo-body-lg font-bold">{project.title}</h4>
                    <p className="neo-label-sm text-[var(--neo-text-muted)]">
                      {`Updated ${formatDate(project.updated_at || project.created_at)}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`neo-chip ${getStatusClass(project.status)}`}>
                    {getStatusLabel(project.status)}
                  </span>
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
            ))
          ) : (
            <div className="neo-surface neo-border neo-shadow px-6 py-10 text-center">
              <p className="neo-body-md text-[var(--neo-text-muted)]">
                No projects found. Create your first project to get started.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="bg-[var(--neo-blue)] text-white neo-border-thick neo-shadow p-6 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-[var(--neo-yellow)] neo-border-thick rotate-12" />
          <div className="relative">
            <h3 className="neo-title-lg">Ready to Build?</h3>
            <p className="neo-body-lg mt-3 mb-6">
              Start a new project and keep your team moving fast.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-black neo-btn neo-btn-primary neo-radius-none w-full py-3 flex items-center justify-center gap-2"
            >
              New Project
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchDashboardData}
        />
      )}
    </div>
  );
}

function StatCard({ title, value, icon, tone }) {
  const toneClass = {
    neutral: 'bg-[var(--neo-surface)]',
    yellow: 'bg-[var(--neo-yellow)]',
    mint: 'bg-[var(--neo-mint)]',
    red: 'bg-[var(--neo-red)] text-white'
  }[tone] || 'bg-[var(--neo-surface)]';

  return (
    <div className={`neo-border-thick neo-shadow p-4 ${toneClass}`}>
      <div className="flex items-start justify-between">
        <p className="neo-label-md text-[var(--neo-text-muted)]">{title}</p>
        <div className="text-[var(--neo-text)]">{icon}</div>
      </div>
      <p className="neo-title-lg mt-4">{value}</p>
    </div>
  );
}
