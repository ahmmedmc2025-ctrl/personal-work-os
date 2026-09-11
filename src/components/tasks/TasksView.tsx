import React, { useState } from 'react';
import {
  List,
  Kanban,
  Calendar,
  CheckCircle2,
  Filter,
  Plus,
  Search,
  Clock,
  Trash2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Task, Project, Subtask, TaskStatus, PriorityLevel } from '../../types';
import { KanbanBoard } from './KanbanBoard';
import { TaskDetailModal } from './TaskDetailModal';

interface TasksViewProps {
  tasks: Task[];
  projects: Project[];
  subtasks: Subtask[];
  onCreateTask: (data: any, subtasks?: string[]) => Promise<void>;
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  onToggleTaskComplete: (id: string) => Promise<void>;
  onMoveTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onCreateSubtask: (taskId: string, title: string) => Promise<void>;
  onToggleSubtask: (id: string) => Promise<void>;
  onDeleteSubtask: (id: string) => Promise<void>;
}

type TabMode = 'list' | 'kanban' | 'today' | 'upcoming' | 'completed';

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  projects,
  subtasks,
  onCreateTask,
  onUpdateTask,
  onToggleTaskComplete,
  onMoveTaskStatus,
  onDeleteTask,
  onCreateSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}) => {
  const [activeTab, setActiveTab] = useState<TabMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtering Logic
  const filteredTasks = tasks.filter(t => {
    // Search match
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    // Status filter
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    // Priority filter
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    // Project filter
    if (projectFilter !== 'all' && t.project_id !== projectFilter) return false;

    // View Tabs filter
    if (activeTab === 'today') return t.due_date === todayStr;
    if (activeTab === 'upcoming') return t.due_date && t.due_date > todayStr && t.status !== 'done';
    if (activeTab === 'completed') return t.status === 'done';

    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Action & View Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card">
        {/* Tab View Selectors */}
        <div className="flex items-center space-x-1 overflow-x-auto p-1 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-semibold">
          {[
            { id: 'list', label: 'List View', icon: List },
            { id: 'kanban', label: 'Kanban Board', icon: Kanban },
            { id: 'today', label: "Today's Tasks", icon: Clock },
            { id: 'upcoming', label: 'Upcoming', icon: Calendar },
            { id: 'completed', label: 'Completed', icon: CheckCircle2 },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabMode)}
                className={`px-3 py-2 rounded-lg flex items-center space-x-1.5 whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white dark:bg-gray-700 text-primary dark:text-blue-400 shadow-sm font-bold'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={projectFilter}
            onChange={e => setProjectFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium max-w-[140px] truncate"
          >
            <option value="all">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <button
            onClick={() => onCreateTask({ title: 'New Task', status: 'todo', priority: 'medium' })}
            className="px-3.5 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* VIEW RENDER logic */}
      {activeTab === 'kanban' ? (
        <KanbanBoard
          tasks={filteredTasks}
          projects={projects}
          subtasks={subtasks}
          onTaskClick={task => setSelectedTask(task)}
          onMoveTask={onMoveTaskStatus}
          onQuickAddTask={status => onCreateTask({ title: 'New Task', status, priority: 'medium' })}
        />
      ) : (
        /* LIST / TABULAR VIEW */
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card overflow-hidden">
          {filteredTasks.length === 0 ? (
            <div className="py-16 text-center text-gray-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500/80" />
              <p className="font-semibold text-gray-700 dark:text-gray-300">No tasks found matching your filter</p>
              <p className="text-xs">Adjust your search parameters or create a new task.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredTasks.map(task => {
                const project = projects.find(p => p.id === task.project_id);
                const taskSubtasks = subtasks.filter(s => s.task_id === task.id);
                const completedSubs = taskSubtasks.filter(s => s.completed).length;
                const isDone = task.status === 'done';

                return (
                  <div
                    key={task.id}
                    className={`p-4 flex items-center justify-between hover:bg-gray-50/80 dark:hover:bg-gray-800/60 transition-colors group ${
                      isDone ? 'bg-gray-50/50 dark:bg-gray-900/30' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3.5 flex-1 pr-4 overflow-hidden">
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => onToggleTaskComplete(task.id)}
                        className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300 cursor-pointer shrink-0"
                      />
                      <div className="overflow-hidden cursor-pointer" onClick={() => setSelectedTask(task)}>
                        <p
                          className={`text-sm font-semibold truncate ${
                            isDone ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-gray-400 truncate mt-0.5">{task.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      {project && (
                        <span className="hidden sm:inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                          {project.name}
                        </span>
                      )}

                      {taskSubtasks.length > 0 && (
                        <span className="text-[10px] font-semibold text-gray-500">
                          {completedSubs}/{taskSubtasks.length} subtasks
                        </span>
                      )}

                      {task.due_date && (
                        <span className="text-[10px] font-medium text-gray-400 px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800">
                          {task.due_date}
                        </span>
                      )}

                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          task.priority === 'urgent'
                            ? 'bg-red-100 text-red-700'
                            : task.priority === 'high'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {task.priority}
                      </span>

                      <button
                        onClick={() => setSelectedTask(task)}
                        className="p-1 rounded text-gray-400 hover:text-primary transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TASK DETAIL MODAL */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        projects={projects}
        subtasks={subtasks}
        onUpdateTask={onUpdateTask}
        onDeleteTask={onDeleteTask}
        onCreateSubtask={onCreateSubtask}
        onToggleSubtask={onToggleSubtask}
        onDeleteSubtask={onDeleteSubtask}
      />
    </div>
  );
};
