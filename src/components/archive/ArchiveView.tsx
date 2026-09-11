import React, { useState } from 'react';
import { Archive, RotateCcw, Trash2, AlertTriangle, CheckSquare, FolderKanban, Lightbulb } from 'lucide-react';
import { Project, Task, Idea, Note } from '../../types';

interface ArchiveViewProps {
  projects: Project[];
  tasks: Task[];
  ideas: Idea[];
  notes: Note[];
  onUpdateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onUpdateIdea: (id: string, updates: Partial<Idea>) => Promise<void>;
  onDeleteIdea: (id: string) => Promise<void>;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({
  projects,
  tasks,
  ideas,
  notes,
  onUpdateProject,
  onDeleteProject,
  onUpdateTask,
  onDeleteTask,
  onUpdateIdea,
  onDeleteIdea,
}) => {
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{ id: string; type: 'project' | 'task' | 'idea'; title: string } | null>(null);

  const archivedProjects = projects.filter(p => p.status === 'archived');
  const archivedIdeas = ideas.filter(i => i.status === 'archived');

  const totalArchived = archivedProjects.length + archivedIdeas.length;

  const handleConfirmPermanentDelete = async () => {
    if (!deleteConfirmTarget) return;
    const { id, type } = deleteConfirmTarget;

    if (type === 'project') await onDeleteProject(id);
    if (type === 'task') await onDeleteTask(id);
    if (type === 'idea') await onDeleteIdea(id);

    setDeleteConfirmTarget(null);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <Archive className="w-5 h-5 text-gray-500" />
            <span>Archive Vault</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Archived items are safely stored and can be restored anytime or permanently removed.
          </p>
        </div>
        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-bold text-gray-700 dark:text-gray-300">
          {totalArchived} Items
        </span>
      </div>

      {totalArchived === 0 ? (
        <div className="bg-white dark:bg-[#1E293B] p-12 rounded-2xl border border-gray-200 dark:border-gray-800 text-center text-gray-400">
          Archive is currently empty.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Archived Projects */}
          {archivedProjects.length > 0 && (
            <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center space-x-2">
                <FolderKanban className="w-4 h-4 text-primary" />
                <span>Archived Projects ({archivedProjects.length})</span>
              </h3>

              <div className="space-y-2">
                {archivedProjects.map(p => (
                  <div key={p.id} className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onUpdateProject(p.id, { status: 'active' })}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 text-xs font-bold rounded-lg flex items-center space-x-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore</span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirmTarget({ id: p.id, type: 'project', title: p.name })}
                        className="p-1.5 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Archived Ideas */}
          {archivedIdeas.length > 0 && (
            <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center space-x-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Archived Ideas ({archivedIdeas.length})</span>
              </h3>

              <div className="space-y-2">
                {archivedIdeas.map(i => (
                  <div key={i.id} className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{i.title}</p>
                      <p className="text-xs text-gray-400">{i.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onUpdateIdea(i.id, { status: 'idea' })}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 text-xs font-bold rounded-lg flex items-center space-x-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore</span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirmTarget({ id: i.id, type: 'idea', title: i.title })}
                        className="p-1.5 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-[#1E293B] rounded-2xl shadow-elevated border border-gray-200 dark:border-gray-800 p-6 space-y-4">
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 font-bold">
              <AlertTriangle className="w-5 h-5" />
              <span>Confirm Permanent Deletion</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Are you sure you want to permanently delete "<span className="font-bold">{deleteConfirmTarget.title}</span>"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-3 py-1.5 text-xs text-gray-500 hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPermanentDelete}
                className="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
