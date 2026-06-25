# Feedback A-Scope Design

## Goal

Improve the H5 app according to the June 25 feedback while avoiding two blocked inputs: the exact detailed-assessment question list and the three external mini-game links.

## Scope

- Complete the visible Chinese/English switching pass for the app shell and the five main H5 pages.
- Move the home daily healing task near the top so check-in is immediately available after launch.
- Upgrade "照顾一下草团子" from plain buttons to a light quest/energy loop that reuses the existing sprout-care state.
- Build the home memory wall from prior local emotion records, sprout diary entries, treehole entries, and mood quote cards.
- Keep the current internal Match-3 and Fruit Slice games, and add a configurable external game-link entry point for 抓大鹅/消消乐/切水果.
- Make the bottom emotion tab icon cuter with app-tone styling and a cleaner icon treatment.
- Fix mindfulness audio feedback by keeping local audio first, then falling back to source playback/opening when the local mp3 cannot play.
- Make detailed psychological analysis questions data-driven so the exact provided question list can be swapped in without rewriting UI code.
- Ensure the knowledge page surfaces all prepared article and video materials, not just the first highlighted items.

## Constraints

- YouTube links are not direct mp3 audio files, so they cannot be assigned to an HTML audio element as a reliable background-music source.
- The current screenshot does not contain readable full mini-game links, so external game cards will use placeholder config until the real links are provided.
- The exact detailed psychological-analysis question set is not present in the repo, so the code will expose a single configuration source with the current five-question fallback.

## Data Flow

- Home reads and writes `xinqing_sprout_care_state`, reads local mood/treehole/share-card history, and derives a small randomized memory wall.
- Emotion imports assessment question config and builds backend-compatible answers from stable question keys.
- Mindfulness imports meditation theme config with `audio`, `sourceUrl`, and optional embed URL. When local audio fails, the page offers source playback instead of silently failing.
- Knowledge uses the existing document-sourced material list, with dedicated full-list sections for all videos and all articles.

## Verification

- Add static Node tests for the expected product hooks and config points.
- Run focused frontend tests first, then the full frontend test suite.
- Build the frontend.
- Verify five main pages in the in-app browser after the dev server reloads.
