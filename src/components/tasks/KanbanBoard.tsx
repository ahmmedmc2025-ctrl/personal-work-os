import React from 'react';
import { Task, TaskStatus, Project, Subtask } from '../../types';
import { Plus, CheckSquare, Clock, AlertCircle } from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  projects: Project[];
  subtasks: Subtask[];
  onTaskClick: (task: Task) => void;
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
  onQuickAddTask: (status: TaskStatus) => void;
}

const KANBAN_COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'backlog', title: 'BACKLOG', color: 'border-gray-300 text-gray-500' },
  { id: 'todo', title: 'TO DO', color: 'border-blue-400 text-blue-600' },
  { id: 'in_progress', title: 'IN PROGRESS', color: 'border-amber-400 text-amber-600' },
  { id: 'review', title: 'REVIEW', color: 'border-purple-400 text-purple-600' },
  { id: 'done', title: 'DONE', color: 'border-emerald-400 text-emerald-600' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  projects,
  subtasks,
  onTaskClick,
  onMoveTask,
  onQuickAddTask,
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onMoveTask(taskId, status);
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
      {KANBAN_COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.id);

        return (
          <div
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={e => handleDrop(e, col.id)}
            className="bg-gray-50/70 dark:bg-[#1E293B]/60 p-3 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200/60 dark:border-gray-800">
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full bg-current ${col.color}`} />
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  {col.title}
                </h4>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  {colTasks.length}
                </span>
              </div>
              <button
                onClick={() => onQuickAddTask(col.id)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Task Cards Container */}
            <div className="flex-1 space-y-2.5">
              {colTasks.map(task => {
                const project = projects.find(p => p.id === task.project_id);
                const taskSubtasks = subtasks.filter(s => s.task_id === task.id);
                const completedSubs = taskSubtasks.filter(s => s.completed).length;

                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={e => handleDragStart(e, task.id)}
                    onClick={() => onTaskClick(task)}
                    className="p-3.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-card cursor-grab active:cursor-grabbing transition-all space-y-2.5 group"
                  >
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                        {task.title}
                      </p>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${
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

                    {project && (
                      <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                        {project.name}
                      </span>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-gray-100 dark:border-gray-700/60">
                      {task.due_date ? (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{task.due_date}</span>
                        </div>
                      ) : (
                        <span />
                      )}

                      {taskSubtasks.length > 0 && (
                        <div className="flex items-center space-x-1 font-semibold text-gray-500 dark:text-gray-400">
                          <CheckSquare className="w-3 h-3" />
                          <span>{completedSubs}/{taskSubtasks.length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
