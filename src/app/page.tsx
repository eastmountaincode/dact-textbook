import { getChaptersBySection } from '@/lib/latex-loader';
import TextbookLayout from '@/components/TextbookLayout';

export default async function Home() {
  const sections = await getChaptersBySection();
  const totalChapters = sections.reduce((sum, s) => sum + s.chapters.length, 0);

  return (
    <TextbookLayout sections={sections}>
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--berkeley-blue)' }}>
          Data Analytics for Critical Thinkers
        </h1>
        <p className="text-xl mb-8" style={{ color: 'var(--muted-text)' }}>
          by Gautam Sethi & Noor Sethi
        </p>

        <div className="rounded-xl shadow-sm p-8 max-w-2xl mx-auto text-left" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Welcome</h2>
          <p className="mb-4" style={{ color: 'var(--muted-text)' }}>
            This interactive textbook covers the foundations of data analytics and statistical thinking.
            Select a chapter from the sidebar to begin reading.
          </p>
          <p style={{ color: 'var(--muted-text)' }}>
            Use the tools in the header to adjust font size and style to your preference.
            You can also take notes on any chapter using the notes panel.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
          <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--callout-note-bg)', border: '1px solid var(--callout-note-border)' }}>
            <p className="font-semibold" style={{ color: 'var(--berkeley-blue)' }}>{totalChapters}</p>
            <p className="text-sm" style={{ color: 'var(--callout-note-border)' }}>Chapters</p>
          </div>
          <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--callout-important-bg)', border: '1px solid var(--callout-important-border)' }}>
            <p className="font-semibold" style={{ color: 'var(--california-gold)' }}>Interactive</p>
            <p className="text-sm" style={{ color: 'var(--callout-important-border)' }}>Q&A Format</p>
          </div>
        </div>
      </div>
    </TextbookLayout>
  );
}
