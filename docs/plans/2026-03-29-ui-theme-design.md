# Multi-Theme UI Design

**Goal:** Upgrade the current frontend from a single generic visual style to three clearly differentiated, switchable UI themes without changing product structure or business flows.

## Context

The current app already has a usable information architecture, but the visual system is flat and inconsistent. Most screens share the same card primitives, while page-level styling mixes local component CSS and a small global token layer. That makes the product functional but visually ordinary.

The app is well suited for a theme-system upgrade because:

- navigation and page structure are already stable
- most pages rely on shared card/button/form patterns
- a store already exists for light/dark mode, so theme persistence can be extended instead of rebuilt

## Chosen Direction

Build **three switchable visual themes inside the same app**:

1. **Soft Air**
   A light, calm, airy version with warm-white surfaces, soft gradients, and gentle shadows. This is the safest default and best baseline for the product.

2. **Glow Night**
   A dark, cinematic version with richer contrast, luminous accents, glassmorphism, and stronger ambient color fields. This gives the app a more immersive emotional feel.

3. **Playful Bloom**
   A brighter editorial/mobile-social version with bolder color blocks, stronger corner radii, pill controls, and more playful section contrast. This explores a younger, more expressive direction without becoming noisy.

## Why This Approach

This approach is better than creating separate demo pages because it keeps the comparison honest: the user can switch themes on the exact same screens and interactions. It also leaves behind a reusable design system instead of a one-off mockup.

## Scope

In scope:

- extend theme state from binary light/dark to a multi-theme system
- add a theme switcher control in the app shell
- centralize theme tokens in global CSS
- restyle the main app shell, top controls, bottom navigation, and shared card/button surfaces
- update the highest-visibility screens so the themes read clearly:
  - emotion
  - knowledge
  - treehole
  - profile

Out of scope:

- changing feature flows or backend behavior
- redesigning admin pages
- rewriting every single local component style in the project

## Architecture

### Theme Model

Use one HTML class for dark/light luminance and one data attribute for theme identity:

- `html.dark` remains responsible for dark luminance behavior
- `html[data-ui-theme="soft-air" | "glow-night" | "playful-bloom"]` controls visual identity

This keeps existing dark-sensitive logic working while enabling larger stylistic variation.

### Token Strategy

Move the visual system toward semantic tokens:

- shell background
- elevated surface
- muted surface
- accent gradient
- text hierarchy
- border strength
- shadow profile
- nav treatment

Existing component styles should read from these variables instead of hard-coded colors where practical.

### Shell Changes

The app shell will become more intentional:

- background atmosphere via layered gradients
- top controls treated as floating capsules
- bottom nav redesigned as a dock with active pill treatment
- optional app title/subtitle area near the top so the theme is visible immediately

### Page Changes

Key pages will get theme-aware hero/header blocks and refined section surfaces. The goal is not a layout rewrite, but stronger composition:

- emotion: stronger mood-selection hierarchy and more premium report presentation
- knowledge: featured quote and content tabs with clearer content cards
- treehole: more intimate composer panel and higher-contrast public feed
- profile: stronger identity card and settings/menu grouping

## Interaction

Theme switching should:

- be immediate
- persist in `localStorage`
- coexist with language switching
- preserve current route and state

## Risks

- Local component-scoped CSS may override theme tokens inconsistently.
- Some Element Plus controls may still look generic unless wrapped with project-level overrides.
- Expanding too far into every page could slow delivery; this design keeps the first pass focused.

## Validation

Success means:

- users can switch among three visibly distinct UI versions
- all main pages remain functional
- the app builds successfully
- the visual upgrade is obvious even without explaining it
