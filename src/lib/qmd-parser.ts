import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';

// Pre-process QMD content to convert Quarto-specific syntax
function preprocessQmd(content: string): string {
  let result = content;

  // 1. Strip Quarto cross-reference anchors from headers: # Title {#sec-name} -> # Title
  result = result.replace(/^(#{1,6}\s+.+?)\s*\{#[^}]+\}\s*$/gm, '$1');

  // 2. Strip Quarto figure/image attributes: ![caption](path){#fig-name .class width="50%"}
  result = result.replace(/(\!\[[^\]]*\]\([^)]+\))\{[^}]+\}/g, '$1');

  // 3. Handle callouts with ## Title on next line (with optional attributes like icon=false)
  // ::: {.callout-note icon=false}
  // ## Question
  // Content
  // :::
  result = result.replace(
    /^:::\s*\{\.callout-(\w+)[^}]*\}\s*\n##\s*(.+)$/gm,
    (_, type, title) => {
      // Map common callout types to semantic classes
      const titleLower = title.toLowerCase().trim();
      if (titleLower === 'question') {
        return '<div class="qmd-question">';
      } else if (titleLower === 'answer') {
        return '<div class="qmd-answer">';
      }
      return `<div class="callout callout-${type}" data-title="${title}">`;
    }
  );

  // 4. Handle callouts with inline title or attributes: ::: {.callout-note title="..." icon=false}
  result = result.replace(
    /^:::\s*\{\.callout-(\w+)(?:[^}]*)?\}\s*$/gm,
    (match, type) => {
      // Extract title if present
      const titleMatch = match.match(/title="([^"]*)"/);
      const title = titleMatch ? titleMatch[1] : '';
      return `<div class="callout callout-${type}" data-title="${title}">`;
    }
  );

  // 5. Handle ANY Quarto div: ::: {.classname} or ::: {.class-name}
  // Catches .question, .answer, .definition, .importantbox, .theorem, .proof, etc.
  result = result.replace(
    /^:::\s*\{\.([a-zA-Z][a-zA-Z0-9_-]*)[^}]*\}\s*$/gm,
    '<div class="qmd-$1">'
  );

  // 6. Handle closing ::: (must be on its own line)
  // Add blank line after </div> to ensure markdown parser continues properly
  result = result.replace(/^:::\s*$/gm, '</div>\n');

  // 6b. Handle stray ::: that might have attributes but no class
  result = result.replace(/^:::\s+\S.*$/gm, '<div class="qmd-block">');

  // 9. Ensure proper spacing around HTML blocks for markdown parsing
  // Add blank lines before/after div blocks so markdown parser processes correctly
  result = result.replace(/(<\/div>)\n([^\n])/g, '$1\n\n$2');
  result = result.replace(/([^\n])\n(<div)/g, '$1\n\n$2');

  // 7. Strip Quarto-specific shortcodes like {{< video >}}
  result = result.replace(/\{\{<[^>]+>\}\}/g, '');

  // 8. Convert Quarto equation labels {#eq-name} at end of $$ blocks
  result = result.replace(/\$\$\s*\{#eq-[^}]+\}/g, '$$');

  return result;
}

export interface ParsedQmd {
  frontmatter: Record<string, unknown>;
  html: string;
  title: string;
}

export async function parseQmd(content: string): Promise<ParsedQmd> {
  // Extract frontmatter
  const { data: frontmatter, content: markdownContent } = matter(content);

  // Pre-process Quarto-specific syntax
  const preprocessed = preprocessQmd(markdownContent);

  // Parse markdown to HTML
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm) // GitHub Flavored Markdown (tables, etc.)
    .use(remarkMath) // Math support
    .use(remarkRehype, { allowDangerousHtml: true }) // Allow our custom HTML
    .use(rehypeKatex) // Render math with KaTeX
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(preprocessed);

  // Extract title from first h1 if not in frontmatter
  const html = String(file);
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
  const title = (frontmatter.title as string) || titleMatch?.[1] || 'Untitled';

  return {
    frontmatter,
    html,
    title,
  };
}

// Helper to read a QMD file from the content directory
export async function loadChapter(chapterSlug: string): Promise<ParsedQmd | null> {
  const fs = await import('fs/promises');
  const path = await import('path');

  // Path to the QMD content
  const contentPath = path.join(
    process.cwd(),
    '..',
    'untitled folder',
    'dafct',
    'chapters',
    chapterSlug,
    'index.qmd'
  );

  try {
    const content = await fs.readFile(contentPath, 'utf-8');
    return parseQmd(content);
  } catch (error) {
    console.error(`Failed to load chapter: ${chapterSlug}`, error);
    return null;
  }
}

// Get list of available chapters
export async function getChapterList(): Promise<string[]> {
  const fs = await import('fs/promises');
  const path = await import('path');

  const chaptersPath = path.join(
    process.cwd(),
    '..',
    'untitled folder',
    'dafct',
    'chapters'
  );

  try {
    const entries = await fs.readdir(chaptersPath, { withFileTypes: true });
    return entries
      .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
      .map(entry => entry.name);
  } catch (error) {
    console.error('Failed to read chapters directory', error);
    return [];
  }
}
