import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Users, Plus, Shield, Settings, Check, X, Building, Search, UserPlus, Save, Trash2, Crown } from 'lucide-react';
import NeoSelect from '../components/NeoSelect';

export default function StudioManagement() {
  const { user, setUser } = useAuth();
  const [studios, setStudios] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('studios'); // 'studios', 'users', 'requests', 'invite'
  const [newStudio, setNewStudio] = useState({ name: '', code_name: '', description: '', is_public: true });
  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const roles = [
    { value: 'STUDIO_ADMIN', label: 'Studio Admin' },
    { value: 'PROJECT_LEAD', label: 'Project Lead' },
    { value: 'DESIGNER', label: 'Designer' },
    { value: 'WRITER', label: 'Writer' },
    { value: 'REVIEWER', label: 'Reviewer' },
    { value: 'CLIENT_VIEWER', label: 'Client Viewer' },
  ];

  const fetchData = useCallback(async () => {
    try {
      const [studiosRes, membershipsRes, requestsRes] = await Promise.all([
        api.get('/users/studios/'),
        api.get('/users/memberships/'),
        api.get('/users/join-requests/')
      ]);
      setStudios(studiosRes.data);
      setMemberships(membershipsRes.data.filter(m => m.studio === user.current_studio));
      setJoinRequests(requestsRes.data);
    } catch (error) {
      console.error('Failed to fetch management data:', error);
    } finally {
      setLoading(false);
    }
  }, [user.current_studio]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleCreateStudio = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/users/studios/', newStudio);
      // Immediately fetch new user profile to update current_studio and memberships
      const meResponse = await api.get('/users/me/');
      setUser(meResponse.data);
      
      setNewStudio({ name: '', code_name: '', description: '', is_public: true });
      fetchData();
      alert(`Studio "${response.data.name}" created! Switched to new workspace.`);
    } catch (error) {
      console.error('Failed to create studio:', error);
      alert(error.response?.data?.code_name?.[0] || 'Failed to create studio.');
    }
  };

  const handleRequestAction = async (id, action, assignedRoles = ['DESIGNER']) => {
    try {
      await api.post(`/users/join-requests/${id}/${action}/`, { roles: assignedRoles });
      fetchData();
    } catch (err) {
      console.error(`Failed to ${action} request`, err);
    }
  };

  const handleUpdateMembership = async (membershipId, data) => {
    try {
      await api.patch(`/users/memberships/${membershipId}/`, data);
      fetchData();
    } catch (error) {
      console.error('Failed to update membership:', error);
      alert(error.response?.data?.error || 'Failed to update membership.');
    }
  };

  const handleRemoveMember = async (membershipId, username) => {
    if (!window.confirm(`Are you sure you want to remove ${username} from the studio?`)) return;
    try {
      await api.delete(`/users/memberships/${membershipId}/`);
      fetchData();
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const searchPublicUsers = async () => {
    if (!userSearch) return;
    try {
      const response = await api.get(`/users/list/?scope=all&query=${userSearch}`);
      setSearchResults(response.data);
    } catch (err) {
      console.error('Failed to search users', err);
    }
  };

  const inviteUser = async (targetUserId) => {
    try {
      const currentStudioId = user.current_studio;
      await api.post(`/users/studios/${currentStudioId}/invite_user/`, { user_id: targetUserId });
      alert('Invitation sent successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send invitation.');
    }
  };

  const currentStudio = studios.find(s => s.id === user.current_studio);
  const currentMembership = user?.memberships?.find(m => m.studio === user?.current_studio);
  const isOwner = currentStudio?.owner === user.id;
  const isAuthorized = currentMembership?.is_admin || user?.current_studio === user?.personal_workspace;

  if (!isAuthorized) {
    return (
      <div className="neo-surface neo-border-thick p-12 text-center">
        <Shield size={48} className="mx-auto mb-4 text-[var(--neo-red)]" />
        <h2 className="neo-title-md">Access Denied</h2>
        <p className="neo-body-md">Only Studio Admins can access this page.</p>
      </div>
    );
  }

  if (loading) return <div className="animate-pulse">Loading management console...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="neo-title-xl">Management Console</h2>
        <p className="neo-body-lg text-[var(--neo-text-muted)]">
          Manage {currentStudio?.name || 'Studio'} settings and members.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b-4 border-[var(--neo-border)]">
        {['studios', 'users', 'requests', 'invite'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 md:px-6 py-3 neo-title-sm capitalize transition-all ${
              activeTab === tab 
              ? 'bg-[var(--neo-blue)] text-white translate-y-[4px]' 
              : 'hover:bg-[var(--neo-surface-muted)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'studios' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <form onSubmit={handleCreateStudio} className="neo-surface neo-border neo-shadow p-6 space-y-4">
              <h3 className="neo-title-md flex items-center gap-2">
                <Plus size={20} /> Create New Studio
              </h3>
              <div className="space-y-2">
                <label className="neo-label-sm">Studio Name</label>
                <input
                  type="text" required
                  className="neo-input neo-radius-none w-full"
                  value={newStudio.name}
                  onChange={(e) => setNewStudio({ ...newStudio, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="neo-label-sm">Code Name (Unique, e.g. my_studio)</label>
                <input
                  type="text" required
                  className="neo-input neo-radius-none w-full"
                  value={newStudio.code_name}
                  onChange={(e) => setNewStudio({ ...newStudio, code_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="neo-label-sm">Description</label>
                <textarea
                  className="neo-input neo-radius-none w-full h-24 resize-none"
                  value={newStudio.description}
                  onChange={(e) => setNewStudio({ ...newStudio, description: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_public_studio"
                  checked={newStudio.is_public}
                  onChange={(e) => setNewStudio({ ...newStudio, is_public: e.target.checked })}
                  className="w-5 h-5 neo-border accent-[var(--neo-blue)]"
                />
                <label htmlFor="is_public_studio" className="neo-label-sm cursor-pointer">
                  Public (Anyone can apply)
                </label>
              </div>
              <button type="submit" className="w-full neo-btn neo-btn-secondary neo-radius-none py-2">
                Add Studio
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {studios.map(studio => (
              <div key={studio.id} className={`neo-surface neo-border neo-shadow p-5 flex flex-col justify-between ${studio.id === user.current_studio ? 'border-[var(--neo-blue)] ring-2 ring-[var(--neo-blue)]' : ''}`}>
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="neo-title-sm mb-1">{studio.name}</h4>
                      <p className="neo-body-sm text-[var(--neo-blue)] mb-2">@{studio.code_name}</p>
                    </div>
                    {studio.owner === user.id && (
                       <Crown size={16} className="text-[var(--neo-yellow)]" />
                    )}
                  </div>
                  {!studio.is_public && (
                     <span className="neo-label-xs bg-[var(--neo-surface-high)] px-2 py-1 neo-border">Code: {studio.join_code}</span>
                  )}
                  <p className="neo-body-sm text-[var(--neo-text-muted)] line-clamp-2 mt-2">
                    {studio.description || 'No description provided.'}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t-2 border-[var(--neo-border)] flex justify-between items-center text-[var(--neo-text-muted)]">
                  <span className="neo-label-sm flex items-center gap-1">
                    <Users size={14} /> ID: {studio.id}
                  </span>
                  <span className="neo-label-sm">
                     {studio.is_public ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="neo-surface neo-border neo-shadow overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--neo-surface-muted)] border-b-4 border-[var(--neo-border)]">
                <th className="p-4 neo-label-md min-w-[150px]">User</th>
                <th className="p-4 neo-label-md min-w-[200px]">Roles (Click to toggle)</th>
                <th className="p-4 neo-label-md text-center">Is Admin</th>
                <th className="p-4 neo-label-md text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {memberships.map(m => {
                const isMemberOwner = m.user === currentStudio?.owner;
                const canModifyAdmin = isOwner && !isMemberOwner;
                const canModifyRoles = (isOwner || currentMembership?.is_admin) && !isMemberOwner;
                
                return (
                  <tr key={m.id} className="border-b-2 border-[var(--neo-border)] hover:bg-[var(--neo-surface-muted)]/50">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <p className="neo-title-sm">{m.user_details?.username}</p>
                        {isMemberOwner && <Crown size={14} className="text-[var(--neo-yellow)]" />}
                        {m.user === user.id && <span className="neo-label-xs bg-[var(--neo-blue)] text-white px-1">(You)</span>}
                      </div>
                      <p className="neo-label-xs text-[var(--neo-text-muted)]">{m.user_details?.email}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {roles.map(r => (
                          <button
                            key={r.value}
                            disabled={!canModifyRoles}
                            onClick={() => {
                               const newRoles = m.roles.includes(r.value)
                                 ? m.roles.filter(role => role !== r.value)
                                 : [...m.roles, r.value];
                               handleUpdateMembership(m.id, { roles: newRoles });
                            }}
                            className={`neo-label-xs px-2 py-1 neo-border transition-all ${
                              m.roles.includes(r.value) 
                                ? 'bg-[var(--neo-blue)] text-white' 
                                : 'bg-white text-[var(--neo-text-muted)]'
                            } ${!canModifyRoles ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:translate-y-1'}`}
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                       <input 
                         type="checkbox" 
                         disabled={!canModifyAdmin}
                         checked={m.is_admin} 
                         onChange={(e) => handleUpdateMembership(m.id, { is_admin: e.target.checked })}
                         className={`w-6 h-6 neo-border accent-[var(--neo-blue)] ${!canModifyAdmin ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                       />
                    </td>
                    <td className="p-4 text-right">
                      {!isMemberOwner && (isOwner || (currentMembership?.is_admin && !m.is_admin)) && (
                        <button 
                          onClick={() => handleRemoveMember(m.id, m.user_details?.username)}
                          className="neo-icon-btn p-2 hover:bg-[var(--neo-red)] hover:text-white group" 
                          title="Remove member"
                        >
                          <Trash2 size={18} className="group-hover:animate-bounce" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-4">
          {joinRequests.filter(req => req.status === 'PENDING').length === 0 ? (
            <div className="neo-surface neo-border p-12 text-center">
              <Users size={32} className="mx-auto mb-2 text-[var(--neo-text-muted)]" />
              <p className="neo-body-md text-[var(--neo-text-muted)]">No pending join requests.</p>
            </div>
          ) : (
            joinRequests.filter(req => req.status === 'PENDING').map(req => (
              <div key={req.id} className="neo-surface neo-border neo-shadow p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 neo-border bg-[var(--neo-yellow)] flex items-center justify-center">
                     <Users size={24} />
                   </div>
                   <div>
                     <p className="neo-title-md">{req.user_details?.username} wants to join</p>
                     <p className="neo-label-sm text-[var(--neo-text-muted)]">Studio: {req.studio_details?.name}</p>
                   </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="space-y-1">
                    <p className="neo-label-xs text-[var(--neo-text-muted)]">Initial Roles:</p>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {roles.map(r => (
                        <button
                          key={r.value}
                          onClick={() => {
                            const currentRoles = req.selectedRoles || ['DESIGNER'];
                            const newRoles = currentRoles.includes(r.value)
                              ? currentRoles.filter(role => role !== r.value)
                              : [...currentRoles, r.value];
                            setJoinRequests(joinRequests.map(jr => jr.id === req.id ? { ...jr, selectedRoles: newRoles } : jr));
                          }}
                          className={`text-[8px] px-1 neo-border transition-all ${ (req.selectedRoles || ['DESIGNER']).includes(r.value) ? 'bg-[var(--neo-blue)] text-white' : 'bg-white hover:bg-[var(--neo-surface-high)]'}`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleRequestAction(req.id, 'approve', req.selectedRoles || ['DESIGNER'])}
                      className="neo-btn neo-btn-secondary px-6 py-2 flex items-center gap-2"
                    >
                      <Check size={20} /> Approve
                    </button>
                    <button 
                      onClick={() => handleRequestAction(req.id, 'reject')}
                      className="neo-btn px-6 py-2 bg-[var(--neo-red)] text-white flex items-center gap-2"
                    >
                      <X size={20} /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'invite' && (
        <div className="space-y-6">
           <div className="neo-surface neo-border neo-shadow p-6 flex flex-col md:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <label className="neo-label-md">Search Public Users</label>
                <input 
                  type="text" 
                  placeholder="Enter username..." 
                  className="neo-input neo-radius-none w-full"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchPublicUsers()}
                />
              </div>
              <button 
                onClick={searchPublicUsers}
                className="neo-btn neo-btn-primary neo-radius-none px-8 flex items-center gap-2 mt-auto"
              >
                <Search size={20} /> Search
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map(u => (
                <div key={u.id} className="neo-surface neo-border neo-shadow p-4 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 neo-border bg-[var(--neo-blue)] flex items-center justify-center text-white">
                      {u.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="neo-title-sm">{u.username}</p>
                      <p className="neo-label-xs text-[var(--neo-text-muted)]">Public Account</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => inviteUser(u.id)}
                    className="neo-icon-btn p-2 bg-[var(--neo-yellow)] hover:rotate-12 transition-transform"
                    title="Invite to Current Studio"
                  >
                    <UserPlus size={18} />
                  </button>
                </div>
              ))}
              {userSearch && searchResults.length === 0 && (
                <p className="col-span-full text-center py-8 neo-body-md text-[var(--neo-text-muted)]">No public users found matching your search.</p>
              )}
           </div>
        </div>
      )}
    </div>
  );
}
