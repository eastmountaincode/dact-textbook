#!/usr/bin/env node
/**
 * Generate search index from HTML chapter files for Fuse.js full-text search
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const HTML_DIR = join(__dirname, '../content/html');
const OUTPUT_PATH = join(__dirname, '../public/search.json');

/**
 * Strip HTML tags and decode entities, returning plain text
 */
function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract ID from HTML tag (e.g., <h2 id="foo">)
 */
function extractId(tag) {
  const match = tag.match(/id="([^"]+)"/);
  return match ? match[1] : null;
}

/**
 * Extract text content from HTML tag
 */
function extractTagContent(tag) {
  const match = tag.match(/>([^<]*)</);
  return match ? stripHtml(match[1]) : '';
}

/**
 * Parse chapter HTML and extract searchable sections
 */
function parseChapter(html, slug) {
  const entries = [];

  // Extract chapter title from h1
  const h1Match = html.match(/<h1[^>]*id="([^"]*)"[^>]*>([^<]+)<\/h1>/);
  const chapterTitle = h1Match ? stripHtml(h1Match[2]) : slug.replace(/-/g, ' ');
  const chapterId = h1Match ? h1Match[1] : slug;

  // Split content by h2 sections
  const sections = html.split(/<h2[^>]*>/);

  // First section is content before any h2 (intro text)
  if (sections[0]) {
    const introText = stripHtml(sections[0]);
    if (introText.length > 50) {
      entries.push({
        objectID: `${slug}`,
        href: `/chapter/${slug}`,
        title: chapterTitle,
        section: '',
        text: introText.slice(0, 2000),
      });
    }
  }

  // Process each h2 section
  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];

    // Extract section ID and title
    // The section starts right after <h2...>, so we need to find the closing tag
    const closingH2Idx = section.indexOf('</h2>');
    if (closingH2Idx === -1) continue;

    const h2Content = section.slice(0, closingH2Idx);
    const afterH2 = section.slice(closingH2Idx + 5);

    // Try to extract ID from the h2 tag itself
    const h2IdMatch = html.match(new RegExp(`<h2[^>]*id="([^"]+)"[^>]*>${escapeRegex(h2Content.slice(0, 50))}`));
    let sectionId = h2IdMatch ? h2IdMatch[1] : null;

    // If h2 doesn't have an id, check if it's inside a section element with an id
    // We need to find THIS specific h2 occurrence, not just any h2 with similar content
    if (!sectionId) {
      let targetH2Pos = -1;

      // Count all h2s up to section i to find the position of the ith h2
      const allH2Pattern = /<h2[^>]*>/g;
      let matchNum = 0;
      let lastMatch;
      while ((lastMatch = allH2Pattern.exec(html)) !== null) {
        matchNum++;
        if (matchNum === i) {
          targetH2Pos = lastMatch.index;
          break;
        }
      }

      if (targetH2Pos !== -1) {
        // Look backwards from this h2 for a section tag with id
        const beforeH2 = html.slice(Math.max(0, targetH2Pos - 200), targetH2Pos);
        const sectionIdMatch = beforeH2.match(/<section[^>]*id="([^"]+)"[^>]*>\s*$/);
        if (sectionIdMatch) {
          sectionId = sectionIdMatch[1];
        }
      }
    }

    // Generate a fallback id if we still don't have one
    const finalId = sectionId || `section-${i}`;

    // Get section title
    const sectionTitle = stripHtml(h2Content);
    if (!sectionTitle) continue;

    // Get section content (text until next h2 or end)
    const sectionText = stripHtml(afterH2);
    if (sectionText.length < 20) continue;

    entries.push({
      objectID: `${slug}#${finalId}`,
      href: `/chapter/${slug}#${finalId}`,
      title: chapterTitle,
      section: sectionTitle,
      text: sectionText.slice(0, 2000),
    });
  }

  return entries;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function main() {
  console.log('Generating search index...');

  const files = await readdir(HTML_DIR);
  const htmlFiles = files.filter(f => f.endsWith('.html') && !f.startsWith('.'));

  const allEntries = [];

  for (const file of htmlFiles) {
    const slug = basename(file, '.html');
    const filePath = join(HTML_DIR, file);

    try {
      const html = await readFile(filePath, 'utf-8');
      const entries = parseChapter(html, slug);
      allEntries.push(...entries);
      console.log(`  ${slug}: ${entries.length} entries`);
    } catch (err) {
      console.error(`  Error processing ${file}:`, err.message);
    }
  }

  await writeFile(OUTPUT_PATH, JSON.stringify(allEntries, null, 2));
  console.log(`\nGenerated ${allEntries.length} search entries to ${OUTPUT_PATH}`);
}

main().catch(console.error);
