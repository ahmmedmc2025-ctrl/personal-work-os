import React, { useState } from 'react';
import { FileText, Plus, Search, Trash2, Tag, BookOpen, Bold, Italic, List } from 'lucide-react';
import { Note, Project } from '../../types';

interface NotesViewProps {
  notes: Note[];
  projects: Project[];
  onCreateNote: (data: any) => Promise<void>;
  onUpdateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  projects,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
}) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');

  const activeNote = notes.find(n => n.id === selectedNoteId);

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNew = async () => {
    await onCreateNote({
      title: 'Untitled Note',
      content: '',
      tags: ['Note'],
    });
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[600px]">
        {/* Left Sidebar: Note List */}
        <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center space-x-2">
              <FileText className="w-5 h-5 text-primary" />
              <span>Notes ({notes.length})</span>
            </h3>
            <button
              onClick={handleCreateNew}
              className="p-1.5 rounded-xl bg-accent hover:bg-accent-hover text-white shadow-sm"
              title="New Note"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredNotes.map(n => {
              const isSelected = n.id === selectedNoteId;
              return (
                <div
                  key={n.id}
                  onClick={() => setSelectedNoteId(n.id)}
                  className={`p-3 rounded-xl cursor-pointer border transition-all ${
                    isSelected
                      ? 'bg-primary/10 border-primary/40 text-primary dark:bg-primary/20 dark:text-blue-400 font-semibold'
                      : 'bg-gray-50/50 dark:bg-gray-800/40 border-gray-100 dark:border-gray-800 hover:border-gray-300'
                  }`}
                >
                  <p className="text-sm font-bold truncate">{n.title || 'Untitled'}</p>
                  <p className="text-xs text-gray-400 line-clamp-2 mt-1">{n.content || 'Empty note...'}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Editor */}
        <div className="md:col-span-2 bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card space-y-4 flex flex-col">
          {activeNote ? (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={e => onUpdateNote(activeNote.id, { title: e.target.value })}
                  placeholder="Note Title..."
                  className="text-xl font-bold bg-transparent border-none text-gray-900 dark:text-white focus:outline-none w-full"
                />
                <button
                  onClick={() => onDeleteNote(activeNote.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Formatting Toolbar */}
              <div className="flex items-center space-x-2 py-1 px-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs text-gray-500">
                <button
                  onClick={() => onUpdateNote(activeNote.id, { content: activeNote.content + '\n**Bold text**' })}
                  className="p-1 hover:text-gray-900 dark:hover:text-white"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onUpdateNote(activeNote.id, { content: activeNote.content + '\n*Italic text*' })}
                  className="p-1 hover:text-gray-900 dark:hover:text-white"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onUpdateNote(activeNote.id, { content: activeNote.content + '\n- List item' })}
                  className="p-1 hover:text-gray-900 dark:hover:text-white"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Text Area */}
              <textarea
                value={activeNote.content}
                onChange={e => onUpdateNote(activeNote.id, { content: e.target.value })}
                placeholder="Start writing markdown or notes..."
                className="flex-1 w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono"
              />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-2">
              <BookOpen className="w-10 h-10 text-gray-300" />
              <p className="text-sm font-semibold">Select a note or create a new one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
