import React, { useState } from 'react';
import {
  Inbox as InboxIcon,
  Plus,
  CheckSquare,
  Lightbulb,
  FolderPlus,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { InboxItem, Project } from '../../types';

interface InboxViewProps {
  inboxItems: InboxItem[];
  projects: Project[];
  onCreateInboxItem: (text: string) => Promise<void>;
  onDeleteInboxItem: (id: string) => Promise<void>;
  onConvertInboxToTask: (inboxId: string, projectId?: string) => Promise<void>;
  onConvertInboxToIdea: (inboxId: string) => Promise<void>;
  onConvertInboxToProject: (inboxId: string) => Promise<void>;
}

export const InboxView: React.FC<InboxViewProps> = ({
  inboxItems,
  projects,
  onCreateInboxItem,
  onDeleteInboxItem,
  onConvertInboxToTask,
  onConvertInboxToIdea,
  onConvertInboxToProject,
}) => {
  const [quickInputText, setQuickInputText] = useState('');

  const handleQuickCaptureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInputText.trim()) return;
    await onCreateInboxItem(quickInputText.trim());
    setQuickInputText('');
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Quick Capture Input Banner */}
      <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card space-y-3">
        <div className="flex items-center space-x-2">
          <InboxIcon className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Quick Capture Dump</h2>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Unload thoughts, reminders, or draft ideas instantly. Organize them whenever you're ready.
        </p>

        <form onSubmit={handleQuickCaptureSubmit} className="flex gap-2 pt-2">
          <input
            type="text"
            value={quickInputText}
            onChange={e => setQuickInputText(e.target.value)}
            placeholder="Type anything (e.g. Need to contact someone, Idea for a new reel)..."
            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="submit"
            className="px-5 py-3 bg-accent hover:bg-accent-hover text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Quick Capture</span>
          </button>
        </form>
      </div>

      {/* Inbox Items List */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card p-6 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
          Unprocessed Inbox ({inboxItems.length})
        </h3>

        {inboxItems.length === 0 ? (
          <div className="py-12 text-center text-gray-400 space-y-1">
            <Sparkles className="w-10 h-10 mx-auto text-amber-400" />
            <p className="font-semibold text-gray-700 dark:text-gray-300">Your inbox is clear 🎉</p>
            <p className="text-xs">Use Quick Capture above to dump new ideas anytime.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {inboxItems.map(item => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1 overflow-hidden">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.text}</p>
                  <p className="text-[10px] text-gray-400">
                    Captured {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* Conversion Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onConvertInboxToTask(item.id)}
                    className="px-2.5 py-1.5 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold text-xs rounded-lg flex items-center space-x-1 hover:bg-blue-100"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>To Task</span>
                  </button>

                  <button
                    onClick={() => onConvertInboxToIdea(item.id)}
                    className="px-2.5 py-1.5 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 font-semibold text-xs rounded-lg flex items-center space-x-1 hover:bg-amber-100"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>To Idea</span>
                  </button>

                  <button
                    onClick={() => onConvertInboxToProject(item.id)}
                    className="px-2.5 py-1.5 bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 font-semibold text-xs rounded-lg flex items-center space-x-1 hover:bg-purple-100"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>To Project</span>
                  </button>

                  <button
                    onClick={() => onDeleteInboxItem(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
