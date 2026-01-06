'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import katex from 'katex';
import { useDevMode } from '@/providers/DevModeProvider';

interface Highlight {
  id: string;
  startOffset: number;  // Character offset from start of container's textContent
  endOffset: number;    // Character offset for end
  text: string;         // Just for display/debugging
}

interface InlineNote {
  id: string;
  selectedText: string;
  startOffset: number;
  endOffset: number;
  text: string;
  timestamp: number;
}

interface NotePosition {
  id: string;
  top: number;
  found: boolean;
}

interface HighlightableContentProps {
  html: string;
  chapterSlug: string;
}

// Helper: Get character offset of a point within a container
function getCharacterOffset(container: Node, targetNode: Node, targetOffset: number): number {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
  let offset = 0;
  let node: Text | null;

  while ((node = walker.nextNode() as Text | null)) {
    if (node === targetNode) {
      return offset + targetOffset;
    }
    offset += node.textContent?.length || 0;
  }
  return offset;
}

// Helper: Find text node and offset for a given character offset
function findNodeAtOffset(container: Node, targetOffset: number): { node: Text; offset: number } | null {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
  let currentOffset = 0;
  let node: Text | null;

  while ((node = walker.nextNode() as Text | null)) {
    const nodeLength = node.textContent?.length || 0;
    if (currentOffset + nodeLength > targetOffset) {
      return { node, offset: targetOffset - currentOffset };
    }
    currentOffset += nodeLength;
  }
  return null;
}

// Helper: Apply highlight marks to DOM using character offsets
function applyHighlightsToDOM(container: HTMLElement, highlights: Highlight[]) {
  // Sort highlights by startOffset descending so we process from end to start
  // This prevents offset shifts from affecting earlier highlights
  const sorted = [...highlights].sort((a, b) => b.startOffset - a.startOffset);

  for (const highlight of sorted) {
    const startPos = findNodeAtOffset(container, highlight.startOffset);
    const endPos = findNodeAtOffset(container, highlight.endOffset);

    if (!startPos || !endPos) continue;

    try {
      const range = document.createRange();
      range.setStart(startPos.node, startPos.offset);
      range.setEnd(endPos.node, endPos.offset);

      // Check if this range is already highlighted
      const existingMark = range.commonAncestorContainer.parentElement?.closest('mark[data-highlight-id]');
      if (existingMark) continue;

      // Create mark element
      const mark = document.createElement('mark');
      mark.style.backgroundColor = '#fef08a';
      mark.style.padding = '0';
      mark.style.margin = '0';
      mark.setAttribute('data-highlight-id', highlight.id);

      // Wrap the range contents
      range.surroundContents(mark);
    } catch {
      // surroundContents can fail if range spans multiple elements in complex ways
      // Fall back to simpler highlighting for just the text we can find
      console.warn('Could not apply highlight:', highlight.text.slice(0, 30));
    }
  }
}

// Helper: Remove all highlight marks from DOM
function removeHighlightsFromDOM(container: HTMLElement) {
  const marks = container.querySelectorAll('mark[data-highlight-id]');
  marks.forEach(mark => {
    const parent = mark.parentNode;
    while (mark.firstChild) {
      parent?.insertBefore(mark.firstChild, mark);
    }
    parent?.removeChild(mark);
  });
  // Normalize to merge adjacent text nodes
  container.normalize();
}

export default function HighlightableContent({ html, chapterSlug }: HighlightableContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentInitialized = useRef(false);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q');
  const [searchHighlight, setSearchHighlight] = useState<string | null>(null);
  const { devBorder } = useDevMode();
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [notes, setNotes] = useState<InlineNote[]>([]);
  const [notePositions, setNotePositions] = useState<NotePosition[]>([]);
  const [selection, setSelection] = useState<{
    text: string;
    startOffset: number;
    endOffset: number;
    viewportRect: DOMRect | null;
    clientRects: DOMRect[];
    relativeTop: number;
  } | null>(null);
  const [overlappingHighlights, setOverlappingHighlights] = useState<Highlight[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [hoveredNoteId, setHoveredNoteId] = useState<string | null>(null);
  const [notesCollapsed, setNotesCollapsed] = useState(false);

  // Load highlights, notes, and collapsed state from localStorage
  useEffect(() => {
    const savedHighlights = localStorage.getItem(`highlights-${chapterSlug}`);
    const savedNotes = localStorage.getItem(`inline-notes-${chapterSlug}`);
    const savedCollapsed = localStorage.getItem('notesCollapsed');
    if (savedHighlights) {
      try {
        const parsed = JSON.parse(savedHighlights);
        // Handle migration from old format (text-only) to new format (with offsets)
        const migrated = parsed.filter((h: Highlight) => typeof h.startOffset === 'number');
        setHighlights(migrated);
      } catch {
        setHighlights([]);
      }
    }
    if (savedNotes) {
      try {
        const parsed = JSON.parse(savedNotes);
        setNotes(parsed);
      } catch {
        setNotes([]);
      }
    }
    if (savedCollapsed) setNotesCollapsed(savedCollapsed === 'true');
  }, [chapterSlug]);

  // Track the last html we initialized to prevent re-initialization
  const lastInitializedHtml = useRef<string>('');

  // Initialize content and apply KaTeX (runs once when html changes)
  useEffect(() => {
    if (!containerRef.current) return;
    // Only reinitialize if html actually changed
    if (lastInitializedHtml.current === html) return;

    // Set the HTML content
    containerRef.current.innerHTML = html;
    lastInitializedHtml.current = html;
    contentInitialized.current = true;

    // Process math with KaTeX
    const container = containerRef.current;
    const inlineMathSpans = container.querySelectorAll('span.math.inline');
    inlineMathSpans.forEach((span) => {
      const latex = span.textContent || '';
      try {
        span.innerHTML = katex.renderToString(latex, { displayMode: false, throwOnError: false });
      } catch (e) {
        console.error('KaTeX error:', e);
      }
    });

    const displayMathSpans = container.querySelectorAll('span.math.display');
    displayMathSpans.forEach((span) => {
      const latex = span.textContent || '';
      try {
        span.innerHTML = katex.renderToString(latex, { displayMode: true, throwOnError: false });
      } catch (e) {
        console.error('KaTeX error:', e);
      }
    });

    // Initialize collapsible sections
    const collapsibles = container.querySelectorAll('[data-collapse="true"]');
    collapsibles.forEach((section) => {
      // Start collapsed
      section.classList.add('callout-collapsed');
    });
  }, [html, chapterSlug]);

  // Handle clicks on collapsible headers
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleCollapseClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const heading = target.closest('h2');
      if (!heading) return;

      const section = heading.closest('[data-collapse="true"]');
      if (!section) return;

      section.classList.toggle('callout-collapsed');
    };

    container.addEventListener('click', handleCollapseClick);
    return () => container.removeEventListener('click', handleCollapseClick);
  }, [html]);

  // Apply highlights to DOM when highlights change or after content initializes
  useEffect(() => {
    if (!containerRef.current || !contentInitialized.current) return;

    // Delay to ensure KaTeX and content are ready
    const timer = setTimeout(() => {
      if (!containerRef.current) return;
      // First remove any existing highlights
      removeHighlightsFromDOM(containerRef.current);
      // Then apply current highlights
      if (highlights.length > 0) {
        applyHighlightsToDOM(containerRef.current, highlights);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [highlights, html]); // Include html so highlights are applied after content init

  // Handle search query from URL
  useEffect(() => {
    if (!searchQuery || !containerRef.current) return;

    setSearchHighlight(searchQuery);

    const timer = setTimeout(() => {
      if (!containerRef.current) return;

      const walker = document.createTreeWalker(
        containerRef.current,
        NodeFilter.SHOW_TEXT,
        null
      );

      let node: Text | null;
      const searchLower = searchQuery.toLowerCase();
      while ((node = walker.nextNode() as Text | null)) {
        const nodeText = node.textContent || '';
        const index = nodeText.toLowerCase().indexOf(searchLower);
        if (index !== -1) {
          const range = document.createRange();
          range.setStart(node, index);
          range.setEnd(node, index + searchQuery.length);

          const rect = range.getBoundingClientRect();
          window.scrollTo({
            top: window.scrollY + rect.top - 150,
            behavior: 'smooth'
          });

          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);

          setTimeout(() => sel?.removeAllRanges(), 2000);
          break;
        }
      }
    }, 300);

    const clearTimer = setTimeout(() => setSearchHighlight(null), 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(clearTimer);
    };
  }, [searchQuery]);

  // Toggle notes panel
  const toggleNotesPanel = () => {
    const newValue = !notesCollapsed;
    setNotesCollapsed(newValue);
    localStorage.setItem('notesCollapsed', String(newValue));
  };

  // Find note position by offset
  const findPositionByOffset = useCallback((startOffset: number): { top: number; found: boolean } => {
    if (!containerRef.current || !wrapperRef.current) {
      return { top: 0, found: false };
    }

    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    const pos = findNodeAtOffset(containerRef.current, startOffset);

    if (pos) {
      const range = document.createRange();
      range.setStart(pos.node, pos.offset);
      range.setEnd(pos.node, pos.offset);
      const rect = range.getBoundingClientRect();
      return { top: rect.top - wrapperRect.top, found: true };
    }

    return { top: 0, found: false };
  }, []);

  // Calculate note positions
  const calculateNotePositions = useCallback(() => {
    const positions = notes.map(note => {
      // Use offset-based positioning if available
      if (typeof note.startOffset === 'number') {
        const { top, found } = findPositionByOffset(note.startOffset);
        return { id: note.id, top, found };
      }
      // Fallback for old notes without offsets
      return { id: note.id, top: 0, found: false };
    });
    setNotePositions(positions);
  }, [notes, findPositionByOffset]);

  // Recalculate positions on resize, font size change, and after content renders
  useEffect(() => {
    const timer = setTimeout(calculateNotePositions, 150);

    const handleResize = () => calculateNotePositions();
    const handleFontSizeChange = () => setTimeout(calculateNotePositions, 50);

    window.addEventListener('resize', handleResize);
    window.addEventListener('fontSizeChange', handleFontSizeChange);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('fontSizeChange', handleFontSizeChange);
    };
  }, [calculateNotePositions]);

  // Recalculate when notes or html change
  useEffect(() => {
    const timer = setTimeout(calculateNotePositions, 150);
    return () => clearTimeout(timer);
  }, [notes, html, calculateNotePositions]);


  // Handle text selection
  const handleMouseUp = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !containerRef.current || !wrapperRef.current) {
      setSelection(null);
      return;
    }

    const text = sel.toString().trim();
    if (!text) {
      setSelection(null);
      return;
    }

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const wrapperRect = wrapperRef.current.getBoundingClientRect();

    if (!containerRef.current.contains(range.commonAncestorContainer)) {
      setSelection(null);
      return;
    }

    // Calculate character offsets
    const startOffset = getCharacterOffset(containerRef.current, range.startContainer, range.startOffset);
    const endOffset = getCharacterOffset(containerRef.current, range.endContainer, range.endOffset);

    const relativeTop = rect.top - wrapperRect.top;
    const rects = Array.from(range.getClientRects());

    // Find overlapping highlights using offset ranges
    const overlapping = highlights.filter(h => {
      // Check if ranges overlap
      return !(endOffset <= h.startOffset || startOffset >= h.endOffset);
    });

    setOverlappingHighlights(overlapping);
    setSelection({ text, startOffset, endOffset, viewportRect: rect, clientRects: rects, relativeTop });
  }, [highlights]);

  // Clear selection when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('[data-toolbar]') ||
        target.closest('[data-note-input]') ||
        (containerRef.current && containerRef.current.contains(target))
      ) {
        return;
      }
      setSelection(null);
      setActiveNoteId(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle highlight
  const toggleHighlight = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selection) return;

    if (overlappingHighlights.length > 0) {
      // Remove overlapping highlights
      const overlappingIds = new Set(overlappingHighlights.map(h => h.id));
      const newHighlights = highlights.filter(h => !overlappingIds.has(h.id));
      setHighlights(newHighlights);
      localStorage.setItem(`highlights-${chapterSlug}`, JSON.stringify(newHighlights));
    } else {
      // Add new highlight
      const newHighlight: Highlight = {
        id: Date.now().toString(),
        startOffset: selection.startOffset,
        endOffset: selection.endOffset,
        text: selection.text,
      };
      const newHighlights = [...highlights, newHighlight];
      setHighlights(newHighlights);
      localStorage.setItem(`highlights-${chapterSlug}`, JSON.stringify(newHighlights));
    }

    window.getSelection()?.removeAllRanges();
    setSelection(null);
  };

  // Add inline note
  const addInlineNote = () => {
    if (!selection || !newNoteText.trim()) return;

    const note: InlineNote = {
      id: Date.now().toString(),
      selectedText: selection.text,
      startOffset: selection.startOffset,
      endOffset: selection.endOffset,
      text: newNoteText.trim(),
      timestamp: Date.now(),
    };

    const newNotes = [...notes, note];
    setNotes(newNotes);
    localStorage.setItem(`inline-notes-${chapterSlug}`, JSON.stringify(newNotes));
    setNewNoteText('');
    setActiveNoteId(null);
    window.getSelection()?.removeAllRanges();
    setSelection(null);
  };

  // Delete note
  const deleteNote = (id: string) => {
    const newNotes = notes.filter(n => n.id !== id);
    setNotes(newNotes);
    localStorage.setItem(`inline-notes-${chapterSlug}`, JSON.stringify(newNotes));
  };

  // Scroll to text when clicking note
  const scrollToNoteText = (note: InlineNote) => {
    if (!containerRef.current) return;

    if (typeof note.startOffset === 'number') {
      const pos = findNodeAtOffset(containerRef.current, note.startOffset);
      if (pos) {
        const range = document.createRange();
        range.setStart(pos.node, pos.offset);
        const endPos = findNodeAtOffset(containerRef.current, note.endOffset);
        if (endPos) {
          range.setEnd(endPos.node, endPos.offset);
        } else {
          range.setEnd(pos.node, Math.min(pos.offset + 30, pos.node.length));
        }

        const rect = range.getBoundingClientRect();
        window.scrollTo({
          top: window.scrollY + rect.top - 150,
          behavior: 'smooth'
        });

        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
        setTimeout(() => sel?.removeAllRanges(), 1500);
      }
    }
  };

  // Get positioned and orphaned notes
  const positionedNotes = notes.filter(note => {
    const pos = notePositions.find(p => p.id === note.id);
    return pos?.found;
  });

  const orphanedNotes = notes.filter(note => {
    const pos = notePositions.find(p => p.id === note.id);
    return pos && !pos.found;
  });

  // Handle double-click to select word
  const handleDoubleClick = useCallback(() => {
    setTimeout(() => handleMouseUp(), 10);
  }, [handleMouseUp]);

  return (
    <div ref={wrapperRef} className={`relative ${devBorder('violet')}`}>
      {/* Visual selection highlight */}
      {selection && selection.clientRects && selection.clientRects.map((rect, i) => (
        <div
          key={i}
          className="fixed pointer-events-none"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            backgroundColor: 'rgba(59, 130, 246, 0.3)',
            zIndex: 40,
          }}
        />
      ))}

      {/* Selection Toolbar */}
      {selection && selection.viewportRect && (
        <div
          data-toolbar
          className="fixed z-50 rounded-lg shadow-xl p-2 select-none"
          style={{
            top: selection.viewportRect.top - 80,
            left: Math.max(10, selection.viewportRect.left + selection.viewportRect.width / 2 - 100),
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <p className="text-xs mb-2 max-w-[200px] truncate italic" style={{ color: 'var(--muted-text)' }}>
            &ldquo;{selection.text.slice(0, 40)}{selection.text.length > 40 ? '...' : ''}&rdquo;
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              tabIndex={-1}
              onMouseDown={toggleHighlight}
              className={`p-2 rounded cursor-pointer ${
                overlappingHighlights.length > 0
                  ? 'bg-yellow-300 text-yellow-800'
                  : 'hover:bg-yellow-100 text-gray-600'
              }`}
              title={overlappingHighlights.length > 0 ? 'Remove highlight' : 'Highlight'}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
              </svg>
            </button>
            {/* Notes feature disabled - uncomment to re-enable
            <button
              type="button"
              tabIndex={-1}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveNoteId('new');
              }}
              className="p-2 rounded hover:bg-blue-100 text-gray-600 cursor-pointer"
              title="Add note"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            */}
          </div>
        </div>
      )}

      {/* Notes feature disabled - uncomment to re-enable
      {activeNoteId === 'new' && selection && selection.viewportRect && (
        <div
          data-note-input
          className="fixed z-50 rounded-lg shadow-xl p-3 w-64"
          style={{
            top: selection.viewportRect.bottom + 10,
            left: selection.viewportRect.left,
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
          }}
        >
          <p className="text-xs mb-2 italic truncate" style={{ color: 'var(--muted-text)' }}>
            &ldquo;{selection.text.slice(0, 50)}{selection.text.length > 50 ? '...' : ''}&rdquo;
          </p>
          <textarea
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            placeholder="Add your note..."
            className="w-full p-2 text-sm rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--foreground)' }}
            rows={3}
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => {
                setActiveNoteId(null);
                setNewNoteText('');
              }}
              className="px-3 py-1 text-sm rounded cursor-pointer"
              style={{ color: 'var(--muted-text)' }}
            >
              Cancel
            </button>
            <button
              onClick={addInlineNote}
              disabled={!newNoteText.trim()}
              className="px-3 py-1 text-sm text-white rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              style={{ backgroundColor: 'var(--berkeley-blue)' }}
            >
              Save
            </button>
          </div>
        </div>
      )}
      */}

      {/* Content with notes in flex layout */}
      <div className={`flex gap-6 ${devBorder('slate')}`}>
        <article
          ref={containerRef}
          className={`chapter-content flex-1 max-w-prose ${devBorder('amber')}`}
          onMouseUp={handleMouseUp}
          onDoubleClick={handleDoubleClick}
        />{/* Content set via ref in useEffect to prevent React from resetting it */}

        {/* Notes Margin - disabled, uncomment to re-enable
        <div className={`w-48 flex-shrink-0 relative ${devBorder('lime')}`}>
          <button
            onClick={toggleNotesPanel}
            className="text-xs underline mb-2 cursor-pointer"
            style={{ color: 'var(--muted-text)' }}
          >
            {notesCollapsed ? 'Show notes' : 'Hide notes'}
          </button>

          {!notesCollapsed && notes.length > 0 && (
            <>
                {positionedNotes.map((note) => {
                  const position = notePositions.find(p => p.id === note.id);
                  if (!position) return null;

                  const isHovered = hoveredNoteId === note.id;

                  return (
                    <div
                      key={note.id}
                      className={`absolute left-0 right-0 bg-yellow-50 border-l-2 rounded-r-lg p-3 text-xs shadow-sm group hover:shadow-md cursor-pointer overflow-hidden ${
                        isHovered ? 'border-blue-500 bg-blue-50' : 'border-yellow-400'
                      }`}
                      style={{ top: position.top }}
                      onMouseEnter={() => setHoveredNoteId(note.id)}
                      onMouseLeave={() => setHoveredNoteId(null)}
                      onClick={() => scrollToNoteText(note)}
                    >
                      {note.selectedText && (
                        <p className="text-gray-500 text-[10px] italic mb-1 truncate">
                          &ldquo;{note.selectedText.slice(0, 30)}{note.selectedText.length > 30 ? '...' : ''}&rdquo;
                        </p>
                      )}
                      <p className="text-gray-700 break-words">{note.text}</p>
                      <p className="text-gray-400 mt-2 text-[10px]">
                        {new Date(note.timestamp).toLocaleDateString()}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNote(note.id);
                        }}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}

                {orphanedNotes.length > 0 && (
                  <div className="mt-8 pt-4 border-t border-gray-200" style={{ marginTop: Math.max(...notePositions.filter(p => p.found).map(p => p.top), 0) + 120 }}>
                    <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Text not found
                    </p>
                    {orphanedNotes.map((note) => (
                      <div
                        key={note.id}
                        className="relative bg-gray-50 border-l-2 border-gray-300 rounded-r-lg p-3 text-xs shadow-sm group hover:shadow-md mb-2 overflow-hidden"
                      >
                        {note.selectedText && (
                          <p className="text-gray-400 text-[10px] italic mb-1 truncate line-through">
                            &ldquo;{note.selectedText.slice(0, 30)}{note.selectedText.length > 30 ? '...' : ''}&rdquo;
                          </p>
                        )}
                        <p className="text-gray-600 break-words">{note.text}</p>
                        <p className="text-gray-400 mt-2 text-[10px]">
                          {new Date(note.timestamp).toLocaleDateString()}
                        </p>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
            </>
          )}
        </div>
        */}
      </div>
    </div>
  );
}
