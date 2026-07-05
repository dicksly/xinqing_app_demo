# Mindfulness Game Refactor Design

## Goal

Refactor the mindfulness Match-3 and Fruit Slice games using the two requested MIT-licensed reference projects while keeping the games inside the existing H5 app shell.

## Reference Projects

- `rembound/Match-3-Game-HTML5`: classic HTML5 Canvas match-3 logic with adjacent swaps, cluster detection, removal, gravity, refills, and move detection.
- `Ravindya/Fruit-Slash-Saga-2D-game`: falling fruit game with fruit, bomb, trophy, character actions, levels, and full image/audio resources.

## Architecture

The implementation keeps the existing Vue dialog integration and Pinia progress APIs. The original lightweight local game logic is replaced with reference-inspired logic:

- `frontend/src/utils/match3-game.js` becomes a classic swap-based match-3 engine.
- `frontend/src/views/mindfulness/games/Match3Game.vue` renders an 8x8 board and uses adjacent swaps instead of path selection.
- `frontend/src/utils/fruit-slice-game.js` becomes a falling-object round engine inspired by Fruit Slash Saga.
- `frontend/src/views/mindfulness/games/FruitSliceGame.vue` renders falling fruit, bombs, trophies, swipe trails, levels, and round end states.

Full reference resources are copied into public vendor folders:

- `frontend/public/vendor/match-3-game-html5/`
- `frontend/public/vendor/fruit-slash-saga/`

Development metadata such as `.git`, `.idea`, `.DS_Store`, and `node_modules` is not copied. License and README files are copied with the resources.

## Product Behavior

Match-3:

- 8x8 grid.
- Tap one tile, then tap an adjacent tile to swap.
- Valid swaps clear horizontal or vertical clusters of at least three.
- Cleared spaces collapse downward and refill.
- Invalid swaps are rejected with a short message.
- If no available moves remain, the board reshuffles.

Fruit Slice:

- Fruits, bombs, and trophies fall through a contained H5 arena.
- Swiping or tapping over items slices them.
- Fruit increases score and combo.
- Bombs penalize or end the round depending on remaining lives.
- Trophies count toward level completion.
- Level progression increases fall speed.
- The component keeps the calmer App tone while using the requested reference assets.

## Testing

Unit tests cover:

- Match-3 creates a stable board with no starting clusters and at least one valid move.
- Adjacent swaps that create a cluster clear, collapse, refill, and score.
- Invalid swaps are rejected.
- Fruit rounds include fruits, bombs, and trophies.
- Fruit slicing handles fruit, bombs, trophies, score, combo, lives, and trophy progress.
- Component source references the vendor resources and the reference-inspired mechanics.

Full verification:

- `node --test frontend/tests/*.test.js`
- `npm --prefix frontend run build`

## Notes

There are unrelated local changes for the knowledge embedded reader YouTube URL fix. They should not be reverted or mixed conceptually with this refactor.
