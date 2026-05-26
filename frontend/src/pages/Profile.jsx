import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { User, Mail, Shield, Building, FileText, Camera, Save } from 'lucide-react';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    bio: '',
    profile_picture: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        bio: user.bio || '',
        profile_picture: user.profile_picture || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await api.patch('/users/me/', formData);
      setUser(response.data);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Failed to update profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="neo-title-xl">Your Profile</h2>
        <p className="neo-body-lg text-[var(--neo-text-muted)]">
          Manage your personal information and studio role.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar and Role Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="neo-surface neo-border neo-shadow p-6 text-center">
            <div className="w-32 h-32 neo-border-thick bg-[var(--neo-yellow)] flex items-center justify-center mx-auto mb-4 relative group">
              {formData.profile_picture ? (
                <img src={formData.profile_picture} alt={user?.username} className="w-full h-full object-cover" />
              ) : (
                <span className="neo-title-xl text-4xl">{user?.username?.[0]?.toUpperCase()}</span>
              )}
            </div>
            <h3 className="neo-title-md truncate">{user?.username}</h3>
            <div className={`neo-chip mt-2 inline-block ${user?.role === 'STUDIO_ADMIN' ? 'bg-[var(--neo-red)] text-white' : 'bg-[var(--neo-blue)] text-white'}`}>
              {user?.role?.replace('_', ' ')}
            </div>
          </div>

          <div className="neo-surface neo-border neo-shadow p-6 space-y-4">
            <h4 className="neo-label-md border-b-2 border-[var(--neo-border)] pb-2">Studio Access</h4>
            <div className="flex items-center gap-3">
              <Building size={20} className="text-[var(--neo-text-muted)]" />
              <div>
                <p className="neo-label-sm text-[var(--neo-text-muted)]">Current Studio</p>
                <p className="neo-body-md font-bold">{user?.studio_details?.name || 'No Studio Assigned'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield size={20} className="text-[var(--neo-text-muted)]" />
              <div>
                <p className="neo-label-sm text-[var(--neo-text-muted)]">Permissions</p>
                <p className="neo-body-md font-bold">
                  {user?.role === 'STUDIO_ADMIN' ? 'Full Control' : 'Standard Access'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="neo-surface neo-border neo-shadow p-8 space-y-6">
            {message.text && (
              <div className={`p-4 neo-border-thick ${message.type === 'success' ? 'bg-[var(--neo-mint)]' : 'bg-[var(--neo-red)] text-white'}`}>
                {message.text}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="neo-label-md flex items-center gap-2">
                  <User size={16} /> First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="neo-input neo-radius-none w-full"
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <label className="neo-label-md flex items-center gap-2">
                  <User size={16} /> Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="neo-input neo-radius-none w-full"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="neo-label-md flex items-center gap-2">
                <Mail size={16} /> Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="neo-input neo-radius-none w-full"
                placeholder="john.doe@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="neo-label-md flex items-center gap-2">
                <Camera size={16} /> Profile Picture URL
              </label>
              <input
                type="text"
                name="profile_picture"
                value={formData.profile_picture}
                onChange={handleChange}
                className="neo-input neo-radius-none w-full"
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div className="space-y-2">
              <label className="neo-label-md flex items-center gap-2">
                <FileText size={16} /> Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="neo-input neo-radius-none w-full resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="pt-4 border-t-2 border-[var(--neo-border)] flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="neo-btn neo-btn-secondary neo-radius-none px-6 py-3 flex items-center gap-2"
              >
                {loading ? 'Saving...' : (
                  <>
                    <Save size={20} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
