import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Task, Project } from '../../types';

interface CalendarViewProps {
  tasks: Task[];
  projects: Project[];
  onCreateTask: (data: any) => Promise<void>;
}

type CalendarMode = 'month' | 'week' | 'day';

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, projects, onCreateTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarMode>('month');

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleCellClick = (dayNum: number) => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(dayNum).padStart(2, '0');
    const selectedDateStr = `${year}-${formattedMonth}-${formattedDay}`;

    onCreateTask({
      title: 'New Calendar Task',
      due_date: selectedDateStr,
      status: 'todo',
      priority: 'medium',
    });
  };

  // Build grid cells for Month view
  const gridCells = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    gridCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    gridCells.push(d);
  }

  const todayDateStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card">
        <div className="flex items-center space-x-3">
          <CalendarIcon className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {monthNames[month]} {year}
          </h2>
          <div className="flex items-center space-x-1 border border-gray-200 dark:border-gray-700 rounded-xl p-0.5">
            <button
              onClick={handlePrevMonth}
              className="p-1 text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-2 py-0.5 text-xs font-semibold text-gray-700 dark:text-gray-300"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1 text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-semibold">
          {['month', 'week', 'day'].map(m => (
            <button
              key={m}
              onClick={() => setViewMode(m as CalendarMode)}
              className={`px-3 py-1.5 rounded-lg capitalize ${
                viewMode === m
                  ? 'bg-white dark:bg-gray-700 text-primary shadow-sm font-bold'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
              }`}
            >
              {m} View
            </button>
          ))}
        </div>
      </div>

      {/* MONTH GRID */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 text-center py-2.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Grid Cells */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-gray-100 dark:divide-gray-800 border-b border-gray-100 dark:border-gray-800 min-h-[550px]">
          {gridCells.map((dayNum, idx) => {
            if (dayNum === null) {
              return <div key={`empty-${idx}`} className="bg-gray-50/40 dark:bg-gray-900/20" />;
            }

            const formattedMonth = String(month + 1).padStart(2, '0');
            const formattedDay = String(dayNum).padStart(2, '0');
            const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

            const dayTasks = tasks.filter(t => t.due_date === dateStr);
            const isToday = dateStr === todayDateStr;

            return (
              <div
                key={dateStr}
                onClick={() => handleCellClick(dayNum)}
                className={`p-2 min-h-[100px] hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-colors cursor-pointer space-y-1 group relative ${
                  isToday ? 'bg-blue-50/20 dark:bg-blue-950/10' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday ? 'bg-primary text-white shadow-sm' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {dayNum}
                  </span>

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleCellClick(dayNum);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-primary transition-opacity"
                    title="Add task on this date"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Day Tasks Pills */}
                <div className="space-y-1 overflow-y-auto max-h-[80px]">
                  {dayTasks.map(task => {
                    const isDone = task.status === 'done';
                    return (
                      <div
                        key={task.id}
                        className={`text-[10px] p-1 rounded-md font-semibold truncate border ${
                          isDone
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 line-through'
                            : task.priority === 'urgent'
                            ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300'
                            : task.priority === 'high'
                            ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                            : 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300'
                        }`}
                      >
                        {task.title}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
