# Fruit Slice Responsive Fix Design

## Goal

Make the embedded Fruit Slice game fully usable on production mobile viewports without changing its gameplay rules or visual identity.

## Confirmed Root Cause

The Element Plus game dialog is currently rendered inside `.main-content`, which has a lower stacking context than the fixed bottom navigation. The dialog also keeps Element Plus's default `15vh` top margin and a fixed 368px arena, so the action buttons overlap the bottom navigation at 390x844 and fall outside the viewport at 390x667.

The game logic itself is healthy: fruit slicing changes the score from 0 to 12 in the local reproduction, and the production fruit, bomb, trophy, character, and audio URLs all return HTTP 200.

## Approved Approach

Use the minimal responsive-dialog fix:

- Append the game dialog to the document body with Element Plus's `append-to-body` prop so its overlay is above the app shell and bottom navigation.
- Constrain the dialog to the dynamic viewport height and make its body scroll only when a very short viewport requires it.
- Scale the Fruit Slice arena with `dvh` while preserving the existing 368px maximum.
- Hide the app bottom navigation while the game dialog is present.
- Change result sound elements from eager preload to `preload="none"`, avoiding several megabytes of audio transfer when the game first opens.

## Files

- `frontend/src/views/mindfulness/MindfulnessView.vue`
- `frontend/src/views/mindfulness/games/FruitSliceGame.vue`
- `frontend/src/styles/global.css`
- `frontend/tests/mindfulness-games.test.js`

## Verification

- Source regression tests require dialog teleporting, responsive height constraints, bottom-navigation suppression, and lazy audio preload.
- Existing Match-3 and Fruit Slice engine tests remain green.
- Vite production build completes successfully.
- Browser checks at 390x844 and 390x667 confirm the dialog and action buttons stay inside the viewport and the bottom navigation no longer overlaps the game.
- Production HTTP checks confirm the deployed build and vendor assets are reachable.
