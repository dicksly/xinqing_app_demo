# Healing Fruit Home Design

**Goal:** Add a dedicated home tab inspired by the provided references and restyle the full user-facing app into a unified "healing fruit" product language.

## Product Intent

The app currently has functional modules, but no clear front door. The new home screen should provide that front door: a warm, branded landing view that makes the product feel more intentional before users enter a specific tool.

The visual direction should combine:

- the centered mascot/badge composition from reference image 1
- the soft pink-white card language and mobile-product polish from reference image 2

The result should feel gentle, youthful, and emotionally safe rather than generic.

## Chosen Direction

Use a **healing fruit system**:

- warm ivory and blush background
- coral-pink as the main accent
- fresh green as a secondary healing accent
- oversized rounded cards
- soft shadows and low-contrast surfaces
- centered welcoming home composition

This preserves the emotional identity of "疗愈站" while borrowing the product quality of the second reference.

## Information Architecture

Add a new `Home` tab as the first item in bottom navigation.

Bottom tab order:

1. Home
2. Emotion
3. Mindfulness
4. Treehole
5. Knowledge
6. Profile

The home screen acts as an overview and launcher. It does not replace the existing pages; it introduces them.

## Home Screen Structure

### Top Area

- small floating action buttons on the top-right, visually similar to the references
- no back button, because this is the app entry

### Hero

- centered mascot-like fruit badge
- title: product name
- short healing tagline
- soft decorative gradient background

### Primary Actions

Four large feature cards:

- 状态记录
- 正念练习
- 树洞倾诉
- 心理知识

Each card includes:

- circular icon
- strong title
- short description
- tap target large enough for mobile

### Secondary Section

One or two small support cards below, such as:

- 今日一句
- 陪伴提示 / 连续打卡信息

This keeps the page from feeling empty without overbuilding.

## Global Visual Language

Apply the same design language to all user-facing pages:

- lighter background
- stronger corner radii
- soft card elevation
- fruit/petal accent gradients
- cleaner title hierarchy
- gentler form controls

The app should read as one product system, not a pretty home page plus older inner pages.

## Theme Decision

Collapse the current multi-theme exploration into one primary theme for now. The chosen theme is the new default visual system. Light/dark toggling can remain if technically convenient, but the main design target is the soft, light fruit theme.

## Risks

- Six bottom tabs may become tight on narrow screens, so icon/label sizing must be carefully tuned.
- Existing page-level scoped CSS may preserve older visual assumptions.
- Overdecorating the home page could reduce clarity; keep the layout simple.

## Validation

Success means:

- app opens to the new home page
- home is the first bottom tab
- all user-facing pages share the new visual language
- the build succeeds
