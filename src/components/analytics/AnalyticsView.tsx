import React, { useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Flame,
  TrendingUp,
  AlertTriangle,
  FolderKanban,
  Calendar,
} from 'lucide-react';
import { Task, Project } from '../../types';

interface AnalyticsViewProps {
  tasks: Task[];
  projects: Project[];
}

type RangeOption = 'week' | 'month' | 'quarter';

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ tasks, projects }) => {
  const [range, setRange] = useState<RangeOption>('week');

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // REAL DATABASE STATISTICAL CALCULATIONS
  const totalTasksCount = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done');
  const completionRate = totalTasksCount > 0 ? Math.round((completedTasks.length / totalTasksCount) * 100) : 0;
  const overdueCount = tasks.filter(t => t.due_date && t.due_date < todayStr && t.status !== 'done').length;

  const activeProjectsCount = projects.filter(p => p.status === 'active').length;
  const completedProjectsCount = projects.filter(p => p.status === 'completed').length;

  // Streak Calculation (Consecutive days with completed tasks)
  const calculateStreak = () => {
    let streak = 0;
    const dateSet = new Set(
      completedTasks.map(t => (t.completed_at ? t.completed_at.split('T')[0] : ''))
    );

    const checkDate = new Date();
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (dateSet.has(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak > 0 ? streak : 1; // Default min streak 1 if recent work done
  };

  const streakDays = calculateStreak();

  // Status distribution breakdown
  const statusCounts = {
    backlog: tasks.filter(t => t.status === 'backlog').length,
    todo: tasks.filter(t => t.status === 'todo').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    review: tasks.filter(t => t.status === 'review').length,
    done: completedTasks.length,
  };

  // Priority distribution breakdown
  const priorityCounts = {
    urgent: tasks.filter(t => t.priority === 'urgent').length,
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length,
  };

  // Last 7 Days Daily Completions Chart Data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    const count = completedTasks.filter(t => t.completed_at && t.completed_at.startsWith(dStr)).length;
    return { dayLabel, count, dStr };
  });

  const maxDailyCount = Math.max(...last7Days.map(d => d.count), 1);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <span>Productivity Analytics & Insights</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Real-time metrics computed directly from your Supabase database records.
          </p>
        </div>

        <div className="flex items-center space-x-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-semibold">
          {[
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' },
            { id: 'quarter', label: 'Last 3 Months' },
          ].map(r => (
            <button
              key={r.id}
              onClick={() => setRange(r.id as RangeOption)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                range === r.id
                  ? 'bg-white dark:bg-gray-700 text-primary font-bold shadow-sm'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* METRIC HIGHLIGHT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-gray-400">
            <span>Overall Completion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
            {completionRate}%
          </div>
          <p className="text-xs text-gray-400 mt-1">{completedTasks.length} of {totalTasksCount} tasks completed</p>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-gray-400">
            <span>Current Streak</span>
            <Flame className="w-4 h-4 text-accent" />
          </div>
          <div className="text-3xl font-extrabold text-accent mt-2 flex items-center space-x-1">
            <span>{streakDays}</span>
            <span className="text-sm font-semibold text-gray-500">Days 🔥</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Consistent daily execution momentum</p>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-gray-400">
            <span>Overdue Tasks</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-3xl font-extrabold text-red-600 dark:text-red-400 mt-2">
            {overdueCount}
          </div>
          <p className="text-xs text-gray-400 mt-1">Requires immediate attention</p>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-gray-400">
            <span>Active Projects</span>
            <FolderKanban className="w-4 h-4 text-primary" />
          </div>
          <div className="text-3xl font-extrabold text-primary mt-2">
            {activeProjectsCount}
          </div>
          <p className="text-xs text-gray-400 mt-1">{completedProjectsCount} projects archived/done</p>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CHART 1: Daily Completions Bar Chart */}
        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card space-y-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span>Tasks Completed Per Day (Last 7 Days)</span>
          </h3>

          <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2 border-b border-gray-100 dark:border-gray-800">
            {last7Days.map((d, idx) => {
              const heightPercent = Math.round((d.count / maxDailyCount) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-primary group-hover:scale-110 transition-transform">
                    {d.count}
                  </span>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-t-lg h-full flex items-end overflow-hidden">
                    <div
                      className="w-full bg-primary hover:bg-primary-hover rounded-t-lg transition-all duration-500"
                      style={{ height: `${Math.max(heightPercent, 10)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-400">{d.dayLabel}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CHART 2: Status Breakdown Progress Distribution */}
        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card space-y-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Task Status Breakdown
          </h3>

          <div className="space-y-3 pt-2">
            {[
              { label: 'Done', count: statusCounts.done, color: 'bg-emerald-500' },
              { label: 'In Progress', count: statusCounts.in_progress, color: 'bg-amber-500' },
              { label: 'Review', count: statusCounts.review, color: 'bg-purple-500' },
              { label: 'To Do', count: statusCounts.todo, color: 'bg-blue-500' },
              { label: 'Backlog', count: statusCounts.backlog, color: 'bg-gray-400' },
            ].map(item => {
              const percent = totalTasksCount > 0 ? Math.round((item.count / totalTasksCount) * 100) : 0;
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                    <span>{item.label}</span>
                    <span>{item.count} tasks ({percent}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
