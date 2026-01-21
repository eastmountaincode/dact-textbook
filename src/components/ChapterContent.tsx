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

  // Handle search query from URL - highlight ALL occurrences of the search term
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

      // Highlight ALL occurrences of the search term
      markInstance.mark(searchQuery, {
        separateWordSearch: false,
        caseSensitive: false,
        acrossElements: true,
        className: 'search-highlight',
        each: (element: HTMLElement) => {
          element.style.backgroundColor = 'var(--highlight-bg, #fef08a)';
          element.style.color = 'var(--highlight-text, inherit)';
          element.style.padding = '0.1em 0.2em';
          element.style.borderRadius = '2px';

          // Expand any collapsed parent sections
          let parent = element.parentElement;
          while (parent && parent !== containerRef.current) {
            if (parent.classList.contains('callout-collapsed')) {
              parent.classList.remove('callout-collapsed');
            }
            parent = parent.parentElement;
          }
        },
        done: () => {
          // After highlighting, scroll to the section anchor if present
          const hash = window.location.hash;
          if (hash) {
            const targetElement = document.querySelector(hash);
            if (targetElement) {
              requestAnimationFrame(() => {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
              });
            }
          }

          // Remove highlights after 10 seconds
          setTimeout(() => {
            markInstance.unmark();
          }, 10000);
        },
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, searchTimestamp]);

  return (
    <article
      ref={containerRef}
      className={`chapter-content max-w-prose ${devBorder('amber')}`}
    />
  );
}
