# Claude Code Guidelines

## UI/UX

- Always use `cursor-pointer` on interactive elements (buttons, clickable icons, toggles, etc.)

## Dev Mode Borders

When creating or modifying components, add a dev border to help identify the component during development.

**How to use:**
1. Import the hook: `import { useDevMode } from '@/providers/DevModeProvider';`
2. Get the helper: `const { devBorder } = useDevMode();`
3. Add to root element: `className={`...existing-classes ${devBorder('color')}`}`

**Available colors:** red, blue, green, amber, purple, cyan, pink, violet, yellow, emerald, teal, orange, lime, indigo, rose, sky, fuchsia, slate

**Current component assignments:**

*TextbookLayout:*
- TextbookLayout root: `purple`
- Main content area: `green`

*Header:*
- Header root: `red`
- Logo/title area: `amber`
- Logo link: `emerald`
- Subtitle: `lime`
- Controls area: `cyan`
- Font settings button: `violet`
- Theme toggle button: `indigo`
- Account button: `rose`
- Font menu dropdown: `pink`

*Sidebar:*
- Sidebar root: `blue`
- Search box: `yellow`
- Search results: `emerald`
- Nav/section list: `cyan`
- Section items: `orange`
- Chapter list (ul): `teal`
- Individual chapter items: `violet`

*ChapterContent:*
- Article: `amber`
- Prose content: `lime`

*MathContent:*
- Article: `indigo`

*NotesPanel:*
- Panel root: `rose`
- Header: `pink`
- Notes list: `fuchsia`
- Add note area: `sky`

*HighlightableContent:*
- Wrapper: `violet`
- Content flex container: `slate`
- Article: `amber`
- Notes margin: `lime`

*Chapter Content Elements (auto-applied via CSS):*
- h1: red-600
- h2: orange-600
- h3: amber-600
- h4: yellow-600
- h5: lime-600
- p: green-600
- ul: teal-600
- ol: cyan-600
- li: sky-600
- table: blue-600
- th: indigo-600
- td: violet-600
- pre: purple-600
- code: fuchsia-600
- blockquote: pink-600
- figure: rose-600
- figcaption: slate-500
- img: orange-500
- .question/.qmd-question: red-700
- .answer/.qmd-answer: blue-700
- .definition/.qmd-definition: yellow-700
- .callout: emerald-600
- .callout-note: sky-600
- .callout-important: amber-600
- .callout-warning: red-600
- .theorem/.qmd-theorem: indigo-600
- .proof/.qmd-proof: violet-600
- .importantbox/.qmd-importantbox: slate-600
- .video-container: fuchsia-600
- .math-display: violet-500
- .katex-display: violet-400

**Toggle dev mode:** Press `b` key (when not focused on input/textarea)

When adding a new component, pick a unique color from the list and document it above.

## QMD Chapter File Format

All chapter content is written in QMD (Quarto Markdown) files located in the `chapters/` directory.

**Required format:**
- Each chapter must start with `# Title` on the first line (no YAML frontmatter)
- The title becomes the H1 heading and is used in the sidebar

**Example:**
```markdown
# Chapter Title Here

Content starts here...
```

## CSS Custom Properties (Design System)

The design system uses CSS custom properties defined in `src/app/globals.css`. Use these for consistent styling.

### Spacing Scale
| Variable | Value | Notes |
|----------|-------|-------|
| `--space-xs` | 0.25em | 4px at 16px base |
| `--space-sm` | 0.5em | 8px |
| `--space-md` | 1em | 16px |
| `--space-lg` | 1.5em | 24px |
| `--space-xl` | 2em | 32px |
| `--space-2xl` | 3em | 48px |

### Typography Scale
| Variable | Value |
|----------|-------|
| `--text-xs` | 0.8em |
| `--text-sm` | 0.9em |
| `--text-base` | 1em |
| `--text-lg` | 1.15em |
| `--text-xl` | 1.35em |
| `--text-2xl` | 1.75em |
| `--text-3xl` | 2.5em |

### Line Height
| Variable | Value |
|----------|-------|
| `--leading-tight` | 1.4 |
| `--leading-normal` | 1.7 |
| `--leading-relaxed` | 1.8 |

### Border Radius
| Variable | Value |
|----------|-------|
| `--radius-sm` | 4px |
| `--radius-md` | 8px |

### Colors
| Variable | Light Mode | Description |
|----------|------------|-------------|
| `--background` | #faf9f6 | Page background |
| `--foreground` | #1a1a1a | Main text color |
| `--berkeley-blue` | #003262 | Primary brand color |
| `--california-gold` | #FDB515 | Accent color |
| `--question-color` | #B71C1C | Q box accent |
| `--answer-color` | #0A3050 | A box accent |
| `--definition-color` | #B8860B | D box accent |
| `--muted-text` | #6b7280 | Secondary text |
| `--card-bg` | #ffffff | Card backgrounds |
| `--card-border` | #e5e7eb | Card borders |
| `--sidebar-bg` | #ffffff | Sidebar background |
| `--sidebar-border` | #e5e7eb | Sidebar border |
| `--sidebar-hover` | #f3f4f6 | Sidebar hover state |
| `--input-bg` | #ffffff | Input backgrounds |
| `--input-border` | #d1d5db | Input borders |
| `--code-bg` | #f3f4f6 | Inline code background |
| `--code-block-bg` | #1e1e1e | Code block background |

### Callout Colors
| Variable | Light Mode |
|----------|------------|
| `--callout-note-bg` | #e8f4f8 |
| `--callout-note-border` | #0ea5e9 |
| `--callout-important-bg` | #fef3c7 |
| `--callout-important-border` | #f59e0b |
| `--callout-warning-bg` | #fee2e2 |
| `--callout-warning-border` | #ef4444 |

All colors have dark mode equivalents that are automatically applied when `.dark` class is on the document.

Don't use transition effects unless I specifically ask for them.

Callout styles are in `src/app/callouts.css`.
