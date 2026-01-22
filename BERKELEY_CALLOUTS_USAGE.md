# Berkeley Callout System - Usage Guide

## Overview
Six new callout categories have been added using official Berkeley brand colors. These work alongside the existing callout system.

---

## Available Callout Types

### 1. **Pedagogical / Interactive** (Medalist - Gold)
**Class:** `.callout-pedagogical`

Use for: Questions, Answers, Worked Examples

```qmd
::: {.callout-pedagogical}
## Question
What is the expected value of a fair six-sided die roll?
:::

::: {.callout-pedagogical collapse="true"}
## Answer
The expected value is 3.5. We calculate: E[X] = (1+2+3+4+5+6)/6 = 21/6 = 3.5
:::

::: {.callout-pedagogical}
## Worked Example
**Problem:** Calculate the variance of X where X ~ Uniform(0, 10)

**Step 1:** Find E[X] = (a+b)/2 = (0+10)/2 = 5
**Step 2:** Find E[X²] = (a²+ab+b²)/3 = (0+0+100)/3 = 33.33
**Step 3:** Var(X) = E[X²] - (E[X])² = 33.33 - 25 = 8.33
:::
```

---

### 2. **Foundational Concepts** (Berkeley Blue)
**Class:** `.callout-foundational`

Use for: Definitions, Theorems

```qmd
::: {.callout-foundational}
## Definition
The **sample space** is the set of all possible outcomes of an experiment. For a coin flip, the sample space is {H, T}.
:::

::: {.callout-foundational}
## Theorem
**Central Limit Theorem:** The distribution of sample means approaches a normal distribution as the sample size increases, regardless of the population's distribution.
:::
```

---

### 3. **Insights & Connections** (Sather Gate - Green)
**Class:** `.callout-insights`

Use for: Key Insights, Technical Notes

```qmd
::: {.callout-insights}
## Key Insight
Linearity of expectation works *regardless of whether variables are independent*. This remarkable property makes many complex calculations tractable.
:::

::: {.callout-insights}
## Technical Note
For advanced readers: The proof of unbiasedness relies on the linearity of the expectation operator and the fact that E[εᵢ] = 0 by assumption.
:::
```

---

### 4. **Motivation & Context** (Lawrence - Cyan)
**Class:** `.callout-motivation`

Use for: Why This Matters, Real-World Context

```qmd
::: {.callout-motivation}
## Why This Matters
Understanding sampling distributions is fundamental to all of inferential statistics. Every confidence interval, hypothesis test, and p-value depends on knowing how statistics behave across repeated samples.
:::
```

---

### 5. **Examples** (Bay Fog - Grey)
**Class:** `.callout-examples`

Use for: Examples, Case Studies, Thought Experiments

```qmd
::: {.callout-examples}
## Example: The Gambler's Fallacy
After flipping heads five times in a row, many people believe tails is "due." This reasoning is completely wrong! Each flip is independent with probability 0.5.
:::
```

---

### 6. **Cautions** (Rose Garden - Pink/Red)
**Class:** `.callout-cautions`

Use for: Common Mistakes, Warnings, Limitations

```qmd
::: {.callout-cautions}
## Caution
**Common Mistake:** Do not apply the Central Limit Theorem with sample sizes less than 30 unless the population is already normally distributed.
:::
```

---

## Quick Reference Table

| Class | Color | Typical Headers | Use For |
|-------|-------|----------------|---------|
| `.callout-pedagogical` | Gold | Question, Answer, Worked Example | Active learning |
| `.callout-foundational` | Blue | Definition, Theorem | Core concepts |
| `.callout-insights` | Green | Key Insight, Technical Note | Understanding |
| `.callout-motivation` | Cyan | Why This Matters | Context |
| `.callout-examples` | Grey | Example | Applications |
| `.callout-cautions` | Pink | Caution | Warnings |

---

## Existing Callouts (Still Available)

The original callout system is still fully functional:

- `.callout-note` - Blue (currently used for questions)
- `.callout-tip` - Green (currently used for answers with collapse)
- `.callout-important` - Red (currently used for definitions)
- `.callout-warning` - Orange (currently used for warnings)

---

## Design Details

- **Border:** 5px solid left border in category color
- **Background:** Subtle tinted background (8-12% opacity)
- **No icons:** Text labels only for accessibility
- **Typography:** EB Garamond, consistent with existing design
- **Dark mode:** Automatically adjusts for dark theme

---

## Notes

- All Berkeley colors are from the official UC Berkeley brand palette
- Collapsible behavior works with `collapse="true"` attribute
- Headers inside callouts use `## Title` syntax
- Colors are accessible and distinguish in grayscale
