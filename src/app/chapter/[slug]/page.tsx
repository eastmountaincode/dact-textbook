import { loadChapter, getOrderedChapterSlugs, getChaptersBySection, getChapterNavigation } from '@/lib/chapter-loader';
import ChapterContent from '@/components/ChapterContent';
import ChapterNavigation from '@/components/ChapterNavigation';
import TextbookLayout from '@/components/TextbookLayout';
import GatedContent from '@/components/GatedContent';
import ReadingTimeTracker from '@/components/ReadingTimeTracker';
import { auth } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for all chapters
export async function generateStaticParams() {
  const slugs = await getOrderedChapterSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Check if a slug belongs to a preface section
function isPreface(sections: Awaited<ReturnType<typeof getChaptersBySection>>, slug: string): boolean {
  for (const section of sections) {
    if (section.isPreface) {
      if (section.chapters.some(ch => ch.slug === slug)) {
        return true;
      }
    }
  }
  return false;
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

  // Check if this is a preface page (always accessible)
  const isPrefacePage = isPreface(sections, slug);

  // Check authentication using Clerk (needed for gating and reading time tracking)
  const { userId } = await auth();
  const isAuthenticated = !!userId;

  // Show gated content for non-preface pages when not authenticated
  if (!isPrefacePage && !isAuthenticated) {
    return (
      <TextbookLayout sections={sections} currentSlug={slug}>
        <GatedContent chapterTitle={chapter.title} />
      </TextbookLayout>
    );
  }

  return (
    <TextbookLayout sections={sections} currentSlug={slug}>
      {isAuthenticated && <ReadingTimeTracker chapterSlug={slug} />}
      <ChapterContent html={chapter.html} chapterSlug={slug} />
      <ChapterNavigation prev={navigation.prev} next={navigation.next} />
    </TextbookLayout>
  );
}
