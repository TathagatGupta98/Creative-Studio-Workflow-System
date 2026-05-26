import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Search, Building, Lock, Unlock, Check } from 'lucide-react';

export default function DiscoverStudios() {
  const { user } = useAuth();
  const [studios, setStudios] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudios();
  }, []);

  const fetchStudios = async () => {
    try {
      const response = await api.get('/users/studios/');
      setStudios(response.data);
    } catch (err) {
      console.error('Failed to fetch studios', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (studioId, code = null) => {
    setMessage('');
    setError('');
    try {
      const payload = code ? { join_code: code } : {};
      const response = await api.post(`/users/studios/${studioId}/join/`, payload);
      setMessage(response.data.message || 'Successfully joined/requested.');
      fetchStudios(); // Refresh status
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join studio.');
    }
  };

  const filteredStudios = studios.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.code_name && s.code_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const isMember = (studioId) => {
    return user?.memberships?.some(m => m.studio === studioId) || user?.personal_workspace === studioId;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="neo-title-xl">Discover Studios</h2>
        <p className="neo-body-lg text-[var(--neo-text-muted)]">
          Find and join creative teams, or enter a join code.
        </p>
      </div>

      <div className="neo-surface neo-border neo-shadow p-6 mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1 space-y-2">
          <label className="neo-label-md flex items-center gap-2">
            <Search size={18} /> Search Studios
          </label>
          <input
            type="text"
            placeholder="Search by name or @code_name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="neo-input neo-radius-none w-full"
          />
        </div>
      </div>

      {message && <div className="p-4 bg-[var(--neo-mint)] neo-border">{message}</div>}
      {error && <div className="p-4 bg-[var(--neo-red)] text-white neo-border">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p>Loading studios...</p>
        ) : (
          filteredStudios.map(studio => (
            <div key={studio.id} className="neo-surface neo-border neo-shadow p-5 flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <div className="w-12 h-12 neo-border bg-[var(--neo-yellow)] flex items-center justify-center">
                  <Building size={24} />
                </div>
                {studio.is_public ? (
                  <span className="neo-chip bg-[var(--neo-mint)] flex items-center gap-1"><Unlock size={12}/> Public</span>
                ) : (
                  <span className="neo-chip bg-[var(--neo-red)] text-white flex items-center gap-1"><Lock size={12}/> Private</span>
                )}
              </div>
              <h3 className="neo-title-md">{studio.name}</h3>
              <p className="neo-label-sm text-[var(--neo-blue)] mb-2">@{studio.code_name}</p>
              <p className="neo-body-sm text-[var(--neo-text-muted)] mb-4 line-clamp-2 flex-1">
                {studio.description || 'No description available.'}
              </p>
              
              {isMember(studio.id) ? (
                <div className="w-full py-2 bg-[var(--neo-surface-muted)] text-[var(--neo-mint)] neo-border flex items-center justify-center gap-2 neo-label-sm mt-auto">
                   <Check size={16} /> Already a member
                </div>
              ) : !studio.is_public ? (
                <div className="flex gap-2 mt-auto">
                  <input 
                    type="text" 
                    placeholder="Join Code" 
                    className="neo-input neo-radius-none w-full text-sm py-1"
                    id={`code-${studio.id}`}
                  />
                  <button 
                    onClick={() => handleJoin(studio.id, document.getElementById(`code-${studio.id}`).value)}
                    className="neo-btn neo-btn-primary neo-radius-none px-3 py-1"
                  >
                    Join
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => handleJoin(studio.id)}
                  className="neo-btn neo-btn-primary neo-radius-none w-full py-2 mt-auto"
                >
                  Apply to Join
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
