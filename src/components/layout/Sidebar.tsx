import React from 'react';
import {
  LayoutDashboard,
  Inbox,
  CheckSquare,
  FolderKanban,
  Calendar,
  Lightbulb,
  FileText,
  BarChart3,
  Archive,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Moon,
  Sun,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { ViewMode } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface SidebarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  inboxCount: number;
  todayCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  collapsed,
  onToggleCollapse,
  inboxCount,
  todayCount,
}) => {
  const { profile, signOut, isDemoUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { id: 'dashboard' as ViewMode, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inbox' as ViewMode, label: 'Inbox', icon: Inbox, badge: inboxCount > 0 ? inboxCount : null },
    { id: 'tasks' as ViewMode, label: 'Tasks', icon: CheckSquare, badge: todayCount > 0 ? todayCount : null },
    { id: 'projects' as ViewMode, label: 'Projects', icon: FolderKanban },
    { id: 'calendar' as ViewMode, label: 'Calendar', icon: Calendar },
    { id: 'ideas' as ViewMode, label: 'Ideas Vault', icon: Lightbulb },
    { id: 'notes' as ViewMode, label: 'Notes', icon: FileText },
    { id: 'analytics' as ViewMode, label: 'Analytics', icon: BarChart3 },
    { id: 'archive' as ViewMode, label: 'Archive', icon: Archive },
    { id: 'settings' as ViewMode, label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col bg-white dark:bg-[#1E293B] border-r border-gray-200 dark:border-gray-800 transition-all duration-300 z-20 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header / Brand */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 dark:border-gray-800/80">
        <div
          onClick={() => onNavigate('dashboard')}
          className="flex items-center space-x-3 cursor-pointer group overflow-hidden"
        >
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold shadow-md shrink-0 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 fill-white text-white" />
          </div>
          {!collapsed && (
            <div className="whitespace-nowrap">
              <span className="font-bold text-base tracking-tight text-gray-900 dark:text-white">
                Work OS
              </span>
              <span className="block text-[10px] uppercase tracking-wider font-semibold text-primary">
                Command Center
              </span>
            </div>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center ${
                collapsed ? 'justify-center px-2' : 'justify-between px-3'
              } py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group relative ${
                isActive
                  ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-400 font-semibold'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-primary dark:text-blue-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200'
                  }`}
                />
                {!collapsed && <span>{item.label}</span>}
              </div>

              {/* Badge */}
              {item.badge !== null && item.badge !== undefined && (
                <span
                  className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full ${
                    item.id === 'inbox'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'bg-primary text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Footer & Theme Toggle */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center ${
            collapsed ? 'justify-center' : 'justify-between'
          } px-3 py-2 rounded-xl text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
        >
          <div className="flex items-center space-x-2">
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
            {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </div>
        </button>

        {/* Profile Card */}
        <div
          className={`flex items-center ${
            collapsed ? 'justify-center' : 'justify-between'
          } p-2 rounded-xl bg-gray-50 dark:bg-gray-800/60`}
        >
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary dark:text-blue-400 font-bold flex items-center justify-center text-xs shrink-0">
              {profile?.full_name?.charAt(0) || 'A'}
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                  {profile?.full_name || 'Ahmed'}
                </p>
                <p className="text-[10px] text-gray-400 truncate">
                  {isDemoUser ? 'Demo Account' : profile?.email || 'Cloud Synced'}
                </p>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={signOut}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
