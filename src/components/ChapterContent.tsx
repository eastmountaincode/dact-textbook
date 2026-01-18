'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import katex from 'katex';
import { useDevMode } from '@/providers/DevModeProvider';

interface ChapterContentProps {
  html: string;
  chapterSlug: string;
}

export default function ChapterContent({ html, chapterSlug }: ChapterContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q');
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

  // Handle search query from URL - scroll to and highlight matching text
  const occurrenceIndex = parseInt(searchParams.get('n') || '0', 10);

  useEffect(() => {
    if (!searchQuery || !containerRef.current) return;

    const timer = setTimeout(() => {
      if (!containerRef.current) return;

      // Remove any previous search highlights
      containerRef.current.querySelectorAll('.search-highlight').forEach((el) => {
        const parent = el.parentNode;
        if (parent) {
          parent.replaceChild(document.createTextNode(el.textContent || ''), el);
          parent.normalize();
        }
      });

      // Search the entire document to find the nth occurrence
      const walker = document.createTreeWalker(
        containerRef.current,
        NodeFilter.SHOW_TEXT,
        null
      );

      let node: Text | null;
      const searchLower = searchQuery.toLowerCase();
      let currentOccurrence = 0;
      let foundMatch = false;

      while ((node = walker.nextNode() as Text | null)) {
        const nodeText = node.textContent || '';
        let searchIndex = 0;

        // Find all occurrences within this text node
        while (searchIndex < nodeText.length) {
          const index = nodeText.toLowerCase().indexOf(searchLower, searchIndex);
          if (index === -1) break;

          if (currentOccurrence === occurrenceIndex) {
            // Expand any collapsed parent sections before highlighting
            let parent = node.parentElement;
            while (parent && parent !== containerRef.current) {
              if (parent.classList.contains('callout-collapsed')) {
                parent.classList.remove('callout-collapsed');
              }
              parent = parent.parentElement;
            }

            // Create a highlight mark element
            const range = document.createRange();
            range.setStart(node, index);
            range.setEnd(node, index + searchQuery.length);

            const highlight = document.createElement('mark');
            highlight.className = 'search-highlight';
            highlight.style.backgroundColor = 'var(--highlight-bg, #fef08a)';
            highlight.style.color = 'var(--highlight-text, inherit)';
            highlight.style.padding = '0.1em 0.2em';
            highlight.style.borderRadius = '2px';
            highlight.style.boxShadow = '0 0 0 2px var(--highlight-bg, #fef08a)';

            try {
              range.surroundContents(highlight);
            } catch {
              // If surroundContents fails (crosses element boundaries), fall back to selection
              const sel = window.getSelection();
              sel?.removeAllRanges();
              sel?.addRange(range);
              setTimeout(() => sel?.removeAllRanges(), 2000);
            }

            // Wait a frame for layout to update after expanding, then scroll
            requestAnimationFrame(() => {
              const rect = highlight.getBoundingClientRect();
              window.scrollTo({
                top: window.scrollY + rect.top - 150,
                behavior: 'smooth'
              });
            });

            // Remove highlight after 3 seconds
            setTimeout(() => {
              if (highlight.parentNode) {
                const text = document.createTextNode(highlight.textContent || '');
                highlight.parentNode.replaceChild(text, highlight);
                text.parentNode?.normalize();
              }
            }, 3000);

            foundMatch = true;
            break;
          }

          currentOccurrence++;
          searchIndex = index + 1;
        }

        if (foundMatch) break;
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, occurrenceIndex]);

  return (
    <article
      ref={containerRef}
      className={`chapter-content max-w-prose ${devBorder('amber')}`}
    />
  );
}
