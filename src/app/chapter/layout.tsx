import { getChaptersBySection } from '@/lib/chapter-loader';
import ChapterLayoutClient from '@/components/ChapterLayoutClient';

export default async function ChapterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Load sections once - this persists across chapter navigations
  const sections = await getChaptersBySection();

  return (
    <ChapterLayoutClient sections={sections}>
      {children}
    </ChapterLayoutClient>
  );
}
