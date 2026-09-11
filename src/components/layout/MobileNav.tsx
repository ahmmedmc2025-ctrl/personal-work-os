import React, { useState } from 'react';
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
  Menu,
  X,
  Plus,
  Zap,
  Moon,
  Sun,
  LogOut,
} from 'lucide-react';
import { ViewMode } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface MobileNavProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onOpenQuickAdd: () => void;
  inboxCount: number;
  todayCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentView,
  onNavigate,
  onOpenQuickAdd,
  inboxCount,
  todayCount,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleNav = (view: ViewMode) => {
    onNavigate(view);
    setDrawerOpen(false);
  };

  const primaryBottomNav = [
    { id: 'dashboard' as ViewMode, label: 'Home', icon: LayoutDashboard },
    { id: 'tasks' as ViewMode, label: 'Tasks', icon: CheckSquare, badge: todayCount > 0 ? todayCount : null },
    { id: 'projects' as ViewMode, label: 'Projects', icon: FolderKanban },
    { id: 'calendar' as ViewMode, label: 'Calendar', icon: Calendar },
  ];

  const drawerNav = [
    { id: 'inbox' as ViewMode, label: 'Inbox', icon: Inbox, badge: inboxCount > 0 ? inboxCount : null },
    { id: 'ideas' as ViewMode, label: 'Ideas Vault', icon: Lightbulb },
    { id: 'notes' as ViewMode, label: 'Notes', icon: FileText },
    { id: 'analytics' as ViewMode, label: 'Analytics', icon: BarChart3 },
    { id: 'archive' as ViewMode, label: 'Archive', icon: Archive },
    { id: 'settings' as ViewMode, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Top Mobile Bar */}
      <div className="md:hidden h-14 bg-white dark:bg-[#1E293B] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sticky top-0 z-30">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold shadow-sm">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          <span className="font-bold text-sm tracking-tight text-gray-900 dark:text-white">
            Work OS
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenQuickAdd}
            className="p-2 rounded-lg bg-primary text-white text-xs font-semibold flex items-center space-x-1 shadow-sm active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Sticky Mobile Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-[#1E293B] border-t border-gray-200 dark:border-gray-800 flex items-center justify-around z-30 px-2 shadow-lg">
        {primaryBottomNav.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`flex flex-col items-center justify-center w-full py-1 text-[11px] font-medium transition-colors relative ${
                isActive ? 'text-primary dark:text-blue-400 font-bold' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.label}</span>
              {item.badge !== null && item.badge !== undefined && (
                <span className="absolute top-0 right-5 w-2 h-2 rounded-full bg-accent" />
              )}
            </button>
          );
        })}

        {/* Quick Add Floating Button in Bottom Bar */}
        <button
          onClick={onOpenQuickAdd}
          className="flex flex-col items-center justify-center -mt-5 bg-accent text-white p-3 rounded-full shadow-lg active:scale-90 transition-transform"
          title="Quick Add"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>
      </div>

      {/* Slide-out Mobile Drawer */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-4/5 max-w-xs bg-white dark:bg-[#1E293B] h-full shadow-2xl flex flex-col z-10 p-4">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4 fill-white" />
                </div>
                <span className="font-bold text-base text-gray-900 dark:text-white">
                  Menu & Tools
                </span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 pb-1">
                Main Views
              </div>
              {primaryBottomNav.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium ${
                      currentView === item.id ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}

              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 pt-4 pb-1">
                More Modules
              </div>
              {drawerNav.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium ${
                      currentView === item.id ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== null && item.badge !== undefined && (
                      <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-xl"
              >
                <span>Switch Theme</span>
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
              </button>

              <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs">
                <span className="font-semibold">{profile?.full_name || 'Ahmed'}</span>
                <button onClick={signOut} className="text-red-500 hover:underline flex items-center space-x-1">
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Exit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
