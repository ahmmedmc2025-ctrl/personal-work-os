import React from 'react';
import {
  FolderKanban,
  CheckSquare,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
  Clock,
  Activity,
  Plus,
} from 'lucide-react';
import { Project, Task, Idea, ViewMode, ActivityLog } from '../../types';

interface DashboardViewProps {
  projects: Project[];
  tasks: Task[];
  ideas: Idea[];
  activityLogs: ActivityLog[];
  onNavigate: (view: ViewMode) => void;
  onToggleTaskComplete: (taskId: string) => Promise<void>;
  onOpenQuickAdd: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  tasks,
  ideas,
  activityLogs,
  onNavigate,
  onToggleTaskComplete,
  onOpenQuickAdd,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate Metrics from Database
  const activeProjects = projects.filter(p => p.status === 'active');
  const tasksToday = tasks.filter(t => t.due_date === todayStr && t.status !== 'done');
  const overdueTasks = tasks.filter(t => t.due_date && t.due_date < todayStr && t.status !== 'done');
  const completedTasks = tasks.filter(t => t.status === 'done');
  const activeIdeas = ideas.filter(i => i.status !== 'archived');

  const todayTasksList = tasks.filter(t => t.due_date === todayStr);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning 👋';
    if (hour < 18) return 'Good afternoon 👋';
    return 'Good evening 👋';
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {getGreeting()}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Here's what's happening with your work today.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="px-3.5 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 flex items-center space-x-2">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>{formattedDate}</span>
          </div>
          <button
            onClick={onOpenQuickAdd}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Item</span>
          </button>
        </div>
      </div>

      {/* 5 TOP SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {[
          {
            label: 'ACTIVE PROJECTS',
            count: activeProjects.length,
            icon: FolderKanban,
            color: 'text-primary bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
            view: 'projects' as ViewMode,
          },
          {
            label: 'TASKS TODAY',
            count: tasksToday.length,
            icon: CheckSquare,
            color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
            view: 'tasks' as ViewMode,
          },
          {
            label: 'OVERDUE',
            count: overdueTasks.length,
            icon: AlertTriangle,
            color: overdueTasks.length > 0 ? 'text-red-600 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800' : 'text-gray-500 bg-gray-50 dark:bg-gray-800 border-gray-200',
            view: 'tasks' as ViewMode,
          },
          {
            label: 'COMPLETED',
            count: completedTasks.length,
            icon: CheckCircle2,
            color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
            view: 'tasks' as ViewMode,
          },
          {
            label: 'IDEAS',
            count: activeIdeas.length,
            icon: Lightbulb,
            color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800',
            view: 'ideas' as ViewMode,
          },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigate(card.view)}
              className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-800 shadow-card hover:shadow-elevated transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-hover:text-primary transition-colors">
                  {card.label}
                </span>
                <div className={`p-1.5 rounded-lg border ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {card.count}
              </div>
            </div>
          );
        })}
      </div>

      {/* MAIN TWO-COLUMN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: TODAY'S FOCUS & ACTIVE PROJECTS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* TODAY'S FOCUS SECTION */}
          <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center space-x-2">
                <CheckSquare className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Today's Focus
                </h3>
              </div>
              <button
                onClick={() => onNavigate('tasks')}
                className="text-xs font-semibold text-primary hover:underline flex items-center space-x-1"
              >
                <span>View all tasks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {todayTasksList.length === 0 ? (
                <div className="py-8 text-center text-gray-400 space-y-1">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">You're all clear today 🎉</p>
                  <p className="text-xs">No tasks due for today. Click New Item to plan ahead.</p>
                </div>
              ) : (
                todayTasksList.map(task => {
                  const project = projects.find(p => p.id === task.project_id);
                  const isDone = task.status === 'done';
                  return (
                    <div
                      key={task.id}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                        isDone
                          ? 'bg-gray-50 dark:bg-gray-900/40 border-gray-100 dark:border-gray-800 opacity-60'
                          : 'bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700/70 hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => onToggleTaskComplete(task.id)}
                          className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300 cursor-pointer"
                        />
                        <span
                          className={`text-sm font-medium truncate ${
                            isDone ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        {project && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                            {project.name}
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            task.priority === 'urgent'
                              ? 'bg-red-100 text-red-700'
                              : task.priority === 'high'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ACTIVE PROJECTS GRID */}
          <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center space-x-2">
                <FolderKanban className="w-5 h-5 text-accent" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Active Projects
                </h3>
              </div>
              <button
                onClick={() => onNavigate('projects')}
                className="text-xs font-semibold text-primary hover:underline flex items-center space-x-1"
              >
                <span>View all projects</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {activeProjects.length === 0 ? (
              <div className="py-8 text-center text-gray-400">
                You don't have any active projects yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeProjects.slice(0, 4).map(proj => {
                  const projTasks = tasks.filter(t => t.project_id === proj.id && t.status !== 'backlog');
                  const completedProjTasks = projTasks.filter(t => t.status === 'done').length;

                  return (
                    <div
                      key={proj.id}
                      onClick={() => onNavigate('projects')}
                      className="p-4 rounded-xl border border-gray-200 dark:border-gray-700/80 hover:border-primary/50 transition-all cursor-pointer space-y-3 bg-gray-50/50 dark:bg-gray-800/40"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                          {proj.name}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {proj.status}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {proj.description || 'No description added.'}
                      </p>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-300">
                          <span>{completedProjTasks} / {projTasks.length} tasks completed</span>
                          <span className="text-primary font-bold">{proj.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${proj.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: UPCOMING DEADLINES & RECENT ACTIVITY */}
        <div className="space-y-6">
          
          {/* UPCOMING DEADLINES */}
          <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-gray-100 dark:border-gray-800">
              <Clock className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Upcoming Deadlines
              </h3>
            </div>

            <div className="space-y-3">
              {tasks.filter(t => t.due_date && t.due_date > todayStr && t.status !== 'done').slice(0, 4).map(t => (
                <div key={t.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="truncate font-medium text-gray-800 dark:text-gray-200">
                    {t.title}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 shrink-0">
                    {t.due_date}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* RECENT ACTIVITY */}
          <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-gray-100 dark:border-gray-800">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Recent Activity
              </h3>
            </div>

            <div className="space-y-3">
              {activityLogs.length === 0 ? (
                <p className="text-xs text-gray-400">No actions logged yet.</p>
              ) : (
                activityLogs.slice(0, 5).map(log => (
                  <div key={log.id} className="text-xs space-y-0.5 border-l-2 border-primary/40 pl-2.5">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      {log.action}: <span className="text-primary">{log.details}</span>
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
