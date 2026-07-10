# Breathing Vibration Design

## Goal

Add mobile haptic feedback to the 4-7-8 breathing exercise so users can follow phase transitions without staring at the screen.

## Approved Behavior

- Trigger a short vibration when inhaling starts.
- Trigger a short vibration when holding starts.
- Trigger a short vibration when exhaling starts.
- Trigger a double vibration when the four-cycle training completes.
- Stop any active vibration when the user stops breathing training or the mindfulness view unmounts.

## Approach

Reuse the existing `frontend/src/utils/vibration.js` helper already used by mindfulness games. Keep the behavior inside `frontend/src/views/mindfulness/MindfulnessView.vue`, near the breathing cycle state changes, so it stays aligned with the animation and tick sound timing.

## Testing

Add a source-level regression assertion in `frontend/tests/h5-redesign-ui.test.js` that verifies the mindfulness view imports `vibrationHelper`, calls `short()` on the inhale/hold/exhale transitions, calls `double()` on completion, and calls `stop()` during breathing cleanup.
