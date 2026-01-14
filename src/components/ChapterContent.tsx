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
  useEffect(() => {
    if (!searchQuery || !containerRef.current) return;

    const timer = setTimeout(() => {
      if (!containerRef.current) return;

      // Check if there's a hash/anchor to narrow down the search area
      const hash = window.location.hash.slice(1);
      let searchContainer: HTMLElement = containerRef.current;

      if (hash) {
        const targetElement = document.getElementById(hash);
        if (targetElement) {
          const section = targetElement.closest('section') ||
                         targetElement.closest('article') ||
                         targetElement.parentElement;
          if (section && containerRef.current.contains(section)) {
            searchContainer = section as HTMLElement;
          }
        }
      }

      const walker = document.createTreeWalker(
        searchContainer,
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

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <article
      ref={containerRef}
      className={`chapter-content max-w-prose ${devBorder('amber')}`}
    />
  );
}
