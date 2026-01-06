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
