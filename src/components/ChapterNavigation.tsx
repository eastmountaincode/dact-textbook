import Link from 'next/link';
import { ChapterInfo } from '@/lib/latex-loader';

interface ChapterNavigationProps {
  prev: ChapterInfo | null;
  next: ChapterInfo | null;
}

export default function ChapterNavigation({ prev, next }: ChapterNavigationProps) {
  return (
    <nav className="flex justify-between mt-12 pt-8 border-t border-[var(--card-border)] gap-4 max-sm:flex-col">
      <div className="flex-1 max-w-[45%] max-sm:max-w-full">
        {prev && (
          <Link
            href={`/chapter/${prev.slug}`}
            className="flex flex-col p-4 border border-[var(--card-border)] rounded-lg no-underline text-[var(--foreground)] bg-[var(--card-bg)] hover:border-[var(--berkeley-blue)] hover:bg-[var(--sidebar-hover)]"
          >
            <span className="text-sm text-[var(--muted-text)] mb-1">Previous</span>
            <span className="font-semibold text-[var(--berkeley-blue)] leading-tight">{prev.title}</span>
          </Link>
        )}
      </div>
      <div className="flex-1 max-w-[45%] text-right max-sm:max-w-full max-sm:text-left">
        {next && (
          <Link
            href={`/chapter/${next.slug}`}
            className="flex flex-col p-4 border border-[var(--card-border)] rounded-lg no-underline text-[var(--foreground)] bg-[var(--card-bg)] hover:border-[var(--berkeley-blue)] hover:bg-[var(--sidebar-hover)] items-end max-sm:items-start"
          >
            <span className="text-sm text-[var(--muted-text)] mb-1">Next</span>
            <span className="font-semibold text-[var(--berkeley-blue)] leading-tight">{next.title}</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
