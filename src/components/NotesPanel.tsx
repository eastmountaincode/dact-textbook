'use client';

import { useState, useEffect } from 'react';
import { useDevMode } from '@/providers/DevModeProvider';

interface Note {
  id: string;
  text: string;
  timestamp: number;
  chapterSlug: string;
}

interface NotesPanelProps {
  chapterSlug: string;
}

export default function NotesPanel({ chapterSlug }: NotesPanelProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { devBorder } = useDevMode();

  // Load notes from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`notes-${chapterSlug}`);
    if (stored) {
      setNotes(JSON.parse(stored));
    } else {
      setNotes([]);
    }
  }, [chapterSlug]);

  // Save notes to localStorage
  const saveNotes = (updatedNotes: Note[]) => {
    localStorage.setItem(`notes-${chapterSlug}`, JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
  };

  const addNote = () => {
    if (!newNote.trim()) return;

    const note: Note = {
      id: Date.now().toString(),
      text: newNote.trim(),
      timestamp: Date.now(),
      chapterSlug,
    };

    saveNotes([...notes, note]);
    setNewNote('');
  };

  const deleteNote = (id: string) => {
    saveNotes(notes.filter((n) => n.id !== id));
  };

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        className="fixed right-0 top-1/2 -translate-y-1/2 text-white p-2 rounded-l-lg shadow-lg z-40 cursor-pointer"
        style={{ backgroundColor: 'var(--berkeley-blue)' }}
        title="Open notes"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
    );
  }

  return (
    <aside className={`fixed right-0 top-14 bottom-0 w-72 shadow-lg z-40 flex flex-col ${devBorder('rose')}`} style={{ backgroundColor: 'var(--card-bg)', borderLeft: '1px solid var(--card-border)' }}>
      {/* Header */}
      <div className={`p-4 flex items-center justify-between ${devBorder('pink')}`} style={{ borderBottom: '1px solid var(--card-border)' }}>
        <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>Notes</h3>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 rounded cursor-pointer"
          style={{ color: 'var(--muted-text)' }}
          title="Collapse notes"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Notes List */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${devBorder('fuchsia')}`}>
        {notes.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: 'var(--muted-text)' }}>
            No notes yet. Add your first note below.
          </p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 relative group"
            >
              <p className="text-sm pr-6" style={{ color: 'var(--foreground)' }}>{note.text}</p>
              <p className="text-xs mt-2" style={{ color: 'var(--muted-text)' }}>
                {new Date(note.timestamp).toLocaleDateString()}
              </p>
              <button
                onClick={() => deleteNote(note.id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-yellow-200 rounded cursor-pointer"
                style={{ color: 'var(--muted-text)' }}
                title="Delete note"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Note */}
      <div className={`p-4 ${devBorder('sky')}`} style={{ borderTop: '1px solid var(--card-border)' }}>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note..."
          className="w-full p-3 text-sm rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#003262] focus:border-transparent"
          style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--foreground)' }}
          rows={3}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.metaKey) {
              addNote();
            }
          }}
        />
        <button
          onClick={addNote}
          disabled={!newNote.trim()}
          className="mt-2 w-full py-2 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          style={{ backgroundColor: 'var(--berkeley-blue)' }}
        >
          Add Note
        </button>
        <p className="text-xs mt-1 text-center" style={{ color: 'var(--muted-text)' }}>⌘ + Enter to save</p>
      </div>
    </aside>
  );
}
