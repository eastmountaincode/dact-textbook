'use client';

import { useDevMode } from '@/providers/DevModeProvider';

interface ChapterContentProps {
  html: string;
  title: string;
}

export default function ChapterContent({ html, title }: ChapterContentProps) {
  const { devBorder } = useDevMode();

  return (
    <article className={`chapter-content ${devBorder('amber')}`}>
      <div
        className={`prose prose-lg max-w-none ${devBorder('lime')}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}
