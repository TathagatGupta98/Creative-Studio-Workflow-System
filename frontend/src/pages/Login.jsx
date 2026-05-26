import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck } from 'lucide-react';
import BrandMark from '../components/BrandMark';

export default function Login() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isSignUp = mode === 'signup';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          return;
        }

        const payload = { username, password, is_public: isPublic };
        if (email) payload.email = email;
        if (firstName) payload.first_name = firstName;
        if (lastName) payload.last_name = lastName;

        await register(payload);
      } else {
        await login(username, password);
      }
    } catch {
      setError(
        isSignUp
          ? 'Could not create account. Please check your details.'
          : 'Invalid username or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen neo-bg text-[var(--neo-text)] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-60">
        <div className="absolute top-10 left-10 w-28 h-28 bg-[var(--neo-yellow)] neo-border-thick neo-shadow-lg rotate-12" />
        <div className="absolute bottom-16 right-20 w-40 h-40 bg-[var(--neo-blue-bright)] neo-border-thick neo-shadow-lg -rotate-6" />
        <div className="absolute top-1/2 left-1/4 w-[120%] h-[2px] bg-[var(--neo-border)] -rotate-12" />
        <div className="absolute top-20 right-1/3 w-16 h-16 bg-[var(--neo-surface-variant)] neo-border-thick neo-shadow-lg rotate-6" />
      </div>

      <div className="relative w-full max-w-md neo-surface neo-border-thick neo-shadow-xl p-8">
        <div className="text-center mb-8 flex flex-col items-center gap-3">
          <BrandMark className="w-24 h-24" />
          <div>
            <h1 className="neo-title-xl">StudioFlow</h1>
            <p className="neo-label-md text-[var(--neo-text-muted)]">Creative Workspace</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`flex-1 py-2 neo-label-md border-2 transition-all ${
              !isSignUp
                ? 'bg-[var(--neo-blue)] text-white border-[var(--neo-border)] neo-shadow'
                : 'bg-[var(--neo-surface)] text-[var(--neo-text)] border-[var(--neo-border)] hover:bg-[var(--neo-surface-high)]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError('');
            }}
            className={`flex-1 py-2 neo-label-md border-2 transition-all ${
              isSignUp
                ? 'bg-[var(--neo-blue)] text-white border-[var(--neo-border)] neo-shadow'
                : 'bg-[var(--neo-surface)] text-[var(--neo-text)] border-[var(--neo-border)] hover:bg-[var(--neo-surface-high)]'
            }`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignUp && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="neo-label-md block mb-2">First name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jane"
                  className="neo-input neo-radius-none w-full"
                />
              </div>

              <div>
                <label className="neo-label-md block mb-2">Last name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="neo-input neo-radius-none w-full"
                />
              </div>
            </div>
          )}

          <div>
            <label className="neo-label-md block mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="neo-input neo-radius-none w-full"
              required
            />
          </div>

          {isSignUp && (
            <div>
              <label className="neo-label-md block mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@studio.com"
                className="neo-input neo-radius-none w-full"
              />
            </div>
          )}

          <div>
            <label className="neo-label-md block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="neo-input neo-radius-none w-full"
              required
            />
          </div>

          {isSignUp && (
            <div>
              <label className="neo-label-md block mb-2">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                className="neo-input neo-radius-none w-full"
                required
              />
            </div>
          )}

          {isSignUp && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-5 h-5 neo-border accent-[var(--neo-blue)]"
              />
              <label htmlFor="isPublic" className="neo-label-md cursor-pointer">
                Public Account (Can join public studios)
              </label>
            </div>
          )}

          {error && (
            <div className="neo-border neo-shadow neo-radius-none bg-[var(--neo-red)] text-white px-4 py-3 flex items-center gap-2">
              <ShieldCheck size={18} />
              <span className="neo-body-md">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="neo-btn neo-btn-primary neo-radius-none w-full py-3"
          >
            {loading ? (isSignUp ? 'Creating account...' : 'Authenticating...') : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-8 neo-body-md text-[var(--neo-text-muted)]">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => {
              setMode(isSignUp ? 'login' : 'signup');
              setError('');
            }}
            className="neo-label-md text-[var(--neo-text)] underline"
          >
            {isSignUp ? 'Sign in' : 'Create one'}
          </button>
        </p>
      </div>
    </div>
  );
}

