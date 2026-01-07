import { loadChapter, getOrderedChapterSlugs, getChaptersBySection, getChapterNavigation } from '@/lib/latex-loader';
import HighlightableContent from '@/components/HighlightableContent';
import ChapterNavigation from '@/components/ChapterNavigation';
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
  const [chapter, sections, navigation] = await Promise.all([
    loadChapter(slug),
    getChaptersBySection(),
    getChapterNavigation(slug),
  ]);

  if (!chapter) {
    notFound();
  }

  return (
    <TextbookLayout sections={sections} currentSlug={slug}>
      <HighlightableContent html={chapter.html} chapterSlug={slug} />
      <ChapterNavigation prev={navigation.prev} next={navigation.next} />
    </TextbookLayout>
  );
}
