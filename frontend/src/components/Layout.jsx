import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-slate-200">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
            S
          </div>
          <span className="text-xl font-bold text-slate-800">StudioFlow</span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={20} />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
              <UserIcon size={18} className="text-slate-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user?.username}
              </p>
              <p className="text-xs text-slate-500 truncate capitalize">
                {user?.role?.replace('_', ' ').toLowerCase()}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-2 w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-white rounded-lg shadow-md border border-slate-200"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h1 className="text-lg font-semibold text-slate-800">
            {navigation.find(n => isActive(n.href))?.name || 'Overview'}
          </h1>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600">
              <Bell size={20} />
            </button>
            <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-sm">
              {user?.username?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
