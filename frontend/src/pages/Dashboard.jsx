import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { FolderKanban, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import CreateProjectModal from '../components/CreateProjectModal';

export default function Dashboard() {
  const { user: currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeTasks: 0,
    completedTasks: 0,
    overdueTasks: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchDashboardData = async () => {
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
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <div className="animate-pulse">Loading...</div>;

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Projects" 
          value={stats.totalProjects} 
          icon={<FolderKanban className="text-blue-600" />}
          color="bg-blue-50"
        />
        <StatCard 
          title="Active Tasks" 
          value={stats.activeTasks} 
          icon={<Clock className="text-amber-600" />}
          color="bg-amber-50"
        />
        <StatCard 
          title="Completed" 
          value={stats.completedTasks} 
          icon={<CheckCircle2 className="text-emerald-600" />}
          color="bg-emerald-50"
        />
        <StatCard 
          title="Overdue" 
          value={stats.overdueTasks} 
          icon={<AlertCircle className="text-rose-600" />}
          color="bg-rose-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Projects */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-semibold text-slate-800">Recent Projects</h2>
            <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">View all</button>
          </div>
          <div className="divide-y divide-slate-100">
            {recentProjects.length > 0 ? (
              recentProjects.map(project => (
                <div key={project.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <h3 className="font-medium text-slate-900">{project.title}</h3>
                    <p className="text-sm text-slate-500">{project.tasks?.length || 0} tasks</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    project.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                    project.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {project.status.replace('_', ' ')}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center text-slate-500">
                No projects found. Create your first project to get started!
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions / Tips */}
        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-xl p-6 text-white shadow-lg shadow-indigo-200">
            <h3 className="text-lg font-semibold mb-2">Welcome to StudioFlow</h3>
            <p className="text-indigo-100 text-sm mb-4">
              Manage your creative workflows, track tasks, and collaborate with your team efficiently.
            </p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="w-full py-2 bg-white text-indigo-600 rounded-lg font-semibold text-sm hover:bg-indigo-50 transition-colors"
            >
              New Project
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

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
