import React, { useState } from 'react';
import {
  ArrowLeft,
  FolderKanban,
  CheckSquare,
  FileText,
  Activity,
  Plus,
  Clock,
  Trash2,
  Archive,
  CheckCircle2,
  CalendarDays,
} from 'lucide-react';
import { Project, Task, Note, ActivityLog, ProjectStatus, PriorityLevel, TaskStatus } from '../../types';

interface ProjectDetailViewProps {
  project: Project;
  tasks: Task[];
  notes: Note[];
  activityLogs: ActivityLog[];
  onBack: () => void;
  onUpdateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
  onArchiveProject: (id: string) => Promise<void>;
  onCreateTask: (data: any) => Promise<void>;
  onToggleTaskComplete: (id: string) => Promise<void>;
  onCreateNote: (data: any) => Promise<void>;
}

type ProjectTab = 'overview' | 'tasks' | 'notes' | 'activity';

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project,
  tasks,
  notes,
  activityLogs,
  onBack,
  onUpdateProject,
  onDeleteProject,
  onArchiveProject,
  onCreateTask,
  onToggleTaskComplete,
  onCreateNote,
}) => {
  const [activeTab, setActiveTab] = useState<ProjectTab>('overview');

  const projectTasks = tasks.filter(t => t.project_id === project.id);
  const projectNotes = notes.filter(n => n.project_id === project.id);
  const projectActivity = activityLogs.filter(a => a.entity_id === project.id);

  const completedTasks = projectTasks.filter(t => t.status === 'done').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Navigation */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Projects</span>
      </button>

      {/* Project Banner Card */}
      <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">{project.name}</h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                {project.status}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase">
                {project.priority} priority
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{project.description || 'No description provided.'}</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onArchiveProject(project.id)}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl flex items-center space-x-1 hover:bg-gray-200"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archive</span>
            </button>
            <button
              onClick={() => {
                onDeleteProject(project.id);
                onBack();
              }}
              className="px-3 py-1.5 bg-red-50 text-red-600 dark:bg-red-950/40 text-xs font-semibold rounded-xl flex items-center space-x-1 hover:bg-red-100"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Progress Bar & Details */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase text-gray-400">Progress</span>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${project.progress}%` }} />
              </div>
              <span className="text-xs font-bold text-primary">{project.progress}%</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase text-gray-400">Tasks Completed</span>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
              {completedTasks} / {projectTasks.length} tasks
            </p>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase text-gray-400">Target Deadline</span>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1 flex items-center space-x-1">
              <CalendarDays className="w-4 h-4 text-amber-500" />
              <span>{project.deadline || 'No deadline set'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* TABS HEADER */}
      <div className="flex items-center space-x-2 border-b border-gray-200 dark:border-gray-800 pb-1">
        {[
          { id: 'overview', label: 'Overview', icon: FolderKanban },
          { id: 'tasks', label: `Tasks (${projectTasks.length})`, icon: CheckSquare },
          { id: 'notes', label: `Notes (${projectNotes.length})`, icon: FileText },
          { id: 'activity', label: 'Activity Log', icon: Activity },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ProjectTab)}
              className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center space-x-2 transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card space-y-3">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">Project Summary & Tags</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              {project.description || 'No detailed background provided for this project.'}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {project.tags.map((t, idx) => (
                <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                  #{t}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card space-y-3">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">Quick Tasks Overview</h3>
            {projectTasks.slice(0, 4).map(t => (
              <div key={t.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                <span className={t.status === 'done' ? 'line-through text-gray-400' : 'font-medium'}>{t.title}</span>
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700">{t.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">Project Tasks</h3>
            <button
              onClick={() => onCreateTask({ title: 'New Task', project_id: project.id, status: 'todo' })}
              className="px-3 py-1.5 bg-accent text-white font-bold text-xs rounded-xl flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </div>

          <div className="space-y-2">
            {projectTasks.map(t => (
              <div key={t.id} className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={t.status === 'done'}
                    onChange={() => onToggleTaskComplete(t.id)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300 cursor-pointer"
                  />
                  <span className={`text-sm font-medium ${t.status === 'done' ? 'line-through text-gray-400' : ''}`}>{t.title}</span>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800">{t.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">Project Notes</h3>
            <button
              onClick={() => onCreateNote({ title: `Note for ${project.name}`, content: '', project_id: project.id })}
              className="px-3 py-1.5 bg-primary text-white font-bold text-xs rounded-xl flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Note</span>
            </button>
          </div>

          <div className="space-y-3">
            {projectNotes.map(n => (
              <div key={n.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">{n.title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 whitespace-pre-line">{n.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card space-y-3">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white">Activity Trail</h3>
          {projectActivity.length === 0 ? (
            <p className="text-xs text-gray-400">No project activity recorded yet.</p>
          ) : (
            projectActivity.map(a => (
              <div key={a.id} className="text-xs border-l-2 border-primary pl-3 py-1">
                <p className="font-semibold text-gray-800 dark:text-gray-200">{a.action}: {a.details}</p>
                <p className="text-[10px] text-gray-400">{new Date(a.created_at).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
