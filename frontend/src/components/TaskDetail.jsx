import { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  User, 
  Tag as TagIcon, 
  Paperclip, 
  MessageSquare, 
  Send,
  Calendar,
  AlertCircle
} from 'lucide-react';
import api from '../api/axios';

export default function TaskDetail({ taskId, onClose, onUpdate }) {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tagError, setTagError] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentError, setAttachmentError] = useState('');

  useEffect(() => {
    if (taskId) {
      fetchTask();
    }
  }, [taskId]);

  const fetchTask = async () => {
    try {
      const response = await api.get(`/projects/tasks/${taskId}/`);
      setTask(response.data);
    } catch (error) {
      console.error('Failed to fetch task details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.patch(`/projects/tasks/${taskId}/`, { status: newStatus });
      fetchTask();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await api.post('/projects/comments/', {
        task: taskId,
        content: newComment
      });
      setNewComment('');
      fetchTask();
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleAddTags = async (e) => {
    e.preventDefault();
    const inputTags = tagInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (inputTags.length === 0) return;

    const nextTags = Array.from(new Set([...(task.tags || []), ...inputTags]));

    try {
      setTagError('');
      await api.patch(`/projects/tasks/${taskId}/`, { tags: nextTags });
      setTagInput('');
      fetchTask();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to add tags:', error);
      setTagError('Could not add tags.');
    }
  };

  const handleAddAttachment = async (e) => {
    e.preventDefault();
    const name = attachmentName.trim();
    const url = attachmentUrl.trim();

    if (!name || !url) {
      setAttachmentError('Attachment name and URL are required.');
      return;
    }

    try {
      setAttachmentError('');
      await api.post('/projects/attachments/', {
        task: taskId,
        name,
        url,
      });
      setAttachmentName('');
      setAttachmentUrl('');
      fetchTask();
    } catch (error) {
      console.error('Failed to add attachment:', error);
      setAttachmentError('Could not add attachment.');
    }
  };

  if (loading) return null;
  if (!task) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-end bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              task.priority === 'HIGH' ? 'bg-rose-100 text-rose-700' : 
              task.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
            }`}>
              {task.priority} Priority
            </span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{task.title}</h2>
            <p className="text-slate-600 mb-8 whitespace-pre-wrap">{task.description || 'No description provided.'}</p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</span>
                <select 
                  value={task.status} 
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="block w-full text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="REVIEW">Review</option>
                  <option value="REVISION">Revision</option>
                  <option value="APPROVED">Approved</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assignees</span>
                <div className="flex flex-wrap gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
                  {task.assignees_details?.length ? (
                    task.assignees_details.map((user) => (
                      <span key={user.id} className="flex items-center gap-2 px-2 py-1 bg-white rounded-full border border-slate-200 text-xs font-semibold text-slate-700">
                        <span className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-[10px] font-bold">
                          {user.username?.[0]?.toUpperCase() || '?'}
                        </span>
                        {user.username}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm font-medium text-slate-500">Unassigned</span>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deadline</span>
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100 text-sm font-medium text-slate-700">
                  <Calendar size={14} className="text-slate-400" />
                  {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tags</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {task.tags?.length ? (
                    task.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-bold uppercase">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">None</span>
                  )}
                </div>
                <form onSubmit={handleAddTags} className="flex flex-col gap-2 pt-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add tags (comma separated)"
                      className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
                    >
                      Add
                    </button>
                  </div>
                  {tagError && (
                    <span className="text-xs text-rose-600 font-medium">{tagError}</span>
                  )}
                </form>
              </div>
            </div>

            {/* Attachments */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Paperclip size={16} className="text-slate-400" />
                Attachments ({task.attachments?.length || 0})
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {task.attachments?.map(file => (
                  <a key={file.id} href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/30 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                        <Paperclip size={16} />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{file.name}</span>
                    </div>
                  </a>
                ))}
                <form onSubmit={handleAddAttachment} className="flex flex-col gap-2 p-3 border-2 border-dashed border-slate-200 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={attachmentName}
                      onChange={(e) => setAttachmentName(e.target.value)}
                      placeholder="Attachment name"
                      className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <input
                      type="url"
                      value={attachmentUrl}
                      onChange={(e) => setAttachmentUrl(e.target.value)}
                      placeholder="https://..."
                      className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      type="submit"
                      className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
                    >
                      Add attachment
                    </button>
                    {attachmentError && (
                      <span className="text-xs text-rose-600 font-medium">{attachmentError}</span>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Comments */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MessageSquare size={16} className="text-slate-400" />
                Activity
              </h3>
              <div className="space-y-6">
                <form onSubmit={handleAddComment} className="relative">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none min-h-[100px]"
                  />
                  <div className="absolute bottom-3 right-3">
                    <button 
                      type="submit"
                      disabled={!newComment.trim()}
                      className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:bg-slate-400"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </form>

                <div className="space-y-6 pb-10">
                  {task.comments?.map(comment => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                        {comment.author_username?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-slate-900">{comment.author_username}</span>
                          <span className="text-[10px] font-medium text-slate-400">
                            {new Date(comment.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-slate-600 bg-slate-50 px-4 py-2.5 rounded-2xl inline-block">
                          {comment.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
