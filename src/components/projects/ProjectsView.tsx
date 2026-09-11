import React, { useState } from 'react';
import {
  FolderKanban,
  LayoutGrid,
  List as ListIcon,
  Plus,
  Search,
  Clock,
  CalendarDays,
  CheckCircle2,
  Trash2,
  Archive,
  ChevronRight,
} from 'lucide-react';
import { Project, Task, Note, ActivityLog, ProjectStatus, PriorityLevel } from '../../types';
import { ProjectDetailView } from './ProjectDetailView';

interface ProjectsViewProps {
  projects: Project[];
  tasks: Task[];
  notes: Note[];
  activityLogs: ActivityLog[];
  onCreateProject: (data: any) => Promise<void>;
  onUpdateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
  onArchiveProject: (id: string) => Promise<void>;
  onCreateTask: (data: any) => Promise<void>;
  onToggleTaskComplete: (id: string) => Promise<void>;
  onCreateNote: (data: any) => Promise<void>;
}

type ViewDisplayMode = 'grid' | 'list';
type SortOption = 'recently_updated' | 'deadline' | 'priority' | 'progress' | 'alphabetical';

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  tasks,
  notes,
  activityLogs,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  onArchiveProject,
  onCreateTask,
  onToggleTaskComplete,
  onCreateNote,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewDisplayMode>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recently_updated');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [status, setStatus] = useState<ProjectStatus>('active');
  const [deadline, setDeadline] = useState('');

  // Selected project detail view
  const activeDetailProject = projects.find(p => p.id === selectedProjectId);
  if (activeDetailProject) {
    return (
      <ProjectDetailView
        project={activeDetailProject}
        tasks={tasks}
        notes={notes}
        activityLogs={activityLogs}
        onBack={() => setSelectedProjectId(null)}
        onUpdateProject={onUpdateProject}
        onDeleteProject={onDeleteProject}
        onArchiveProject={onArchiveProject}
        onCreateTask={onCreateTask}
        onToggleTaskComplete={onToggleTaskComplete}
        onCreateNote={onCreateNote}
      />
    );
  }

  // Filter & Sort Logic
  const filtered = projects.filter(p => {
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    return true;
  });

  const sortedProjects = [...filtered].sort((a, b) => {
    if (sortBy === 'recently_updated') return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    if (sortBy === 'progress') return b.progress - a.progress;
    if (sortBy === 'alphabetical') return a.name.localeCompare(b.name);
    if (sortBy === 'deadline') return (a.deadline || '').localeCompare(b.deadline || '');
    return 0;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onCreateProject({
      name: name.trim(),
      description: desc.trim(),
      priority,
      status,
      deadline: deadline || null,
      tags: ['Project'],
    });
    setName('');
    setDesc('');
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Action & View Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card">
        
        {/* Status Filters */}
        <div className="flex items-center space-x-1 overflow-x-auto p-1 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-semibold">
          {['all', 'active', 'planning', 'on_hold', 'completed', 'archived'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg capitalize whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-white dark:bg-gray-700 text-primary dark:text-blue-400 font-bold shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Display Controls & Create Button */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-400'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-400'}`}
              title="List View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortOption)}
            className="px-2.5 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium"
          >
            <option value="recently_updated">Recently Updated</option>
            <option value="progress">Highest Progress</option>
            <option value="deadline">Deadline Date</option>
            <option value="alphabetical">Alphabetical</option>
          </select>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* RENDER PROJECTS */}
      {sortedProjects.length === 0 ? (
        <div className="bg-white dark:bg-[#1E293B] p-12 rounded-2xl border border-gray-200 dark:border-gray-800 text-center text-gray-400 space-y-3">
          <FolderKanban className="w-12 h-12 mx-auto text-primary/40" />
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">You don't have any projects yet</h3>
          <p className="text-xs">Create your first active project to organize tasks and track deliverables.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-md"
          >
            Create Project
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProjects.map(proj => {
            const projTasks = tasks.filter(t => t.project_id === proj.id && t.status !== 'backlog');
            const completedCount = projTasks.filter(t => t.status === 'done').length;

            return (
              <div
                key={proj.id}
                onClick={() => setSelectedProjectId(proj.id)}
                className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card hover:shadow-elevated transition-all cursor-pointer space-y-4 group"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-extrabold text-base text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                    {proj.name}
                  </h3>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                    {proj.status}
                  </span>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[32px]">
                  {proj.description || 'No description provided.'}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-300">
                    <span>{completedCount} / {projTasks.length} tasks completed</span>
                    <span className="text-primary font-bold">{proj.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                  <span>Deadline: {proj.deadline || 'None'}</span>
                  <span className="font-semibold text-primary group-hover:translate-x-1 transition-transform flex items-center">
                    Open <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
          {sortedProjects.map(proj => {
            const projTasks = tasks.filter(t => t.project_id === proj.id);
            const completedCount = projTasks.filter(t => t.status === 'done').length;

            return (
              <div
                key={proj.id}
                onClick={() => setSelectedProjectId(proj.id)}
                className="p-4 flex items-center justify-between hover:bg-gray-50/80 dark:hover:bg-gray-800/60 transition-colors cursor-pointer"
              >
                <div className="space-y-0.5">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">{proj.name}</h4>
                  <p className="text-xs text-gray-400 truncate max-w-md">{proj.description}</p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="hidden sm:block text-xs text-right">
                    <span className="font-bold text-primary">{proj.progress}%</span>
                    <span className="block text-[10px] text-gray-400">{completedCount}/{projTasks.length} tasks</span>
                  </div>

                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {proj.status}
                  </span>

                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#1E293B] rounded-2xl shadow-elevated border border-gray-200 dark:border-gray-800 p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create New Project</h3>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. YLY Season 8"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="Key goals and scope..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as PriorityLevel)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-500 hover:underline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl shadow-md"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
