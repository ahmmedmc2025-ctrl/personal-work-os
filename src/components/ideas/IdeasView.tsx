import React, { useState } from 'react';
import {
  Lightbulb,
  Plus,
  Search,
  FolderPlus,
  CheckSquare,
  Trash2,
  Tag,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Idea, IdeaCategory, IdeaStatus, Project } from '../../types';

interface IdeasViewProps {
  ideas: Idea[];
  projects: Project[];
  onCreateIdea: (data: any) => Promise<void>;
  onUpdateIdea: (id: string, updates: Partial<Idea>) => Promise<void>;
  onDeleteIdea: (id: string) => Promise<void>;
  onConvertIdeaToProject: (ideaId: string) => Promise<void>;
  onConvertIdeaToTask: (ideaId: string, projectId?: string) => Promise<void>;
}

export const IdeasView: React.FC<IdeasViewProps> = ({
  ideas,
  projects,
  onCreateIdea,
  onUpdateIdea,
  onDeleteIdea,
  onConvertIdeaToProject,
  onConvertIdeaToTask,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState<IdeaCategory>('Personal');
  const [status, setStatus] = useState<IdeaStatus>('idea');

  const categories: IdeaCategory[] = [
    'Business', 'Content', 'Design', 'AI', 'Technology', 'Personal', 'YLY', 'Marketing', 'Other'
  ];

  const filteredIdeas = ideas.filter(i => {
    if (searchQuery && !i.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (categoryFilter !== 'all' && i.category !== categoryFilter) return false;
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onCreateIdea({
      title: title.trim(),
      description: desc.trim(),
      category,
      status,
      tags: ['Idea', category],
    });
    setTitle('');
    setDesc('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card">
        {/* Category Filters */}
        <div className="flex items-center space-x-1 overflow-x-auto p-1 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              categoryFilter === 'all'
                ? 'bg-white dark:bg-gray-700 text-primary font-bold shadow-sm'
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            All Ideas ({ideas.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-white dark:bg-gray-700 text-primary font-bold shadow-sm'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search ideas..."
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs"
            />
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-3.5 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Idea</span>
          </button>
        </div>
      </div>

      {/* IDEAS CARDS GRID */}
      {filteredIdeas.length === 0 ? (
        <div className="bg-white dark:bg-[#1E293B] p-12 rounded-2xl border border-gray-200 dark:border-gray-800 text-center text-gray-400 space-y-3">
          <Lightbulb className="w-12 h-12 mx-auto text-amber-500/50" />
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">Your next great idea starts here</h3>
          <p className="text-xs">Capture raw thoughts and convert them into projects with one click.</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-accent text-white text-xs font-bold rounded-xl shadow-md"
          >
            Add Idea
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIdeas.map(idea => (
            <div
              key={idea.id}
              className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40">
                      <Lightbulb className="w-4 h-4" />
                    </span>
                    <h3 className="font-extrabold text-base text-gray-900 dark:text-white line-clamp-2">
                      {idea.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => onDeleteIdea(idea.id)}
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">
                  {idea.description || 'No detailed note added yet.'}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase">
                    {idea.category}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase">
                    {idea.status}
                  </span>
                </div>
              </div>

              {/* Convert Actions Bar */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => onConvertIdeaToProject(idea.id)}
                  className="flex-1 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs rounded-xl flex items-center justify-center space-x-1 transition-colors"
                  title="Create an Active Project from this idea"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Convert to Project</span>
                </button>

                <button
                  onClick={() => onConvertIdeaToTask(idea.id)}
                  className="py-2 px-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-semibold text-xs rounded-xl flex items-center space-x-1"
                  title="Create a Task from this idea"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>To Task</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE IDEA MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#1E293B] rounded-2xl shadow-elevated border border-gray-200 dark:border-gray-800 p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Capture Idea</h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. AI Content Automation"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as IdeaCategory)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="Concept details..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-500 hover:underline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent text-white text-xs font-semibold rounded-xl shadow-md"
                >
                  Save Idea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
