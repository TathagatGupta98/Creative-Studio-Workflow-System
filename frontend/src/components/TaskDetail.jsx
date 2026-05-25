import { useCallback, useEffect, useState } from 'react';
import { 
  X, 
  Paperclip, 
  MessageSquare, 
  Send,
  Calendar,
} from 'lucide-react';
import api from '../api/axios';

export default function TaskDetail({ taskId, onClose, onUpdate }) {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tagError, setTagError] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentError, setAttachmentError] = useState('');
  const [replyTo, setReplyTo] = useState(null);

  const fetchTask = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/projects/tasks/${taskId}/`);
      setTask(response.data);
    } catch (error) {
      console.error('Failed to fetch task details:', error);
      setTask(null);
      setError('Unable to load this task right now.');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (taskId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void fetchTask();
    }
  }, [taskId, fetchTask]);

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
        content: newComment,
        parent: replyTo ? replyTo.id : null
      });
      setNewComment('');
      setReplyTo(null);
      fetchTask();
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const CommentItem = ({ comment, depth = 0 }) => (
    <div className={`space-y-3 ${depth > 0 ? 'mt-3' : ''}`}>
      <div className="flex gap-3">
        <div className={`w-8 h-8 neo-border ${depth % 2 === 0 ? 'bg-[var(--neo-mint)]' : 'bg-[var(--neo-yellow)]'} flex items-center justify-center text-[10px] font-bold shrink-0`}>
          {comment.author_username?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="neo-label-sm font-bold text-[var(--neo-text)]">{comment.author_username}</span>
            <span className="text-[10px] text-[var(--neo-text-muted)]">
              {new Date(comment.created_at).toLocaleString()}
            </span>
            <button 
              onClick={() => setReplyTo(comment)}
              className="text-[10px] font-bold uppercase hover:underline text-[var(--neo-blue)] ml-auto"
            >
              Reply
            </button>
          </div>
          <div className="neo-surface-muted neo-border px-3 py-1.5 inline-block max-w-full">
            <p className="neo-body-sm break-words">{comment.content}</p>
          </div>
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-4 md:ml-6 border-l-2 border-[var(--neo-border)] pl-3 md:pl-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );

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

  if (loading) {
    return (
      <div className="fixed inset-0 z-[60] flex items-stretch justify-end bg-[var(--neo-border)]/40 backdrop-blur-sm">
        <div className="w-full max-w-2xl h-full neo-surface neo-border-thick shadow-[12px_0px_0px_0px_#1c1c0f] flex flex-col">
          <div className="px-6 py-4 border-b-2 border-[var(--neo-border)] flex items-center justify-between bg-[var(--neo-surface-muted)]">
            <span className="neo-chip neo-chip--draft">Loading</span>
            <button onClick={onClose} className="neo-icon-btn neo-radius-none p-2" aria-label="Close task details">
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="neo-surface-muted neo-border-thick neo-shadow p-6 text-center max-w-sm">
              <p className="neo-title-md">Loading task details</p>
              <p className="neo-body-md text-[var(--neo-text-muted)] mt-2">Fetching the latest task data.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="fixed inset-0 z-[60] flex items-stretch justify-end bg-[var(--neo-border)]/40 backdrop-blur-sm">
        <div className="w-full max-w-2xl h-full neo-surface neo-border-thick shadow-[12px_0px_0px_0px_#1c1c0f] flex flex-col">
          <div className="px-6 py-4 border-b-2 border-[var(--neo-border)] flex items-center justify-between bg-[var(--neo-surface-muted)]">
            <span className="neo-chip neo-chip--overdue">Unavailable</span>
            <button onClick={onClose} className="neo-icon-btn neo-radius-none p-2" aria-label="Close task details">
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="neo-surface-muted neo-border-thick neo-shadow p-6 text-center max-w-sm">
              <p className="neo-title-md">Task unavailable</p>
              <p className="neo-body-md text-[var(--neo-text-muted)] mt-2">{error || 'This task could not be loaded.'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const priorityClass = {
    HIGH: 'neo-chip--overdue',
    MEDIUM: 'neo-chip--review',
    LOW: 'neo-chip--draft',
  }[task.priority] || 'neo-chip--draft';

  const statusClass = {
    DRAFT: 'neo-chip--draft',
    REVIEW: 'neo-chip--review',
    REVISION: 'neo-chip--active',
    APPROVED: 'neo-chip--completed',
    COMPLETED: 'neo-chip--completed',
  }[task.status] || 'neo-chip--draft';

  return (
    <div className="fixed inset-0 z-[60] flex items-stretch justify-end bg-[var(--neo-border)]/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl h-full neo-surface neo-border-thick shadow-[12px_0px_0px_0px_#1c1c0f] flex flex-col animate-in slide-in-from-right duration-300">
        <div className="px-6 py-4 border-b-2 border-[var(--neo-border)] flex items-center justify-between bg-[var(--neo-surface-muted)]">
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`neo-chip ${priorityClass}`}>{task.priority} Priority</span>
            <span className={`neo-chip ${statusClass}`}>{task.status?.replace('_', ' ') || 'UNKNOWN'}</span>
          </div>
          <button onClick={onClose} className="neo-icon-btn neo-radius-none p-2" aria-label="Close task details">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8 space-y-8">
            <section className="neo-surface-muted neo-border-thick neo-shadow p-5">
              <h2 className="neo-title-lg mb-2">{task.title}</h2>
              <p className="neo-body-md text-[var(--neo-text-muted)] whitespace-pre-wrap">
                {task.description || 'No description provided.'}
              </p>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="neo-surface neo-border-thick neo-shadow p-4 space-y-3">
                <span className="neo-label-md text-[var(--neo-text-muted)]">Status</span>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="neo-input neo-radius-none w-full bg-[var(--neo-surface)]"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="REVIEW">Review</option>
                  <option value="REVISION">Revision</option>
                  <option value="APPROVED">Approved</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div className="neo-surface neo-border-thick neo-shadow p-4 space-y-3">
                <span className="neo-label-md text-[var(--neo-text-muted)]">Assignees</span>
                <div className="flex flex-wrap gap-2">
                  {task.assignees_details?.length ? (
                    task.assignees_details.map((user) => (
                      <span key={user.id} className="neo-tag bg-[var(--neo-surface-muted)]">
                        <span className="w-5 h-5 neo-border bg-[var(--neo-yellow)] flex items-center justify-center text-[10px] font-bold">
                          {user.username?.[0]?.toUpperCase() || '?'}
                        </span>
                        {user.username}
                      </span>
                    ))
                  ) : (
                    <span className="neo-label-sm text-[var(--neo-text-muted)]">Unassigned</span>
                  )}
                </div>
              </div>

              <div className="neo-surface neo-border-thick neo-shadow p-4 space-y-3">
                <span className="neo-label-md text-[var(--neo-text-muted)]">Deadline</span>
                <div className="flex items-center gap-2 neo-body-md">
                  <Calendar size={14} />
                  {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                </div>
              </div>

              <div className="neo-surface neo-border-thick neo-shadow p-4 space-y-3">
                <span className="neo-label-md text-[var(--neo-text-muted)]">Tags</span>
                <div className="flex flex-wrap gap-2">
                  {task.tags?.length ? (
                    task.tags.map((tag) => (
                      <span key={tag} className="neo-tag">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="neo-label-sm text-[var(--neo-text-muted)]">None</span>
                  )}
                </div>
                <form onSubmit={handleAddTags} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add tags (comma separated)"
                      className="neo-input neo-radius-none flex-1"
                    />
                    <button type="submit" className="neo-btn neo-btn-secondary neo-radius-none px-3 py-2">
                      Add
                    </button>
                  </div>
                  {tagError && <span className="neo-label-sm text-[var(--neo-red)]">{tagError}</span>}
                </form>
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="neo-surface neo-border-thick neo-shadow p-4">
                <h3 className="neo-title-md mb-4 flex items-center gap-2">
                  <Paperclip size={16} />
                  Attachments ({task.attachments?.length || 0})
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {task.attachments?.map((file) => (
                    <a
                      key={file.id}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="neo-surface-muted neo-border neo-shadow-hover px-3 py-3 flex items-center justify-between transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 neo-border bg-[var(--neo-yellow)] flex items-center justify-center">
                          <Paperclip size={14} />
                        </div>
                        <span className="neo-body-md">{file.name}</span>
                      </div>
                    </a>
                  ))}
                  <form onSubmit={handleAddAttachment} className="neo-border neo-border-dashed p-3 space-y-3 bg-[var(--neo-surface)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={attachmentName}
                        onChange={(e) => setAttachmentName(e.target.value)}
                        placeholder="Attachment name"
                        className="neo-input neo-radius-none"
                      />
                      <input
                        type="url"
                        value={attachmentUrl}
                        onChange={(e) => setAttachmentUrl(e.target.value)}
                        placeholder="https://..."
                        className="neo-input neo-radius-none"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <button type="submit" className="neo-btn neo-btn-secondary neo-radius-none px-3 py-2">
                        Add attachment
                      </button>
                      {attachmentError && <span className="neo-label-sm text-[var(--neo-red)]">{attachmentError}</span>}
                    </div>
                  </form>
                </div>
              </div>

              <div className="neo-surface neo-border-thick neo-shadow p-4">
                <h3 className="neo-title-md mb-4 flex items-center gap-2">
                  <MessageSquare size={16} />
                  Activity
                </h3>
                <div className="space-y-6">
                  <form onSubmit={handleAddComment} className="relative">
                    {replyTo && (
                      <div className="mb-2 flex items-center justify-between bg-[var(--neo-surface-muted)] neo-border p-2 text-[10px]">
                        <span className="font-bold">Replying to {replyTo.author_username}</span>
                        <button 
                          type="button" 
                          onClick={() => setReplyTo(null)}
                          className="neo-icon-btn p-1"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={replyTo ? `Reply to ${replyTo.author_username}...` : "Write a comment..."}
                      className="neo-input neo-radius-none w-full min-h-[100px] resize-none bg-[var(--neo-surface-muted)]"
                    />
                    <div className="absolute bottom-3 right-3">
                      <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="neo-btn neo-btn-secondary neo-radius-none p-2 disabled:opacity-50"
                        aria-label="Send comment"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </form>

                  <div className="space-y-4 pb-4 max-h-[500px] overflow-y-auto pr-2">
                    {task.comments?.length > 0 ? (
                      task.comments.map((comment) => (
                        <CommentItem key={comment.id} comment={comment} />
                      ))
                    ) : (
                      <p className="neo-label-sm text-[var(--neo-text-muted)] text-center py-4">
                        No comments yet. Start the conversation!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
