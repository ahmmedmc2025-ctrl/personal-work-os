import React, { useState, useEffect } from 'react';
import { Search, X, CheckSquare, FolderKanban, Lightbulb, FileText, ArrowRight } from 'lucide-react';
import { Project, Task, Idea, Note, ViewMode } from '../../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  tasks: Task[];
  ideas: Idea[];
  notes: Note[];
  onNavigate: (view: ViewMode) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  projects,
  tasks,
  ideas,
  notes,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open search handled by parent or toggle
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchingTasks = q ? tasks.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)) : [];
  const matchingProjects = q ? projects.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) : [];
  const matchingIdeas = q ? ideas.filter(i => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)) : [];
  const matchingNotes = q ? notes.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)) : [];

  const totalResults = matchingTasks.length + matchingProjects.length + matchingIdeas.length + matchingNotes.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white dark:bg-[#1E293B] rounded-2xl shadow-elevated border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Header Input */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center space-x-3">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search tasks, projects, ideas, notes..."
            className="w-full bg-transparent text-base font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!query && (
            <div className="text-center py-10 text-gray-400 text-sm">
              Type keywords to search across your entire Work OS command center.
            </div>
          )}

          {query && totalResults === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">
              No matching records found for "{query}".
            </div>
          )}

          {/* Tasks Results */}
          {matchingTasks.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                <CheckSquare className="w-4 h-4 text-primary" />
                <span>Tasks ({matchingTasks.length})</span>
              </div>
              <div className="space-y-1">
                {matchingTasks.slice(0, 5).map(t => (
                  <div
                    key={t.id}
                    onClick={() => {
                      onNavigate('tasks');
                      onClose();
                    }}
                    className="p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/80 cursor-pointer flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{t.title}</p>
                      <p className="text-xs text-gray-400 line-clamp-1">{t.description || 'No description'}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects Results */}
          {matchingProjects.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                <FolderKanban className="w-4 h-4 text-indigo-500" />
                <span>Projects ({matchingProjects.length})</span>
              </div>
              <div className="space-y-1">
                {matchingProjects.slice(0, 4).map(p => (
                  <div
                    key={p.id}
                    onClick={() => {
                      onNavigate('projects');
                      onClose();
                    }}
                    className="p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/80 cursor-pointer flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{p.name}</p>
                      <p className="text-xs text-gray-400 line-clamp-1">{p.description}</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ideas Results */}
          {matchingIdeas.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Ideas ({matchingIdeas.length})</span>
              </div>
              <div className="space-y-1">
                {matchingIdeas.slice(0, 4).map(i => (
                  <div
                    key={i.id}
                    onClick={() => {
                      onNavigate('ideas');
                      onClose();
                    }}
                    className="p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/80 cursor-pointer flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{i.title}</p>
                      <p className="text-xs text-gray-400 line-clamp-1">{i.description}</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {i.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes Results */}
          {matchingNotes.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                <span>Notes ({matchingNotes.length})</span>
              </div>
              <div className="space-y-1">
                {matchingNotes.slice(0, 4).map(n => (
                  <div
                    key={n.id}
                    onClick={() => {
                      onNavigate('notes');
                      onClose();
                    }}
                    className="p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/80 cursor-pointer flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
                      <p className="text-xs text-gray-400 line-clamp-1">{n.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
