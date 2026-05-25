import { useCallback, useEffect, useState } from 'react';
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

  const fetchTasks = useCallback(async () => {
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
  }, [searchTerm, tagFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      case 'HIGH':
        return 'bg-[var(--neo-red)] text-white';
      case 'MEDIUM':
        return 'bg-[var(--neo-yellow)] text-[var(--neo-text)]';
      default:
        return 'bg-[var(--neo-surface-variant)] text-[var(--neo-text)]';
    }
  };

  const getAssigneeLabel = (task) => {
    const names = task.assignees_details?.map((user) => user.username) || [];
    if (names.length === 0) return 'Unassigned';
    if (names.length <= 2) return names.join(', ');
    return `${names.slice(0, 2).join(', ')} +${names.length - 2}`;
  };

  if (loading) return <div className="animate-pulse">Loading tasks...</div>;

  const statusFilterStyles = {
    ALL: 'bg-[var(--neo-blue)] text-white',
    DRAFT: 'bg-[var(--neo-surface)] text-[var(--neo-text)]',
    REVIEW: 'bg-[var(--neo-yellow)] text-[var(--neo-text)]',
    REVISION: 'bg-[var(--neo-blue-bright)] text-white',
    APPROVED: 'bg-[var(--neo-mint)] text-[var(--neo-text)]',
    COMPLETED: 'bg-[var(--neo-mint)] text-[var(--neo-text)]',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div>
          <h2 className="neo-title-xl">Tasks Management</h2>
          <p className="neo-body-lg text-[var(--neo-text-muted)]">Track active work and move fast.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 min-w-[220px]">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="neo-input neo-radius-none w-full pl-10"
            />
          </div>
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Filter by tag"
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="neo-input neo-radius-none w-full pl-10"
            />
          </div>
          <button
            type="button"
            onClick={fetchTasks}
            className="neo-btn neo-radius-none px-4 py-2 flex items-center gap-2"
          >
            <Search size={16} />
            Search
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="neo-btn neo-btn-secondary neo-radius-none px-4 py-2 flex items-center gap-2"
          >
            <Plus size={18} />
            New Task
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {['ALL', 'DRAFT', 'REVIEW', 'REVISION', 'APPROVED', 'COMPLETED'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`neo-label-md px-4 py-2 border-2 border-[var(--neo-border)] transition-all ${
              statusFilter === status
                ? `neo-shadow ${statusFilterStyles[status] || 'bg-[var(--neo-surface)] text-[var(--neo-text)]'}`
                : 'bg-[var(--neo-surface)] text-[var(--neo-text)] hover:bg-[var(--neo-surface-high)]'
            }`}
          >
            {status === 'ALL' ? 'All Tasks' : status.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            onClick={() => setSelectedTaskId(task.id)}
            className="neo-surface neo-border-thick neo-shadow neo-shadow-hover px-4 py-4 cursor-pointer"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-1">{getStatusIcon(task.status)}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="neo-title-md">{task.title}</h3>
                    <span className={`neo-chip ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-2 neo-label-sm text-[var(--neo-text-muted)]">
                    <div className="flex items-center gap-2">
                      <User size={14} />
                      {getAssigneeLabel(task)}
                    </div>
                    {task.deadline && (
                      <div className="flex items-center gap-2">
                        <AlertCircle
                          size={14}
                          className={new Date(task.deadline) < new Date() ? 'text-[var(--neo-red)]' : ''}
                        />
                        {new Date(task.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  {task.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {task.tags.map((tag) => (
                        <span key={tag} className="neo-tag">
                          <TagIcon size={10} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {task.comments_count > 0 && (
                  <div className="flex items-center gap-2 neo-label-sm text-[var(--neo-text-muted)]">
                    <MessageSquare size={14} />
                    {task.comments_count}
                  </div>
                )}
                {task.attachments?.length > 0 && (
                  <div className="flex items-center gap-2 neo-label-sm text-[var(--neo-text-muted)]">
                    <Paperclip size={14} />
                    {task.attachments.length}
                  </div>
                )}
                <ChevronRight size={18} className="text-[var(--neo-text-muted)]" />
              </div>
            </div>
          </div>
        ))}
        {filteredTasks.length === 0 && (
          <div className="neo-surface neo-border neo-shadow px-6 py-12 text-center">
            <p className="neo-body-md text-[var(--neo-text-muted)]">No tasks found in this category.</p>
          </div>
        )}
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
