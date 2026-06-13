# H5 UI Redesign Design

## Goal

Redesign the main H5 experience into a warmer, more polished emotional-care product. The design should feel calm, credible, and companionable, while keeping the existing product structure easy to implement in the current Vue/Vite app.

## Current Problems

The app is functional, but the interface feels visually inconsistent:

- The home mascot takes too much first-screen attention and pushes task entry points down.
- The six-item bottom navigation is crowded on a 390px mobile viewport.
- Cards, glass surfaces, gradients, rounded corners, and Element Plus controls use different visual languages.
- The emotional check-in flow feels like a collection of components instead of one guided daily ritual.
- Empty content states on Treehole and Knowledge feel generic and less trustworthy than the product domain requires.

## Chosen Direction

Use a restrained emotional-care style: soft but not sugary, friendly but not childish, and polished enough for a mental-health product.

This direction keeps the existing healing identity but reduces decorative noise. The mascot becomes a small companion signal, not the main layout engine. Core actions become clearer and component hierarchy becomes calmer.

## Visual System

### Personality

- Calm
- Trustworthy
- Gentle
- Focused
- Lightly companionable

### Color

Use warm off-white as the base, with muted rose, sage green, soft coral, and a small amount of blue for informative states.

Suggested palette:

- App background: `#F8F3EC`
- Primary text: `#28232A`
- Secondary text: `#726B73`
- Muted text: `#A099A3`
- Surface: `#FFFDFC`
- Soft surface: `#F4ECE7`
- Primary rose: `#D95E76`
- Sage: `#6FAF8B`
- Coral: `#F39A74`
- Calm blue: `#6E9DD8`
- Border: `rgba(68, 54, 60, 0.10)`

### Shape and Density

- Page-level cards: 18-22px radius.
- Small controls and chips: 12-16px radius.
- Bottom navigation: dock-like 24px radius, but with five items only.
- Avoid excessive nested cards and large glowing backgrounds.
- Use 16px page gutters and 12-16px component gaps.

### Typography

Use system fonts already in the app. Make hierarchy more deliberate:

- Page title: 24-28px, 700 weight.
- Section title: 17-20px, 700 weight.
- Body: 14-15px.
- Metadata and helper text: 12-13px.

Do not scale type with viewport width.

## Navigation

Change the primary mobile navigation from six items to five:

- Home
- Emotion
- Mindfulness
- Treehole
- Knowledge

Move Profile into a small top-right avatar/settings entry. This frees bottom-nav width and makes each tab easier to scan.

The top utility controls should become:

- Avatar/profile button
- Language toggle
- Theme toggle

Share should not be a persistent top-level control. It can live inside the home page if needed.

## Screen Designs

### 1. Home

The home screen becomes a daily care dashboard.

First screen hierarchy:

1. Greeting and date
2. Small mascot companion badge
3. Primary daily check-in card
4. Three action shortcuts
5. Gentle progress/streak module

The mascot should be retained but reduced to a 64-88px companion badge. The main focus should be "how are you today?" and the fastest path to recording or regulating emotion.

### 2. Emotion Check-In

The emotion screen becomes a guided daily check-in instead of a generic form.

Structure:

1. Header with current day and status.
2. Mood selector as five evenly sized options.
3. Energy and sleep controls in one quiet panel.
4. Micro-journal field for the bright moment.
5. One clear primary submit button.
6. Weekly report entry below the main form.

Stress sources and social preference remain conditional for negative moods. They should appear as secondary chips under the mood section, not as a visually separate form island.

### 3. Mindfulness

The mindfulness screen becomes a practice player.

Structure:

1. Large active session panel with duration, title, and play/pause action.
2. Duration segmented control.
3. Voice and background volume sliders.
4. Breathing card as a secondary practice entry.
5. Mini-game row as compact stress relief tools.

The page should feel like "start now" rather than "configure many settings."

### 4. Treehole

The Treehole screen becomes a safe writing surface.

Structure:

1. Private composer styled like a soft letter panel.
2. Clear anonymous/public toggle group.
3. Voice and image tools as compact icon buttons.
4. Primary send button.
5. Public square feed with gentle empty state and future entry card pattern.

Risk alerts and AI replies should keep a more sober style than the current gradient cards.

### 5. Knowledge

The Knowledge screen becomes a clean content hub.

Structure:

1. Daily quote as a compact editorial card.
2. Segmented tabs for Video, Test, Article, Topic.
3. Featured content card for the selected tab.
4. Secondary list/cards for additional content.
5. Empty states that explain what will appear, without feeling like system placeholders.

The page should feel useful even when backend content is unavailable.

## Pencil Deliverable

Create one Pencil document with five mobile artboards at 390px wide:

- `01 Home`
- `02 Emotion Check-In`
- `03 Mindfulness`
- `04 Treehole`
- `05 Knowledge`

Each artboard should include:

- Top utility controls
- Main content for the screen
- Five-item bottom navigation
- Light theme visual styling
- Enough real Chinese UI copy to judge hierarchy and spacing

## Implementation Notes

The front-end implementation should stay close to the existing Vue structure:

- `frontend/src/App.vue` for shell, top controls, and bottom nav.
- `frontend/src/styles/global.css` for tokens and shared components.
- `frontend/src/views/home/HomeView.vue`
- `frontend/src/views/emotion/EmotionView.vue`
- `frontend/src/views/mindfulness/MindfulnessView.vue`
- `frontend/src/views/treehole/TreeholeView.vue`
- `frontend/src/views/knowledge/KnowledgeView.vue`

Use existing Element Plus and Element Plus icons where possible, but style wrappers consistently so controls do not feel generic.

## Validation

The redesign is successful when:

- The app has an obvious design point of view within the first screen.
- Primary actions are clearer than decorative elements.
- The bottom navigation is readable on a 390px viewport.
- The five Pencil screens feel like one coherent product.
- The eventual Vue implementation builds successfully.
