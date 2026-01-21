'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import katex from 'katex';
import Mark from 'mark.js';
import { useDevMode } from '@/providers/DevModeProvider';

interface ChapterContentProps {
  html: string;
  chapterSlug: string;
}

export default function ChapterContent({ html, chapterSlug }: ChapterContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const markInstanceRef = useRef<Mark | null>(null);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q');
  const occurrenceIndex = parseInt(searchParams.get('n') || '0', 10);
  const searchTimestamp = searchParams.get('t'); // Used to force re-run when navigating within same page
  const { devBorder } = useDevMode();
  const lastInitializedHtml = useRef<string>('');

  // Initialize content and apply KaTeX
  useEffect(() => {
    if (!containerRef.current) return;
    if (lastInitializedHtml.current === html) return;

    containerRef.current.innerHTML = html;
    lastInitializedHtml.current = html;

    const container = containerRef.current;

    // Process inline math with KaTeX
    const inlineMathSpans = container.querySelectorAll('span.math.inline');
    inlineMathSpans.forEach((span) => {
      const latex = span.textContent || '';
      try {
        span.innerHTML = katex.renderToString(latex, { displayMode: false, throwOnError: false });
      } catch (e) {
        console.error('KaTeX error:', e);
      }
    });

    // Process display math with KaTeX
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

  // Handle search query from URL - scroll to and highlight the specific match using mark.js
  useEffect(() => {
    if (!containerRef.current) return;

    // Create mark.js instance if needed
    if (!markInstanceRef.current) {
      markInstanceRef.current = new Mark(containerRef.current);
    }

    const markInstance = markInstanceRef.current;

    // Always unmark previous highlights first
    markInstance.unmark();

    if (!searchQuery) return;

    // Small delay to ensure content is rendered
    const timer = setTimeout(() => {
      if (!containerRef.current) return;

      // Determine search context based on URL hash
      // Since we only index body text (not headers), we search within the target section
      const hash = window.location.hash.slice(1);
      let searchContext: HTMLElement = containerRef.current;

      if (hash) {
        const hashElement = containerRef.current.querySelector(`#${CSS.escape(hash)}`);
        if (hashElement) {
          // Try to find a parent section element to narrow search context
          const parentSection = hashElement.closest('section');
          if (parentSection && containerRef.current.contains(parentSection)) {
            searchContext = parentSection as HTMLElement;
          }
          // If no section wrapper, search the whole document but that's fine
          // since we only index body text, not headers
        }
      }

      // Create a new Mark instance for the search context
      const contextMark = new Mark(searchContext);

      const targetIndex = occurrenceIndex;

      // Use mark.js to find and highlight the specific occurrence
      let currentMatch = 0;
      contextMark.mark(searchQuery, {
        separateWordSearch: false,
        caseSensitive: false,
        acrossElements: true,
        className: 'search-highlight',
        filter: () => {
          const isTarget = currentMatch === targetIndex;
          currentMatch++;
          return isTarget; // Only mark the target occurrence
        },
        each: (element: HTMLElement) => {
          // Expand any collapsed parent sections
          let parent = element.parentElement;
          while (parent && parent !== containerRef.current) {
            if (parent.classList.contains('callout-collapsed')) {
              parent.classList.remove('callout-collapsed');
            }
            parent = parent.parentElement;
          }

          element.style.backgroundColor = 'var(--highlight-bg, #fef08a)';
          element.style.color = 'var(--highlight-text, inherit)';
          element.style.padding = '0.1em 0.2em';
          element.style.borderRadius = '2px';

          requestAnimationFrame(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          });

          // Remove highlight after 5 seconds
          setTimeout(() => {
            contextMark.unmark();
          }, 5000);
        },
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, occurrenceIndex, searchTimestamp]);

  return (
    <article
      ref={containerRef}
      className={`chapter-content max-w-prose ${devBorder('amber')}`}
    />
  );
}
