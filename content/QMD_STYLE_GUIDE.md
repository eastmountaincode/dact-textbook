# QMD Style Guide for Data Analytics Textbook

This style guide defines the consistent formatting standards for Quarto Markdown (QMD) files in this textbook. Use this document as context when converting LaTeX to QMD, or writing QMD in general.

---

## Callout System

The textbook uses four types of callouts, each with a specific purpose and color. All callouts use `icon=false` to hide the default icon.

### 1. Question (Blue) — `callout-note`

Use for questions posed to the reader, thought experiments, and conceptual prompts.

**Header:** Always `## Question`

```qmd
::: {.callout-note icon=false}
## Question
What is the ultimate goal of data analytics?
:::
```

**Usage notes:**
- Questions should prompt the reader to think before reading further
- Often paired with a collapsible Answer (see below)
- Do NOT use variations like "Key Question", "Conceptual Question", "Reflective Question", or "Thought Experiment" — always use just "Question"

---

### 2. Answer (Green, Collapsible) — `callout-tip`

Use for answers to questions, solutions, and explanatory content that students can reveal on demand.

**Header:** Always `## Answer`

**Attributes:** Always include `collapse="true"`

```qmd
::: {.callout-tip icon=false collapse="true"}
## Answer
While individual events may be unpredictable, the aggregate behavior of many random events often follows predictable patterns. This is the fundamental insight of probability theory.
:::
```

**Usage notes:**
- Always collapsed by default so students can attempt to answer before revealing
- Typically follows immediately after a Question callout

---

### 2b. Proof (Green, Collapsible) — `callout-tip`

Use for mathematical proofs that students can expand to see the derivation.

**Header:** Always `## Proof`

**Attributes:** Always include `collapse="true"`

```qmd
::: {.callout-tip icon=false collapse="true"}
## Proof
If $\mathrm{P}(X = r) = 1$, then $p_X(r) = 1$ and $p_X(x) = 0$ for all $x \neq r$. Therefore:

$$
\mathbb{E}[X] = \sum_x x p_X(x) = r \cdot 1 = r
$$
:::
```

**Usage notes:**
- Always collapsed by default so students can attempt the proof themselves first
- Typically follows a theorem, property, or claim that needs to be proven

---

### 3. Definition (Red) — `callout-important`

Use for formal definitions, key terminology, and fundamental concepts that students must understand.

**Header:** Always `## Definition` (singular, not "Definitions")

```qmd
::: {.callout-important icon=false}
## Definition

A **Type I error** occurs when we reject a hypothesis that is actually correct. We declare that something is happening when, in fact, it is not.

In medical testing: declaring a healthy patient is sick (false positive)
In criminal justice: convicting an innocent person
In scientific research: claiming we've found an effect when none exists
:::
```

**Usage notes:**
- Use for introducing new terminology with formal definitions
- Can contain multiple related terms in one callout (e.g., Population and Sample together)
- Bold the term being defined using `**term**`
- Do NOT use "Definitions" (plural) — always singular "Definition"

---

### 4. Warning/Caution (Orange) — `callout-warning`

Use for common misconceptions, important distinctions, cautions, and philosophical points.

**Header:** Flexible — use descriptive headers that fit the content

```qmd
::: {.callout-warning icon=false}
## Important Distinction
**Correlation does not imply causation.** Two variables can move together without one causing the other.
:::
```

```qmd
::: {.callout-warning icon=false}
## Common Misconception
The p-value is **not** "the probability that our results are wrong" or "the probability that the hypothesis is true."
:::
```

```qmd
::: {.callout-warning icon=false}
## Scientific Humility
In science, we can demonstrate that theories are *wrong* but we can never prove that theories are *correct*.
:::
```

**Common headers for warnings:**
- "Important Distinction"
- "Common Misconception"
- "Beware of [X]"
- Descriptive titles like "Scientific Humility"

---

## Quick Reference Table

| Callout Type | Color | Header | Attributes | Use Case |
|-------------|-------|--------|------------|----------|
| `callout-note` | Blue | `## Question` | `icon=false` | Questions, thought experiments |
| `callout-tip` | Green | `## Answer` or `## Proof` | `icon=false collapse="true"` | Answers to questions, mathematical proofs |
| `callout-important` | Red | `## Definition` | `icon=false` | Formal definitions, key terms |
| `callout-warning` | Orange | *varies* | `icon=false` | Misconceptions, cautions, distinctions |

---

## Attribute Formatting

Always use this exact attribute format:
- `icon=false` (no quotes around `false`)
- `collapse="true"` (quotes around `true`)

**Correct:**
```qmd
::: {.callout-tip icon=false collapse="true"}
```

**Incorrect:**
```qmd
::: {.callout-tip icon="false" collapse=true}
```

---

## Question/Answer Pairs

When presenting a question with an answer, always use this pattern:

```qmd
::: {.callout-note icon=false}
## Question
How can predictable patterns emerge from random individual events?
:::

::: {.callout-tip icon=false collapse="true"}
## Answer
While individual events may be unpredictable, the aggregate behavior of many random events often follows predictable patterns. This is the fundamental insight of probability theory—that randomness at the micro level produces regularity at the macro level.
:::
```

---

## Math Formatting

Use LaTeX math notation:
- Inline math: `$x + y$`
- Display math: `$$\mathbb{E}[X] = \sum_{i=1}^n x_i p_i$$`

---

## General QMD Formatting

### Headers
- Chapter title: `# Title`
- Major sections: `## Section`
- Subsections: `### Subsection`
- Callout titles: `## Title` (inside the callout block)

### Emphasis
- Bold for key terms being introduced: `**term**`
- Italics for emphasis or book titles: `*emphasis*`

### Lists
- Use `-` for unordered lists
- Use `1.` for ordered lists
- **Important:** Always include a blank line before any list. Without this blank line, the list will not render correctly.

**Correct:**
```qmd
Here are the key points:

- First item
- Second item
```

**Incorrect:**
```qmd
Here are the key points:
- First item
- Second item
```

### Block Quotes
```qmd
> *Two roads diverged in a wood, and I—*
> *I took the one less traveled by,*
```

### Tables

Use standard markdown table syntax with alignment indicators:

```qmd
| Value ($y$) | Deviation ($y - \mu$) | Squared Deviation ($y - \mu$)² |
|:-----------:|:---------------------:|:------------------------------:|
| 1 | -1 | 1 |
| 2 | 0 | 0 |
| 3 | 1 | 1 |
```

**Alignment:**
- `:---` for left-align
- `:---:` for center-align
- `---:` for right-align

**Usage notes:**
- Use center alignment (`:---:`) for numeric data
- LaTeX math can be used in table cells
- Always include a blank line before the table

---

## Code Blocks

This textbook uses pandoc for rendering (it does not use Quarto for rendering). Use standard pandoc fenced code block syntax.

### R Code

Use triple backticks with `r` language identifier:

```qmd
```r
# Load required packages
library(tidyverse)
library(plm)

# Fit model
model <- lm(y ~ x, data = df)
summary(model)
```
```

**Important:** Do NOT use Quarto-style code chunks like:

```qmd
```{r}
#| echo: true
#| eval: false
```
```

The `{r}` syntax with `#|` options is Quarto-specific and will not render correctly with pandoc.

### Output Blocks

For displaying R output (not executable code), use plain code fences without a language identifier:

```qmd
```
Coefficients:
              Estimate Std. Error t value Pr(>|t|)
(Intercept)   1.234     0.156      7.91   < 2e-16 ***
educ          0.108     0.008     13.50   < 2e-16 ***
```
```

### Python Code (with Auto-Execution)

Python code blocks are **automatically executed** during the build process. The preprocessing script runs each Python block in sequence, captures stdout, and inserts output blocks with special markers.

**Basic syntax:**

```qmd
```python
import numpy as np
np.random.seed(42)
print(f"Random number: {np.random.rand():.4f}")
```
```

**Important:** Do NOT use Quarto-style code chunks like `{python}` with `#|` options. Use plain ` ```python` syntax.

**How auto-execution works:**

1. The build process runs `preprocess-python-qmd.py` before pandoc conversion
2. Python blocks are executed in sequence (state is preserved between blocks in the same file)
3. Captured output is inserted after each block wrapped in special markers
4. When you rebuild, existing auto-generated output is removed and regenerated

**Auto-generated output markers:**

```qmd
```python
print("Hello, world!")
```

<!-- AUTO-OUTPUT-START -->
```
Hello, world!
```
<!-- AUTO-OUTPUT-END -->
```

**Never edit content between these markers** — it will be overwritten on the next build.

**Generating figures:**

Use `plt.savefig()` to save figures to a `figures/` subdirectory. The preprocessing script detects savefig calls and automatically adds image references:

```qmd
```python
import matplotlib.pyplot as plt
plt.figure(figsize=(8, 6))
plt.plot([1, 2, 3], [1, 4, 9])
plt.savefig('figures/my_plot.png', dpi=150, bbox_inches='tight')
plt.show()
```

<!-- AUTO-OUTPUT-START -->

![My Plot](figures/my_plot.png)
<!-- AUTO-OUTPUT-END -->
```

**Notes:**
- `plt.show()` is automatically made a no-op during build (figures won't block execution)
- Use `np.random.seed()` for reproducible random data
- Ensure required packages are installed (`pandas`, `numpy`, `matplotlib`, `scikit-learn`, etc.)

---

### Other Languages

For other languages, use the appropriate identifier:

- JavaScript: ` ```javascript`
- SQL: ` ```sql`
- Plain text/pseudocode: ` ``` ` (no identifier)

---

## Version History

- v1.4 — Added Python auto-execution documentation
- v1.3 — Added code block section for pandoc compatibility
- v1.2 — Added table formatting section
- v1.1 — Added Proof callout type (green, collapsible) for mathematical proofs
- v1.0 — Initial style guide based on intro-data-analytics chapter
