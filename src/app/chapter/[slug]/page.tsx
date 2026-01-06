import { loadChapter, getOrderedChapterSlugs, getChaptersBySection } from '@/lib/latex-loader';
import HighlightableContent from '@/components/HighlightableContent';
import TextbookLayout from '@/components/TextbookLayout';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for all chapters
export async function generateStaticParams() {
  const slugs = await getOrderedChapterSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function ChapterPage({ params }: PageProps) {
  const { slug } = await params;
  const [chapter, sections] = await Promise.all([
    loadChapter(slug),
    getChaptersBySection(),
  ]);

  if (!chapter) {
    notFound();
  }

  return (
    <TextbookLayout sections={sections} currentSlug={slug}>
      <HighlightableContent html={chapter.html} chapterSlug={slug} />
    </TextbookLayout>
  );
}
