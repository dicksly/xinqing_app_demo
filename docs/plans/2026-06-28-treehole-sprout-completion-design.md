# Treehole Interactions And Sprout Growth Completion Design

## Goal

Complete the two remaining product gaps from the current audit: cloud-backed treehole interactions and usable high-stage sprout companion systems.

## Approach

Treehole likes, comments, and replies become backend entities tied to a public treehole entry. The frontend keeps its existing local interaction state as a fallback, but it fetches and writes interaction data through API endpoints whenever the backend is available.

Sprout growth stays local-first because the existing companion state is stored in `xinqing_sprout_care_state`. High-stage milestone features become real operations: crafting supplies, friend visits, free layout, habitat BGM, square publishing, harvest/exchange, poster generation, weather update, panorama unlock, and annual report generation.

## Scope

- Add backend persistence for treehole likes, comments, and replies.
- Add frontend API methods and adapt `TreeHoleView.vue` to load and mutate remote interactions.
- Extend `sprout-care.js` with high-stage companion operations and tests.
- Surface the high-stage operations in `HomeView.vue` without changing the app's overall visual direction.

## Testing

- Backend API tests cover like toggling, comment creation, reply creation, and public interaction summary.
- Frontend utility tests cover sprout crafting, friend visit, layout/BGM, publishing, exchange, weather, panorama, and annual report behavior.
- Run focused test files first, then the broader frontend test suite and production build.
