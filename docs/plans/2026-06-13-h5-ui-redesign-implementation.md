# H5 UI Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Produce a five-screen Pencil UI redesign for the H5 app and prepare the Vue frontend for a faithful implementation.

**Architecture:** Treat the redesign as a design-system refresh centered on the mobile app shell. First create a Pencil document with the approved five-screen flow, then map the visual system into Vue tokens and screen-level components.

**Tech Stack:** Pencil MCP, Vue 3, Vite, Pinia, Vue Router, Element Plus, CSS custom properties.

---

### Task 1: Create Pencil Design File

**Files:**
- Create: `designs/h5-ui-redesign.pen`
- Export: `designs/exports/`
- Reference: `docs/plans/2026-06-13-h5-ui-redesign-design.md`

**Step 1: Create a fresh Pencil document**

Open a new Pencil document and save it as `designs/h5-ui-redesign.pen`.

Expected: A writable Pencil document exists for the redesign.

**Step 2: Create five 390px mobile artboards**

Create these top-level frames:

- `01 Home`
- `02 Emotion Check-In`
- `03 Mindfulness`
- `04 Treehole`
- `05 Knowledge`

Use a 390px width and 844px height for each frame. Place frames horizontally with clear spacing.

Expected: Five artboards are visible and named correctly.

**Step 3: Add shared visual tokens to the design**

Use the approved palette:

- Background `#F8F3EC`
- Surface `#FFFDFC`
- Soft surface `#F4ECE7`
- Primary rose `#D95E76`
- Sage `#6FAF8B`
- Coral `#F39A74`
- Calm blue `#6E9DD8`
- Text primary `#28232A`
- Text secondary `#726B73`

Expected: The five frames share one coherent visual language.

**Step 4: Validate Pencil layout**

Run Pencil layout snapshot on the document.

Expected: No overlapping or clipped elements in the five artboards.

**Step 5: Export preview PNGs**

Export all five artboards to `designs/exports/`.

Expected: Five PNGs are created and can be inspected.

### Task 2: Draw Shared App Shell

**Files:**
- Modify: `designs/h5-ui-redesign.pen`
- Future implementation: `frontend/src/App.vue`
- Future implementation: `frontend/src/styles/global.css`

**Step 1: Draw top utility controls**

Each artboard should include:

- Small avatar/profile button
- Language toggle
- Theme toggle

Expected: Top controls are consistent across all screens.

**Step 2: Draw five-item bottom navigation**

Use these tabs:

- 首页
- 情绪
- 正念
- 树洞
- 知识

Show the active tab state per artboard. Profile is not in the bottom nav.

Expected: The bottom nav is readable at 390px width and does not crowd labels.

**Step 3: Add reusable screen background**

Use a warm matte background, subtle section contrast, and no large decorative orbs.

Expected: The shell feels calmer than the existing app and leaves enough focus for content.

### Task 3: Draw Home Artboard

**Files:**
- Modify: `designs/h5-ui-redesign.pen`
- Future implementation: `frontend/src/views/home/HomeView.vue`

**Step 1: Draw greeting header**

Use copy:

```text
晚上好
今天也给自己一点照顾
6月13日 周六
```

Expected: The top hierarchy reads before any decoration.

**Step 2: Draw compact companion badge**

Use a small grass mascot/seedling badge around 72px wide, paired with streak text.

Expected: The mascot supports the product tone without dominating the page.

**Step 3: Draw primary daily check-in card**

Use copy:

```text
今天感觉怎么样？
用 30 秒记录此刻的状态
开始打卡
```

Expected: The primary action is the clearest element on the screen.

**Step 4: Draw three action shortcuts**

Add:

- 情绪记录
- 开始正念
- 写给树洞

Expected: Shortcuts are compact, scannable, and visually consistent.

**Step 5: Draw progress module**

Use copy:

```text
连续陪伴 1 天
再坚持 2 天，解锁小围巾
```

Expected: Progress is present but not gamified too aggressively.

### Task 4: Draw Emotion Check-In Artboard

**Files:**
- Modify: `designs/h5-ui-redesign.pen`
- Future implementation: `frontend/src/views/emotion/EmotionView.vue`

**Step 1: Draw page header**

Use copy:

```text
今日心情打卡
慢慢来，选一个最接近的状态
```

Expected: The page feels like a guided ritual.

**Step 2: Draw mood selector**

Create five equal mood options:

- 焦虑
- 丧
- 平静
- 开心
- 元气

Expected: Items fit without horizontal overflow.

**Step 3: Draw energy and sleep panel**

Add an energy slider and sleep rating inside one quiet surface.

Expected: Controls feel part of one form system.

**Step 4: Draw micro-journal field**

Use placeholder:

```text
今天有一点点值得记下的事吗？
```

Expected: Textarea has enough breathing room and does not look like a generic admin input.

**Step 5: Draw submit and weekly report entry**

Use one primary button:

```text
保存今日状态
```

Add a compact weekly report card below.

Expected: The submit action is unmistakable.

### Task 5: Draw Mindfulness Artboard

**Files:**
- Modify: `designs/h5-ui-redesign.pen`
- Future implementation: `frontend/src/views/mindfulness/MindfulnessView.vue`

**Step 1: Draw practice player**

Use copy:

```text
正念练习
10 分钟安静练习
开始
```

Expected: The first screen invites immediate action.

**Step 2: Draw duration segmented control**

Add 3, 10, and 20 minute options.

Expected: Selected duration is obvious.

**Step 3: Draw volume controls**

Add voice and background sliders in a compact settings panel.

Expected: Settings are secondary to starting practice.

**Step 4: Draw breathing entry**

Use copy:

```text
4-7-8 呼吸
跟随节奏放慢身体
```

Expected: Breathing feels like a second practice, not a separate app section.

**Step 5: Draw mini-game row**

Add four compact tools:

- 泡泡
- 切皂
- 整理
- 曼陀罗

Expected: Tools fit as secondary stress relief options.

### Task 6: Draw Treehole Artboard

**Files:**
- Modify: `designs/h5-ui-redesign.pen`
- Future implementation: `frontend/src/views/treehole/TreeholeView.vue`

**Step 1: Draw private composer**

Use copy:

```text
倾诉你的心声
这里会安静地接住你想说的话
```

Expected: Composer feels private and safe.

**Step 2: Draw letter-like textarea**

Use placeholder:

```text
把这里当作树洞，说出你的烦恼、痛苦或心事...
```

Expected: The input area has a soft editorial feel.

**Step 3: Draw publish controls**

Use a clear toggle group:

- 匿名
- 发布到广场

Expected: The privacy choice is legible and trustworthy.

**Step 4: Draw attachment tools and submit**

Add icon buttons for voice and image, then the primary button:

```text
发送到树洞
```

Expected: Tools do not compete with the send action.

**Step 5: Draw public square preview**

Use a warm empty state and one sample feed card style.

Expected: The square does not look broken when empty.

### Task 7: Draw Knowledge Artboard

**Files:**
- Modify: `designs/h5-ui-redesign.pen`
- Future implementation: `frontend/src/views/knowledge/KnowledgeView.vue`

**Step 1: Draw daily quote card**

Use copy:

```text
晨曦语录
今天先从一句话开始
```

Expected: The quote card is compact and editorial.

**Step 2: Draw content tabs**

Add segmented tabs:

- 视频
- 测试
- 文章
- 专题

Expected: Tabs are touch-friendly and visually aligned with the shell.

**Step 3: Draw featured content card**

Use copy:

```text
先看一点轻内容
让理解从更轻的入口开始
```

Expected: The selected tab has a clear featured area.

**Step 4: Draw secondary content list**

Add two compact content cards or an intentional empty state.

Expected: The page still feels designed when backend data is unavailable.

### Task 8: Map Design To Vue Implementation

**Files:**
- Modify: `frontend/src/App.vue`
- Modify: `frontend/src/styles/global.css`
- Modify: `frontend/src/views/home/HomeView.vue`
- Modify: `frontend/src/views/emotion/EmotionView.vue`
- Modify: `frontend/src/views/mindfulness/MindfulnessView.vue`
- Modify: `frontend/src/views/treehole/TreeholeView.vue`
- Modify: `frontend/src/views/knowledge/KnowledgeView.vue`
- Test: `frontend/tests/theme-contrast.test.js`
- Test: existing page tests under `frontend/tests/`

**Step 1: Write or update visual regression-friendly tests**

Add tests for:

- Five bottom nav items.
- Profile moved out of bottom nav.
- Main page content renders for each redesigned route.

Run:

```bash
npm test -- --run
```

Expected: Tests fail before implementation if they assert new nav behavior.

**Step 2: Update global tokens**

Move the approved palette and shared card/button/nav styling into `frontend/src/styles/global.css`.

Expected: Existing components can consume consistent tokens.

**Step 3: Update app shell**

Modify `frontend/src/App.vue` to:

- Use five bottom-nav items.
- Move Profile to top controls.
- Remove persistent home share control from the top shell.

Expected: The shell matches the Pencil design.

**Step 4: Update page layouts**

Implement the five page designs one route at a time, matching structure from the Pencil artboards.

Expected: Each page keeps current behavior while improving layout and hierarchy.

**Step 5: Verify build**

Run:

```bash
npm run build
```

Expected: Build completes without errors.

**Step 6: Verify in browser**

Run the dev server and inspect 390px mobile viewport:

```bash
npm run dev -- --host 127.0.0.1
```

Expected: Home, Emotion, Mindfulness, Treehole, and Knowledge render without clipped or overlapping UI.

**Step 7: Commit**

```bash
git add frontend/src/App.vue frontend/src/styles/global.css frontend/src/views/home/HomeView.vue frontend/src/views/emotion/EmotionView.vue frontend/src/views/mindfulness/MindfulnessView.vue frontend/src/views/treehole/TreeholeView.vue frontend/src/views/knowledge/KnowledgeView.vue frontend/tests
git commit -m "feat: redesign h5 mobile experience"
```

Expected: Redesign implementation is committed separately from the design documentation.
