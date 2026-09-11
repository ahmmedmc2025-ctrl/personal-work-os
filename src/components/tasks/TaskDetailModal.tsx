import React, { useState } from 'react';
import { X, CheckSquare, Plus, Trash2, Calendar, Tag, AlertCircle } from 'lucide-react';
import { Task, Subtask, Project, PriorityLevel, TaskStatus } from '../../types';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  subtasks: Subtask[];
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onCreateSubtask: (taskId: string, title: string) => Promise<void>;
  onToggleSubtask: (id: string) => Promise<void>;
  onDeleteSubtask: (id: string) => Promise<void>;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  projects,
  subtasks,
  onUpdateTask,
  onDeleteTask,
  onCreateSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  if (!isOpen || !task) return null;

  const taskSubtasks = subtasks.filter(s => s.task_id === task.id);
  const completedSubtasksCount = taskSubtasks.filter(s => s.completed).length;
  const subtaskPercent = taskSubtasks.length > 0 ? Math.round((completedSubtasksCount / taskSubtasks.length) * 100) : 0;

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    await onCreateSubtask(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-white dark:bg-[#1E293B] rounded-2xl shadow-elevated border border-gray-200 dark:border-gray-800 p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 pr-4">
            <input
              type="text"
              value={task.title}
              onChange={e => onUpdateTask(task.id, { title: e.target.value })}
              className="text-lg font-bold text-gray-900 dark:text-white bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary focus:outline-none w-full"
            />
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Settings Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl text-xs">
          <div>
            <span className="block text-gray-400 font-medium mb-1">Status</span>
            <select
              value={task.status}
              onChange={e => onUpdateTask(task.id, { status: e.target.value as TaskStatus })}
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-1.5 font-semibold text-gray-900 dark:text-white"
            >
              <option value="backlog">Backlog</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div>
            <span className="block text-gray-400 font-medium mb-1">Priority</span>
            <select
              value={task.priority}
              onChange={e => onUpdateTask(task.id, { priority: e.target.value as PriorityLevel })}
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-1.5 font-semibold text-gray-900 dark:text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <span className="block text-gray-400 font-medium mb-1">Project</span>
            <select
              value={task.project_id || ''}
              onChange={e => onUpdateTask(task.id, { project_id: e.target.value || null })}
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-1.5 font-semibold text-gray-900 dark:text-white"
            >
              <option value="">No Project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Description</label>
          <textarea
            rows={3}
            value={task.description || ''}
            onChange={e => onUpdateTask(task.id, { description: e.target.value })}
            placeholder="Add detailed task notes and context..."
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* SUBTASKS SECTION */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Subtasks ({completedSubtasksCount}/{taskSubtasks.length})
            </span>
            {taskSubtasks.length > 0 && (
              <span className="text-xs font-bold text-primary">{subtaskPercent}% complete</span>
            )}
          </div>

          {/* Subtask Progress Bar */}
          {taskSubtasks.length > 0 && (
            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${subtaskPercent}%` }}
              />
            </div>
          )}

          {/* Subtask List */}
          <div className="space-y-1.5">
            {taskSubtasks.map(sub => (
              <div
                key={sub.id}
                className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/80 group"
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={sub.completed}
                    onChange={() => onToggleSubtask(sub.id)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300 cursor-pointer"
                  />
                  <span className={`text-sm ${sub.completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                    {sub.title}
                  </span>
                </div>
                <button
                  onClick={() => onDeleteSubtask(sub.id)}
                  className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Subtask Input */}
          <form onSubmit={handleAddSubtask} className="flex space-x-2">
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={e => setNewSubtaskTitle(e.target.value)}
              placeholder="Add a subtask..."
              className="flex-1 px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <button
            onClick={() => {
              onDeleteTask(task.id);
              onClose();
            }}
            className="px-3 py-1.5 bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 rounded-xl text-xs font-semibold flex items-center space-x-1 hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Task</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl shadow-md"
          >
            Save & Close
          </button>
        </div>

      </div>
    </div>
  );
};
