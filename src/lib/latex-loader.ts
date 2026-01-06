import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

export interface Chapter {
  html: string;
  title: string;
  slug: string;
}

export interface ChapterInfo {
  slug: string;
  title: string;
  chapterNumber: number;
}

export interface Section {
  name: string;
  chapters: ChapterInfo[];
}

interface ChaptersConfig {
  sections: {
    name: string;
    chapters: string[];
  }[];
}

// Get the HTML content directory
function getHtmlDir(): string {
  return path.join(process.cwd(), 'content', 'html');
}

// Load a chapter from pre-built HTML
export async function loadChapter(slug: string): Promise<Chapter | null> {
  const htmlPath = path.join(getHtmlDir(), `${slug}.html`);

  try {
    const html = await fs.readFile(htmlPath, 'utf-8');

    // Extract title from first h1
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
    const title = titleMatch?.[1] || slug.replace(/-/g, ' ');

    return {
      html,
      title,
      slug,
    };
  } catch (error) {
    console.error(`Failed to load chapter: ${slug}`, error);
    return null;
  }
}

// Get list of available chapter slugs
export async function getChapterList(): Promise<string[]> {
  const htmlDir = getHtmlDir();

  try {
    const files = await fs.readdir(htmlDir);
    return files
      .filter(f => f.endsWith('.html') && !f.startsWith('.'))
      .map(f => f.replace('.html', ''));
  } catch (error) {
    console.error('Failed to read HTML directory', error);
    return [];
  }
}

// Get all chapters with titles (for sidebar) - flat list
export async function getAllChaptersWithTitles(): Promise<{ slug: string; title: string }[]> {
  const slugs = await getChapterList();
  const chapters = await Promise.all(
    slugs.map(async (slug) => {
      const chapter = await loadChapter(slug);
      return {
        slug,
        title: chapter?.title || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      };
    })
  );
  return chapters;
}

// Load chapters config from YAML
async function loadChaptersConfig(): Promise<ChaptersConfig | null> {
  const configPath = path.join(process.cwd(), 'content', 'chapters.yaml');
  try {
    const content = await fs.readFile(configPath, 'utf-8');
    return yaml.load(content) as ChaptersConfig;
  } catch (error) {
    console.error('Failed to load chapters.yaml config', error);
    return null;
  }
}

// Get chapters organized by sections (for sidebar)
export async function getChaptersBySection(): Promise<Section[]> {
  const config = await loadChaptersConfig();

  if (!config) {
    // Fallback to flat list if config not found
    const chapters = await getAllChaptersWithTitles();
    return [{
      name: 'Chapters',
      chapters: chapters.map((ch, idx) => ({
        ...ch,
        chapterNumber: idx + 1,
      })),
    }];
  }

  let chapterNumber = 1;
  const sections: Section[] = [];

  for (const section of config.sections) {
    const sectionChapters: ChapterInfo[] = [];

    for (const slug of section.chapters) {
      const chapter = await loadChapter(slug);
      sectionChapters.push({
        slug,
        title: chapter?.title || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        chapterNumber: chapterNumber++,
      });
    }

    sections.push({
      name: section.name,
      chapters: sectionChapters,
    });
  }

  return sections;
}

// Get flat list of all chapter slugs from config (for static generation)
export async function getOrderedChapterSlugs(): Promise<string[]> {
  const config = await loadChaptersConfig();

  if (!config) {
    return getChapterList();
  }

  return config.sections.flatMap(section => section.chapters);
}
