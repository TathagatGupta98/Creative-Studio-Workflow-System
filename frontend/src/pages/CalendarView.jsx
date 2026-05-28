import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  ListStart, 
  Clock, 
  AlertCircle,
  Tag as TagIcon,
  User,
  Plus
} from 'lucide-react';
import TaskDetail from '../components/TaskDetail';
import CreateTaskModal from '../components/CreateTaskModal';
import { useAuth } from '../context/AuthContext';

export default function CalendarView() {
  const { user: currentUser } = useAuth();
  const isLeadOrAdmin = currentUser?.role === 'STUDIO_ADMIN' || currentUser?.role === 'PROJECT_LEAD' || currentUser?.current_studio === currentUser?.personal_workspace;

  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' or 'timeline'
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  
  // Create task modal states
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [createTaskProjectId, setCreateTaskProjectId] = useState(null);

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchData = useCallback(async () => {
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        api.get('/projects/'),
        api.get('/projects/tasks/')
      ]);
      setProjects(Array.isArray(projectsRes.data) ? projectsRes.data : []);
      setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);
    } catch (error) {
      console.error('Failed to fetch calendar data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Days in month
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun, 6 is Sat
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Create calendar cells array
  const calendarCells = [];
  // Add empty spaces for previous month's days
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  // Add current month days
  for (let day = 1; day <= totalDays; day++) {
    calendarCells.push(day);
  }

  // Group tasks by deadline date
  const getTasksForDate = (day) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter((t) => t.deadline === dateStr);
  };

  // Group projects by deadline date
  const getProjectsForDate = (day) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return projects.filter((p) => {
      if (!p.created_at) return false;
      const projDeadline = p.tasks?.reduce((latest, task) => {
        if (!task.deadline) return latest;
        if (!latest) return task.deadline;
        return new Date(task.deadline) > new Date(latest) ? task.deadline : latest;
      }, null);
      return projDeadline === dateStr;
    });
  };

  const getMiniStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-[var(--neo-mint)]';
      case 'REVIEW': return 'bg-[var(--neo-yellow)]';
      case 'REVISION': return 'bg-[var(--neo-blue-bright)]';
      case 'APPROVED': return 'bg-[var(--neo-mint)]';
      default: return 'bg-[var(--neo-surface-high)]';
    }
  };

  const handleOpenCreateTask = (projectId) => {
    setCreateTaskProjectId(projectId);
    setShowCreateTaskModal(true);
  };

  if (loading) return <div className="animate-pulse neo-label-md">Loading workspace agenda...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div>
          <h2 className="neo-title-xl">Workspace Agenda</h2>
          <p className="neo-body-lg text-[var(--neo-text-muted)]">
            Track deadlines, visual timelines, and scheduling blocks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Switch tab buttons */}
          <div className="flex neo-border bg-[var(--neo-surface)]">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-4 py-2 neo-label-md transition-all flex items-center gap-2 ${
                activeTab === 'calendar'
                  ? 'bg-[var(--neo-blue)] text-white'
                  : 'hover:bg-[var(--neo-surface-muted)] text-[var(--neo-text)]'
              }`}
            >
              <CalendarIcon size={16} />
              Calendar
            </button>
            <div className="w-[2px] bg-[var(--neo-border)]" />
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-4 py-2 neo-label-md transition-all flex items-center gap-2 ${
                activeTab === 'timeline'
                  ? 'bg-[var(--neo-blue)] text-white'
                  : 'hover:bg-[var(--neo-surface-muted)] text-[var(--neo-text)]'
              }`}
            >
              <ListStart size={16} />
              Timeline
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'calendar' ? (
        <div className="neo-border-thick neo-shadow bg-[var(--neo-surface)] p-6">
          {/* Calendar Header Controls */}
          <div className="flex items-center justify-between border-b-4 border-[var(--neo-border)] pb-4 mb-6">
            <h3 className="neo-title-md">
              {monthNames[month]} {year}
            </h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePrevMonth}
                className="neo-btn neo-radius-none p-2"
                aria-label="Previous month"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={handleNextMonth}
                className="neo-btn neo-radius-none p-2"
                aria-label="Next month"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Calendar Weekday Row */}
          <div className="grid grid-cols-7 gap-2 text-center neo-label-md font-bold mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="py-2 bg-[var(--neo-surface-muted)] border-2 border-[var(--neo-border)]">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-2 auto-rows-[120px]">
            {calendarCells.map((day, idx) => {
              const dayTasks = getTasksForDate(day);
              const dayProjects = getProjectsForDate(day);
              const isToday = day && 
                new Date().getDate() === day && 
                new Date().getMonth() === month && 
                new Date().getFullYear() === year;

              return (
                <div 
                  key={idx} 
                  className={`border-2 border-[var(--neo-border)] p-2 flex flex-col justify-between overflow-hidden transition-all ${
                    day 
                      ? isToday 
                        ? 'bg-[var(--neo-yellow)] neo-shadow-press' 
                        : 'bg-white hover:bg-[var(--neo-surface-muted)]'
                      : 'bg-[var(--neo-surface-variant)] opacity-40 border-dashed'
                  }`}
                >
                  {day ? (
                    <>
                      <div className="flex items-center justify-between border-b border-[var(--neo-border)] pb-1 mb-1">
                        <span className={`text-xs font-bold w-5 h-5 flex items-center justify-center ${
                          isToday ? 'bg-black text-white rounded-full' : ''
                        }`}>
                          {day}
                        </span>
                        {(dayTasks.length > 0 || dayProjects.length > 0) && (
                          <span className="text-[9px] font-bold px-1 border border-[var(--neo-border)] bg-black text-white">
                            {dayTasks.length + dayProjects.length} due
                          </span>
                        )}
                      </div>
                      
                      {/* Cell Items Stack */}
                      <div className="flex-1 overflow-y-auto space-y-1 pr-0.5 scrollbar-thin">
                        {dayProjects.map((p) => (
                          <div 
                            key={p.id}
                            className="p-1 border border-[var(--neo-border)] bg-[var(--neo-surface-high)] text-[9px] font-bold truncate cursor-pointer hover:bg-[var(--neo-surface-variant)]"
                            title={`Project Deadline: ${p.title}`}
                          >
                            📁 {p.title}
                          </div>
                        ))}
                        {dayTasks.map((t) => (
                          <div 
                            key={t.id}
                            onClick={() => setSelectedTaskId(t.id)}
                            className="p-1 border border-[var(--neo-border)] bg-white text-[9px] font-bold truncate cursor-pointer hover:bg-[var(--neo-surface-muted)] flex items-center gap-1"
                            title={`Task: ${t.title}`}
                          >
                            <div className={`w-1.5 h-1.5 border border-[var(--neo-border)] ${getMiniStatusColor(t.status)} shrink-0`} />
                            <span className="truncate">{t.title}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Gantt-style Timeline Roadmap */}
          <div className="neo-border-thick neo-shadow bg-[var(--neo-surface)] p-6">
            <div className="border-b-4 border-[var(--neo-border)] pb-3 mb-6 flex justify-between items-center">
              <h3 className="neo-title-md flex items-center gap-2">
                <ListStart size={20} />
                Project Duration Roadmap (Gantt View)
              </h3>
              <span className="neo-label-sm text-[var(--neo-text-muted)] font-bold">Duration from creation to deadline</span>
            </div>

            <div className="space-y-6">
              {projects.map((project) => {
                // Calculate project deadline as the furthest task deadline
                const deadlineStr = project.tasks?.reduce((latest, task) => {
                  if (!task.deadline) return latest;
                  if (!latest) return task.deadline;
                  return new Date(task.deadline) > new Date(latest) ? task.deadline : latest;
                }, null);

                const hasDates = project.created_at && deadlineStr;
                const start = project.created_at ? new Date(project.created_at) : null;
                const end = deadlineStr ? new Date(deadlineStr) : null;

                let dateRangeLabel = 'No deadline scheduled';
                let progressPercent = 0;
                let durationDays = 0;

                if (start && end) {
                  durationDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
                  dateRangeLabel = `${start.toLocaleDateString()} — ${end.toLocaleDateString()} (${durationDays} days)`;

                  // Calculate active progress relative to today
                  const totalSpan = end - start;
                  const elapsed = new Date() - start;
                  progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / totalSpan) * 100)));
                }

                const tasksCompleted = project.tasks?.filter((t) => t.status === 'COMPLETED').length || 0;
                const tasksTotal = project.tasks?.length || 0;

                return (
                  <div key={project.id} className="p-4 border-2 border-[var(--neo-border)] bg-white neo-shadow-press">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                      <div>
                        <h4 className="neo-title-sm text-[var(--neo-blue)]">{project.title}</h4>
                        <span className="neo-label-sm text-[var(--neo-text-muted)] font-bold">{dateRangeLabel}</span>
                      </div>
                      <div className="flex items-center gap-2 neo-label-sm text-[var(--neo-text-muted)] font-bold shrink-0">
                        <span className="px-2 py-0.5 border border-[var(--neo-border)] bg-[var(--neo-surface-muted)]">
                          {tasksCompleted}/{tasksTotal} Tasks Complete
                        </span>
                        {isLeadOrAdmin && (
                          <button
                            onClick={() => handleOpenCreateTask(project.id)}
                            className="p-1 border border-[var(--neo-border)] bg-[var(--neo-yellow)] hover:bg-[var(--neo-surface-high)]"
                            title="Add task to project"
                          >
                            <Plus size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Timeline bar representing progress / duration span */}
                    {hasDates ? (
                      <div>
                        <div className="w-full h-5 neo-border bg-[var(--neo-surface-muted)] relative overflow-hidden">
                          <div 
                            className="h-full bg-[var(--neo-mint)] border-r-2 border-[var(--neo-border)] transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                            title={`Roadmap elapsed time: ${progressPercent}%`}
                          />
                          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-black uppercase tracking-wider mix-blend-difference select-none">
                            {progressPercent}% Timeline Elapsed
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-5 border-2 border-dashed border-[var(--neo-border)] bg-[var(--neo-surface-muted)] flex items-center justify-center text-[10px] text-[var(--neo-text-muted)] font-bold uppercase tracking-wider">
                        Set deadlines on tasks to plot on roadmap
                      </div>
                    )}
                  </div>
                );
              })}

              {projects.length === 0 && (
                <div className="py-8 text-center neo-surface-muted border-2 border-[var(--neo-border)]">
                  <p className="neo-body-md text-[var(--neo-text-muted)]">No projects found to map on the roadmap.</p>
                </div>
              )}
            </div>
          </div>

          {/* Chronological Deadlines feed */}
          <div className="neo-border-thick neo-shadow bg-[var(--neo-surface)] p-6">
            <div className="border-b-4 border-[var(--neo-border)] pb-3 mb-6">
              <h3 className="neo-title-md flex items-center gap-2">
                <Clock size={20} />
                Chronological Tasks Deadlines (Agenda Feed)
              </h3>
            </div>

            <div className="relative border-l-4 border-[var(--neo-border)] ml-4 pl-6 space-y-6">
              {tasks
                .filter((t) => t.deadline)
                .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
                .map((task) => {
                  const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'COMPLETED';

                  return (
                    <div key={task.id} className="relative">
                      {/* Timeline Node dot */}
                      <div className="absolute -left-[30px] top-1.5 w-4 h-4 border-2 border-black bg-white rounded-full flex items-center justify-center">
                        <div className={`w-2 h-2 ${isOverdue ? 'bg-[var(--neo-red)] animate-pulse' : 'bg-black'}`} />
                      </div>

                      <div 
                        onClick={() => setSelectedTaskId(task.id)}
                        className="neo-surface neo-border neo-shadow neo-shadow-hover p-4 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white transition-all"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 border border-black bg-[var(--neo-surface-muted)] text-[var(--neo-text-muted)]">
                              📁 {task.project_title || 'Workspace Project'}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 border border-black ${
                              task.priority === 'HIGH' ? 'bg-[var(--neo-red)] text-white' : 'bg-[var(--neo-yellow)]'
                            }`}>
                              {task.priority} Priority
                            </span>
                          </div>
                          <h4 className="neo-title-sm truncate">{task.title}</h4>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex items-center gap-2 neo-label-sm text-[var(--neo-text-muted)] font-bold">
                            <AlertCircle size={14} className={isOverdue ? 'text-[var(--neo-red)]' : ''} />
                            <span className={isOverdue ? 'text-[var(--neo-red)]' : ''}>
                              Due {new Date(task.deadline).toLocaleDateString()}
                              {isOverdue && ' (OVERDUE)'}
                            </span>
                          </div>
                          <span className="neo-chip neo-chip--active capitalize">
                            {task.status?.replace('_', ' ').toLowerCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

              {tasks.filter((t) => t.deadline).length === 0 && (
                <div className="py-8 text-center neo-surface-muted border-2 border-[var(--neo-border)] -ml-4 pl-4">
                  <p className="neo-body-md text-[var(--neo-text-muted)]">No upcoming task deadlines scheduled.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedTaskId && (
        <TaskDetail 
          taskId={selectedTaskId} 
          onClose={() => setSelectedTaskId(null)} 
          onUpdate={fetchData}
        />
      )}

      {showCreateTaskModal && (
        <CreateTaskModal 
          onClose={() => {
            setShowCreateTaskModal(false);
            setCreateTaskProjectId(null);
          }} 
          onSuccess={() => {
            fetchData();
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
