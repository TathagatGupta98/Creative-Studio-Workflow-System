import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle,
  Search,
  ChevronRight,
  User,
  Tag as TagIcon,
  MessageSquare,
  Paperclip,
  Plus
} from 'lucide-react';
import TaskDetail from '../components/TaskDetail';
import CreateTaskModal from '../components/CreateTaskModal';

export default function Tasks() {
  const { user: currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = {};
      const searchValue = searchTerm.trim();
      const tagValue = tagFilter.trim();

      if (searchValue) {
        params.search = searchValue;
      }

      if (tagValue) {
        params.tag = tagValue;
      }

      const response = await api.get('/projects/tasks/', { params });
      setTasks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(t => 
    statusFilter === 'ALL' ? true : t.status === statusFilter
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle2 size={18} className="text-emerald-500" />;
      case 'REVIEW': return <Clock size={18} className="text-amber-500" />;
      case 'DRAFT': return <Circle size={18} className="text-slate-300" />;
      default: return <Clock size={18} className="text-blue-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'text-rose-600 bg-rose-50';
      case 'MEDIUM': return 'text-amber-600 bg-amber-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const getAssigneeLabel = (task) => {
    const names = task.assignees_details?.map((user) => user.username) || [];
    if (names.length === 0) return 'Unassigned';
    if (names.length <= 2) return names.join(', ');
    return `${names.slice(0, 2).join(', ')} +${names.length - 2}`;
  };

  if (loading) return <div className="animate-pulse">Loading tasks...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:flex-1">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="relative w-full sm:w-64">
            <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Filter by tag"
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
          <button
            type="button"
            onClick={fetchTasks}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all w-full sm:w-auto"
          >
            <Search size={16} />
            Search
          </button>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 rounded-lg text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm transition-all w-full lg:w-auto"
        >
          <Plus size={18} />
          New Task
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
        {['ALL', 'DRAFT', 'REVIEW', 'REVISION', 'APPROVED', 'COMPLETED'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              statusFilter === status 
                ? 'bg-slate-900 text-white' 
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            {status === 'ALL' ? 'All Tasks' : status.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredTasks.map(task => (
            <div 
              key={task.id} 
              onClick={() => setSelectedTaskId(task.id)}
              className="p-4 hover:bg-slate-50 transition-colors group cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">{getStatusIcon(task.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-slate-900 truncate pr-4">{task.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <User size={14} />
                      {getAssigneeLabel(task)}
                    </div>
                    {task.deadline && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <AlertCircle size={14} className={new Date(task.deadline) < new Date() ? 'text-rose-500' : ''} />
                        {new Date(task.deadline).toLocaleDateString()}
                      </div>
                    )}
                    <div className="flex items-center gap-3 ml-auto">
                      {task.comments?.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <MessageSquare size={14} />
                          {task.comments.length}
                        </div>
                      )}
                      {task.attachments?.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Paperclip size={14} />
                          {task.attachments.length}
                        </div>
                      )}
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                  
                  {task.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {task.tags.map(tag => (
                        <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium">
                          <TagIcon size={10} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filteredTasks.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-slate-500">No tasks found in this category.</p>
            </div>
          )}
        </div>
      </div>

      {selectedTaskId && (
        <TaskDetail 
          taskId={selectedTaskId} 
          onClose={() => setSelectedTaskId(null)} 
          onUpdate={fetchTasks}
        />
      )}

      {showCreateModal && (
        <CreateTaskModal 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={fetchTasks} 
          currentUser={currentUser}
        />
      )}
    </div>
  );
}
