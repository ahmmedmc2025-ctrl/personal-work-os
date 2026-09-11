import React, { useState } from 'react';
import { X, CheckSquare, FolderKanban, Lightbulb, FileText, Plus } from 'lucide-react';
import { Project, PriorityLevel, TaskStatus, IdeaCategory } from '../../types';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onCreateTask: (data: any, subtasks?: string[]) => Promise<void>;
  onCreateProject: (data: any) => Promise<void>;
  onCreateIdea: (data: any) => Promise<void>;
  onCreateNote: (data: any) => Promise<void>;
}

type TabType = 'task' | 'project' | 'idea' | 'note';

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  projects,
  onCreateTask,
  onCreateProject,
  onCreateIdea,
  onCreateNote,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('task');

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskProjId, setTaskProjId] = useState('');
  const [taskPriority, setTaskPriority] = useState<PriorityLevel>('medium');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('todo');

  // Project form state
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projPriority, setProjPriority] = useState<PriorityLevel>('medium');
  const [projDeadline, setProjDeadline] = useState('');

  // Idea form state
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaDesc, setIdeaDesc] = useState('');
  const [ideaCategory, setIdeaCategory] = useState<IdeaCategory>('Personal');

  // Note form state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteProjId, setNoteProjId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'task') {
      if (!taskTitle.trim()) return;
      await onCreateTask({
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        project_id: taskProjId || null,
        priority: taskPriority,
        due_date: taskDueDate || null,
        status: taskStatus,
        tags: ['QuickAdd'],
      });
      setTaskTitle('');
      setTaskDesc('');
    } else if (activeTab === 'project') {
      if (!projName.trim()) return;
      await onCreateProject({
        name: projName.trim(),
        description: projDesc.trim(),
        priority: projPriority,
        status: 'active',
        deadline: projDeadline || null,
        tags: ['NewProject'],
      });
      setProjName('');
      setProjDesc('');
    } else if (activeTab === 'idea') {
      if (!ideaTitle.trim()) return;
      await onCreateIdea({
        title: ideaTitle.trim(),
        description: ideaDesc.trim(),
        category: ideaCategory,
        status: 'idea',
        tags: ['QuickIdea'],
      });
      setIdeaTitle('');
      setIdeaDesc('');
    } else if (activeTab === 'note') {
      if (!noteTitle.trim()) return;
      await onCreateNote({
        title: noteTitle.trim(),
        content: noteContent.trim(),
        project_id: noteProjId || null,
        tags: ['QuickNote'],
      });
      setNoteTitle('');
      setNoteContent('');
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-[#1E293B] rounded-2xl shadow-elevated border border-gray-200 dark:border-gray-800 p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <Plus className="w-5 h-5 text-accent stroke-[3]" />
            <span>Create New</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-semibold">
          {[
            { id: 'task', label: 'Task', icon: CheckSquare },
            { id: 'project', label: 'Project', icon: FolderKanban },
            { id: 'idea', label: 'Idea', icon: Lightbulb },
            { id: 'note', label: 'Note', icon: FileText },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                  isActive
                    ? 'bg-white dark:bg-gray-700 text-primary dark:text-blue-400 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* TASK FORM */}
          {activeTab === 'task' && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  placeholder="e.g. Finish campaign design"
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Project</label>
                  <select
                    value={taskProjId}
                    onChange={e => setTaskProjId(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
                  >
                    <option value="">No Project</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={e => setTaskPriority(e.target.value as PriorityLevel)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Due Date</label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={e => setTaskDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
                />
              </div>
            </>
          )}

          {/* PROJECT FORM */}
          {activeTab === 'project' && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={projName}
                  onChange={e => setProjName(e.target.value)}
                  placeholder="e.g. YLY Season 8"
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={projDesc}
                  onChange={e => setProjDesc(e.target.value)}
                  placeholder="Summary of objectives and deliverables..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Priority</label>
                  <select
                    value={projPriority}
                    onChange={e => setProjPriority(e.target.value as PriorityLevel)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Deadline</label>
                  <input
                    type="date"
                    value={projDeadline}
                    onChange={e => setProjDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
                  />
                </div>
              </div>
            </>
          )}

          {/* IDEA FORM */}
          {activeTab === 'idea' && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Idea Title *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={ideaTitle}
                  onChange={e => setIdeaTitle(e.target.value)}
                  placeholder="e.g. AI Content Automation Workflow"
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Category</label>
                <select
                  value={ideaCategory}
                  onChange={e => setIdeaCategory(e.target.value as IdeaCategory)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
                >
                  <option value="Business">Business</option>
                  <option value="Content">Content</option>
                  <option value="Design">Design</option>
                  <option value="AI">AI</option>
                  <option value="Technology">Technology</option>
                  <option value="Personal">Personal</option>
                  <option value="YLY">YLY</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Details</label>
                <textarea
                  rows={2}
                  value={ideaDesc}
                  onChange={e => setIdeaDesc(e.target.value)}
                  placeholder="Rough concept notes..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
                />
              </div>
            </>
          )}

          {/* NOTE FORM */}
          {activeTab === 'note' && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Note Title *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={noteTitle}
                  onChange={e => setNoteTitle(e.target.value)}
                  placeholder="e.g. YLY Season 8 Meeting Notes"
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Content</label>
                <textarea
                  rows={3}
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  placeholder="Write your note markdown or list..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
                />
              </div>
            </>
          )}

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white font-semibold text-xs rounded-xl shadow-md transition-all"
            >
              Create {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
