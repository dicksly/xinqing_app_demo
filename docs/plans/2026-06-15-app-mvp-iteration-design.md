# H5 App MVP Iteration Design

## Source Docs

- `docs/APP迭代.docx`
- `docs/背景音乐和视频、文章素材.docx`
- `docs/草团子首页养成系陪伴机制.docx`

## Approved Scope

The approved direction is the MVP closed-loop iteration. It favors a usable demo that covers the core product requests without requiring a full backend rebuild.

## Product Goals

1. Make the home page feel like a grass-mascot companion experience instead of a module launcher.
2. Give emotion check-in a reward moment through a mood-based illustrated quote card.
3. Simplify mindfulness into one meditation flow with 5/10/20 minute choices, monthly background themes, and two clearer game entries.
4. Make treehole posts feel visible and interactive through local likes, comments, replies, and safety hints.
5. Fill the knowledge hub with the provided links and replace simplified MBTI with SBTI.
6. Hide admin entry from the ordinary profile menu, expose it only from settings/advanced controls.
7. Add a user-facing font-size setting and guard engagement streak state against polluted jumps.

## Current Code Fit

The current code already has several useful foundations:

- Emotion check-in and detailed psychological analysis exist in `frontend/src/views/emotion/EmotionView.vue`.
- Engagement streak logic exists in `frontend/src/utils/engagement.js`.
- Mindfulness monthly theme structure exists in `frontend/src/utils/meditation-themes.js`.
- Treehole has local persistence and public/my feed merging in `frontend/src/utils/treehole-feed.js`.
- Knowledge content already supports external URLs through API data and `KnowledgeContent.external_url`.
- Profile settings and admin navigation exist in `frontend/src/views/profile/ProfileView.vue`.

## Experience Design

### Home: Worry Sprout Companion

Replace the shortcut grid with a single companion surface:

- hero card with grass mascot, stage, streak, and sun drops;
- action row: feed, wash, outing, comfort;
- growth track with next milestone and unlocked reward text;
- daily task card that routes to emotion check-in and explains the reward.

State remains local-first:

- `xinqing_engagement_state` stores streak and last check-in;
- new `xinqing_sprout_care_state` stores sun drops, care action counts, supplies, and last action day;
- engagement streak is clamped so bad legacy state cannot show jumps such as 1 day becoming 20 days.

### Emotion: Mood Quote Card

After saving today's mood:

- show a larger illustrated daily quote card instead of only a small tag dialog;
- copy changes by mood;
- provide download/save poster and share buttons;
- poster generation uses DOM-to-canvas only if available, otherwise provides a graceful browser share/copy fallback.

### Mindfulness: Unified Meditation

Keep one meditation player:

- duration options become 5/10/20 minutes;
- monthly themes use the exact links from the material document as external source URLs;
- voice/tick/background controls remain visible;
- game strip changes to two entries: match-3 and fruit slicing. In MVP these are polished entry cards with in-app placeholder dialogs, while the existing legacy games are no longer primary.

### Treehole: Interaction Layer

Treehole remains local-first for MVP:

- published local posts appear in both public and mine views;
- every feed item shows like count and comment count;
- detail dialog supports liking, adding comments, and replying to a comment;
- content is checked against a small sensitive-word list before publish. Severe/self-harm wording keeps the post private and shows a supportive warning.

### Knowledge: Provided Links And SBTI

Add static fallback content from the docs:

- 12 monthly video links;
- 12 monthly article links;
- SBTI test link: `https://www.fengyunzhice.com/sbti?ver=8bdpc-6234&bd_vid=12439061078742734187`;
- feature card in the test tab says SBTI instead of simplified MBTI.

Existing backend/API data still wins when available.

### Profile And Settings

- Remove visible admin menu item from the main profile menu.
- Add an advanced/settings row for admin console.
- Add font-size control: small, standard, large.
- Store in `xinqing_settings.fontScale`.
- Apply through a root attribute/class so page tokens scale without per-page rewrites.

## Out Of Scope For This MVP

- Real password reset email flow.
- Backend persisted treehole comments/likes/replies.
- Real match-3 and fruit slicing engines.
- Full cloud sync for sprout supplies and room decoration.
- 3D habitat, friend visits, weather system, annual report.

These remain future backend/gameplay phases.

## Acceptance Checklist

- Home first screen is grass-mascot companion, not four shortcut modules.
- Emotion save opens a mood quote poster with save/share actions.
- Mindfulness shows one meditation flow, 5/10/20 duration, 12 monthly themes, and two game entries.
- Treehole local published entries can be seen, liked, commented on, and replied to.
- Knowledge links from the docs are reachable; SBTI replaces MBTI.
- Profile menu no longer shows a direct admin entry; settings contains advanced/admin access.
- Font size can be changed and persists.
- Existing tests and build pass.
