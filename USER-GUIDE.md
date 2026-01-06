# Data Analytics for Critical Thinkers - Site Management Guide

This guide explains how to manage and update your textbook website.

## Table of Contents

1. [Important: Editing Workflow](#important-editing-workflow)
2. [Chapter Organization](#chapter-organization)
3. [Adding New Chapters](#adding-new-chapters)
4. [Reordering Chapters](#reordering-chapters)
5. [Creating New Sections](#creating-new-sections)
6. [Building the Site](#building-the-site)
7. [Common Tasks](#common-tasks)

---

## Important: Editing Workflow

**The QMD files are the source of truth for all content.** The HTML files in `content/html/` are generated output and will be overwritten when you rebuild.

### What to Edit Where

| Type of Change | Where to Edit |
|----------------|---------------|
| Text content, equations, images | QMD source files (`untitled folder/dafct/chapters/`) |
| Callouts (Key Question, Important Distinction, etc.) | QMD source files |
| Adding/restructuring sections | QMD source files |
| CSS styling (colors, fonts, spacing) | `src/app/globals.css` |
| Layout and components | Next.js files in `src/` |
| Navigation and sidebar | Next.js components |
| Chapter order and sections | `content/chapters.yaml` |

### Workflow for Content Changes

1. Edit the `.qmd` file in the source directory
2. Run the Pandoc build script to regenerate HTML
3. Refresh the site to see changes

**Never edit the HTML files directly** - those changes will be lost the next time you run the build script.

---

## Chapter Organization

Chapters are organized into **sections** (like "Theoretical Foundations", "Descriptive Statistics", etc.) using a configuration file.

### Configuration File Location

```
content/chapters.yaml
```

### Configuration Format

```yaml
sections:
  - name: "Theoretical Foundations"
    chapters:
      - intro-data-analytics
      - probability-distributions
      - parameters-statistics

  - name: "Descriptive Statistics"
    chapters:
      - data
      - summary-statistics
      - graphing
```

Each section has:
- `name`: The display name shown in the sidebar
- `chapters`: A list of chapter slugs (filenames without `.html`)

**Chapters are numbered sequentially across all sections** (1, 2, 3, ...) in the order they appear in this file.

---

## Adding New Chapters

### Step 1: Create the Chapter Content

1. Write your chapter as a Quarto (`.qmd`) file
2. Place it in your source chapters directory
3. Run the build script to convert it to HTML:

```bash
npm run build:content
```

This creates an HTML file in `content/html/` with the same name as your `.qmd` file.

### Step 2: Add to Configuration

Edit `content/chapters.yaml` and add your chapter slug to the appropriate section:

```yaml
sections:
  - name: "Descriptive Statistics"
    chapters:
      - data
      - summary-statistics
      - graphing
      - your-new-chapter    # Add here
```

### Step 3: Rebuild Search Index

```bash
npm run generate-search
```

This updates the search functionality to include your new chapter.

---

## Reordering Chapters

To change the order of chapters:

1. Open `content/chapters.yaml`
2. Move chapter slugs to their new positions
3. Save the file
4. Refresh the site (or rebuild for production)

**Example:** Moving "graphing" before "summary-statistics":

```yaml
# Before
chapters:
  - data
  - summary-statistics
  - graphing

# After
chapters:
  - data
  - graphing           # Moved up
  - summary-statistics
```

Chapter numbers update automatically based on position.

---

## Creating New Sections

To add a new section:

1. Open `content/chapters.yaml`
2. Add a new section block where you want it to appear:

```yaml
sections:
  - name: "Existing Section"
    chapters:
      - chapter-one

  - name: "My New Section"    # New section
    chapters:
      - new-chapter-one
      - new-chapter-two

  - name: "Another Existing Section"
    chapters:
      - another-chapter
```

Sections appear in the sidebar in the order listed in this file.

---

## Building the Site

### Development (Local Preview)

```bash
npm run dev
```

Opens at `http://localhost:3000`. Changes to chapters.yaml are reflected on page refresh.

### Production Build

```bash
npm run build
```

This runs:
1. `build:content` - Converts Quarto files to HTML
2. `generate-search` - Builds the search index
3. `next build` - Creates the production site

### Deploy

After building, deploy the contents of the `.next` folder to your hosting provider.

---

## Common Tasks

### Renaming a Section

Edit `content/chapters.yaml` and change the `name` field:

```yaml
- name: "New Section Name"  # Changed from "Old Section Name"
```

### Removing a Chapter

1. Remove the chapter slug from `content/chapters.yaml`
2. Optionally delete the HTML file from `content/html/`
3. Rebuild the search index: `npm run generate-search`

### Moving a Chapter to a Different Section

Cut the chapter slug from one section and paste it into another:

```yaml
sections:
  - name: "Section A"
    chapters:
      - chapter-one
      # chapter-two was here, now moved

  - name: "Section B"
    chapters:
      - chapter-three
      - chapter-two    # Moved from Section A
```

---

## File Structure Reference

```
nextjs-test/
├── content/
│   ├── chapters.yaml      # Chapter organization config
│   └── html/              # Built HTML chapter files
│       ├── intro-data-analytics.html
│       ├── probability-distributions.html
│       └── ...
├── public/
│   ├── search.json        # Search index (auto-generated)
│   └── assets/            # Images and figures
└── src/
    └── ...                # Application code
```

---

## Troubleshooting

### Chapter not appearing in sidebar
- Check that the slug in `chapters.yaml` matches the HTML filename exactly (without `.html`)
- Verify the HTML file exists in `content/html/`

### Search not finding new content
- Run `npm run generate-search` after adding/changing chapters

### Changes not showing
- In development: refresh the browser
- In production: rebuild with `npm run build`

---

## Quick Reference

| Task | Command |
|------|---------|
| Start dev server | `npm run dev` |
| Build for production | `npm run build` |
| Convert Quarto to HTML | `npm run build:content` |
| Rebuild search index | `npm run generate-search` |

| File | Purpose |
|------|---------|
| `content/chapters.yaml` | Chapter order and sections |
| `content/html/*.html` | Chapter content files |
| `public/search.json` | Search index |
