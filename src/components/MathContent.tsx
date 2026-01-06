'use client';

import { useEffect, useRef } from 'react';
import katex from 'katex';
import { useDevMode } from '@/providers/DevModeProvider';

interface MathContentProps {
  html: string;
}

export default function MathContent({ html }: MathContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { devBorder } = useDevMode();

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Find all math spans from Pandoc output and render them with KaTeX
    // Pandoc outputs: <span class="math inline">LATEX</span> and <span class="math display">LATEX</span>

    const inlineMathSpans = container.querySelectorAll('span.math.inline');
    inlineMathSpans.forEach((span) => {
      const latex = span.textContent || '';
      try {
        span.innerHTML = katex.renderToString(latex, {
          displayMode: false,
          throwOnError: false,
        });
        span.classList.add('katex-rendered');
      } catch (e) {
        console.error('KaTeX inline error:', e, latex);
      }
    });

    const displayMathSpans = container.querySelectorAll('span.math.display');
    displayMathSpans.forEach((span) => {
      const latex = span.textContent || '';
      try {
        span.innerHTML = katex.renderToString(latex, {
          displayMode: true,
          throwOnError: false,
        });
        span.classList.add('katex-rendered');
      } catch (e) {
        console.error('KaTeX display error:', e, latex);
      }
    });
  }, [html]);

  return (
    <article
      ref={containerRef}
      className={`chapter-content ${devBorder('indigo')}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
