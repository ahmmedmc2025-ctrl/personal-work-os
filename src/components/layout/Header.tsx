import React, { useState } from 'react';
import {
  Search,
  Plus,
  Bell,
  Cloud,
  CloudOff,
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle2,
  CalendarDays,
} from 'lucide-react';
import { CloudSyncStatus, ViewMode, Task, Project } from '../../types';

interface HeaderProps {
  currentView: ViewMode;
  onOpenSearch: () => void;
  onOpenQuickAdd: () => void;
  syncStatus: CloudSyncStatus;
  onRefreshData: () => void;
  overdueTasks: Task[];
  dueTodayTasks: Task[];
  upcomingProjects: Project[];
  onNavigate: (view: ViewMode) => void;
}

const VIEW_TITLES: Record<ViewMode, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard Overview', subtitle: "Here's what's happening with your work." },
  inbox: { title: 'Inbox & Quick Capture', subtitle: 'Dump ideas and thoughts before organizing them.' },
  tasks: { title: 'Task Management', subtitle: 'Organize priorities, backlog, and sprint deliverables.' },
  projects: { title: 'Projects Overview', subtitle: 'Manage active campaigns, roadmaps, and progress.' },
  calendar: { title: 'Work Calendar', subtitle: 'Schedule deadlines and view task timing across days.' },
  ideas: { title: 'Ideas Vault', subtitle: 'Capture inspiration and convert ideas into active projects.' },
  notes: { title: 'Notes & Research', subtitle: 'Store documentation, meeting logs, and guides.' },
  analytics: { title: 'Productivity Analytics', subtitle: 'Real database metrics, streak tracking, and trend analysis.' },
  archive: { title: 'Archive Vault', subtitle: 'View restored or completed historical records.' },
  settings: { title: 'System Settings', subtitle: 'Manage theme, database cloud sync, and JSON backups.' },
};

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onOpenSearch,
  onOpenQuickAdd,
  syncStatus,
  onRefreshData,
  overdueTasks,
  dueTodayTasks,
  upcomingProjects,
  onNavigate,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const totalNotifications = overdueTasks.length + dueTodayTasks.length + upcomingProjects.length;

  return (
    <header className="h-16 bg-white dark:bg-[#1E293B] border-b border-gray-200 dark:border-gray-800 px-4 md:px-8 flex items-center justify-between sticky top-0 z-10">
      {/* Left: View Title */}
      <div>
        <h1 className="text-lg md:text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          {VIEW_TITLES[currentView]?.title || 'Work OS'}
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
          {VIEW_TITLES[currentView]?.subtitle}
        </p>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Cloud Sync Status Indicator */}
        <button
          onClick={onRefreshData}
          className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
            syncStatus === 'synced'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : syncStatus === 'syncing'
              ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
              : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
          }`}
          title="Click to refresh cloud sync"
        >
          {syncStatus === 'synced' && <Cloud className="w-3.5 h-3.5 text-emerald-600" />}
          {syncStatus === 'syncing' && <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />}
          {syncStatus === 'error' && <CloudOff className="w-3.5 h-3.5 text-amber-600" />}
          <span className="capitalize">{syncStatus === 'synced' ? 'Cloud Synced' : syncStatus}</span>
        </button>

        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700/70 text-gray-500 dark:text-gray-300 text-xs font-medium rounded-xl transition-all"
        >
          <Search className="w-4 h-4 text-gray-400" />
          <span className="hidden md:inline">Search...</span>
          <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
            Ctrl+K
          </kbd>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {totalNotifications > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                {totalNotifications}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1E293B] rounded-2xl shadow-elevated border border-gray-200 dark:border-gray-800 p-4 z-50 text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                <span className="font-bold text-sm text-gray-900 dark:text-white">Notifications</span>
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 font-semibold text-[10px]">
                  {totalNotifications} items require attention
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {overdueTasks.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800">
                    <div className="flex items-center space-x-1.5 text-red-700 dark:text-red-300 font-bold mb-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{overdueTasks.length} Overdue Tasks</span>
                    </div>
                    {overdueTasks.slice(0, 3).map(t => (
                      <div
                        key={t.id}
                        onClick={() => {
                          onNavigate('tasks');
                          setShowNotifications(false);
                        }}
                        className="truncate text-gray-700 dark:text-gray-300 hover:underline cursor-pointer py-0.5"
                      >
                        • {t.title} ({t.due_date})
                      </div>
                    ))}
                  </div>
                )}

                {dueTodayTasks.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center space-x-1.5 text-amber-700 dark:text-amber-300 font-bold mb-1">
                      <Clock className="w-4 h-4" />
                      <span>{dueTodayTasks.length} Tasks Due Today</span>
                    </div>
                    {dueTodayTasks.slice(0, 3).map(t => (
                      <div
                        key={t.id}
                        onClick={() => {
                          onNavigate('tasks');
                          setShowNotifications(false);
                        }}
                        className="truncate text-gray-700 dark:text-gray-300 hover:underline cursor-pointer py-0.5"
                      >
                        • {t.title}
                      </div>
                    ))}
                  </div>
                )}

                {upcomingProjects.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-1.5 text-blue-700 dark:text-blue-300 font-bold mb-1">
                      <CalendarDays className="w-4 h-4" />
                      <span>Upcoming Project Deadlines</span>
                    </div>
                    {upcomingProjects.slice(0, 2).map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onNavigate('projects');
                          setShowNotifications(false);
                        }}
                        className="truncate text-gray-700 dark:text-gray-300 hover:underline cursor-pointer py-0.5"
                      >
                        • {p.name} (Deadline: {p.deadline})
                      </div>
                    ))}
                  </div>
                )}

                {totalNotifications === 0 && (
                  <div className="text-center py-6 text-gray-400 flex flex-col items-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-1" />
                    <span>All clear! No overdue tasks.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Global + Quick Add Button */}
        <button
          onClick={onOpenQuickAdd}
          className="hidden sm:flex items-center space-x-1.5 px-3.5 py-2 bg-accent hover:bg-accent-hover text-white font-semibold text-xs rounded-xl shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Quick Add</span>
        </button>
      </div>
    </header>
  );
};
