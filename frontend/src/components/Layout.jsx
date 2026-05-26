import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandMark from './BrandMark';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Bell, 
  LogOut, 
  User as UserIcon,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Notifications', href: '/notifications', icon: Bell },
  ];

  const isActive = (path) => location.pathname === path;
  const activeLabel = navigation.find((item) => isActive(item.href))?.name || 'Overview';

  return (
    <div className="min-h-screen neo-bg text-[var(--neo-text)] flex">
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 w-full h-full bg-[var(--neo-border)]/40"
            aria-label="Close navigation menu"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-[280px] neo-surface neo-border-thick shadow-[4px_0px_0px_0px_#1c1c0f] flex flex-col">
            <div className="px-6 py-6 neo-divider">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <BrandMark className="w-24 h-24 md:w-28 md:h-28" />
                    <div>
                      <div className="neo-title-lg leading-none">StudioFlow</div>
                      <div className="neo-label-sm text-[var(--neo-text-muted)] mt-1">Creative Workspace</div>
                    </div>
              </div>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 neo-label-md transition-all border-2 ${
                    isActive(item.href)
                      ? 'bg-[var(--neo-blue)] text-white border-[var(--neo-border)] neo-shadow'
                      : 'text-[var(--neo-text)] border-transparent hover:bg-[var(--neo-surface-high)] hover:border-[var(--neo-border)] neo-shadow-hover'
                  }`}
                >
                  <item.icon size={20} />
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="px-4 py-6 mt-auto border-t-2 border-[var(--neo-border)]">
              <div className="flex items-center gap-3 px-3 py-2 neo-border neo-shadow neo-radius">
                <div className="w-9 h-9 bg-[var(--neo-surface-high)] neo-border flex items-center justify-center">
                  <UserIcon size={18} className="text-[var(--neo-text)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="neo-label-md text-[var(--neo-text)] truncate">{user?.username}</p>
                  <p className="neo-label-sm text-[var(--neo-text-muted)] truncate">
                    {user?.role?.replace('_', ' ').toLowerCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
                className="mt-3 w-full neo-btn neo-radius-none py-2 px-3 text-[var(--neo-red)] hover:bg-[var(--neo-red)] hover:text-white"
              >
                <span className="flex items-center justify-center gap-2">
                  <LogOut size={18} />
                  Sign out
                </span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Sidebar for desktop */}
      <aside className="hidden md:flex md:flex-col w-[280px] neo-surface neo-border-thick border-r-4 border-[var(--neo-border)] shadow-[4px_0px_0px_0px_#1c1c0f]">
        <div className="px-6 py-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <BrandMark className="w-24 h-24 md:w-28 md:h-28" />
            <div>
              <div className="neo-title-lg leading-none">StudioFlow</div>
              <div className="neo-label-sm text-[var(--neo-text-muted)] mt-1">Creative Workspace</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 neo-label-md transition-all border-2 ${
                isActive(item.href)
                  ? 'bg-[var(--neo-blue)] text-white border-[var(--neo-border)] neo-shadow'
                  : 'text-[var(--neo-text)] border-transparent hover:bg-[var(--neo-surface-high)] hover:border-[var(--neo-border)] neo-shadow-hover'
              }`}
            >
              <item.icon size={20} />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="px-4 py-6 mt-auto border-t-2 border-[var(--neo-border)]">
          <div className="flex items-center gap-3 px-3 py-2 neo-border neo-shadow neo-radius">
            <div className="w-9 h-9 bg-[var(--neo-surface-high)] neo-border flex items-center justify-center">
              <UserIcon size={18} className="text-[var(--neo-text)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="neo-label-md text-[var(--neo-text)] truncate">
                {user?.username}
              </p>
              <p className="neo-label-sm text-[var(--neo-text-muted)] truncate">
                {user?.role?.replace('_', ' ').toLowerCase()}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-3 w-full neo-btn neo-radius-none py-2 px-3 text-[var(--neo-red)] hover:bg-[var(--neo-red)] hover:text-white"
          >
            <span className="flex items-center justify-center gap-2">
              <LogOut size={18} />
              Sign out
            </span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="sticky top-0 z-40 neo-surface neo-divider shadow-[0px_4px_0px_0px_#1c1c0f] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden neo-icon-btn neo-radius-none p-2"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="neo-title-md">{activeLabel}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/notifications"
              className="neo-icon-btn neo-radius-none p-2"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </Link>
            <div className="w-10 h-10 neo-border neo-shadow neo-radius-none bg-[var(--neo-yellow)] flex items-center justify-center">
              <span className="neo-label-md">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
