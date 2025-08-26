# UI/UX Desktop Overhaul Roadmap

Use this checklist to track desktop-first improvements. Reference items by number (e.g., “Implement Task 1”). After we ship a task, we’ll check it off here.

## Completed
- [x] Full-width layout with persistent left sidebar (collapse removed)
- [x] Reduced duplicate “New Entry” paths (kept Sidebar + Home CTA + emoji grid)
- [x] Entry success overlay scoped to main card (no background overflow)
- [x] Achievements view error fixed (hook order) and grid tweaked
- [x] Compact desktop mood buttons; left-aligned mood grid
- [x] History empty-state CTA opens Entry

## Backlog (pick by number)

1) Two‑column Entry (desktop)
- [x] Layout: 2-column grid (Left: Mood + Groups/Tags + Manager; Right: Editor + Save)
- [x] Sticky Save bar on the right (visible while scrolling editor)
- [x] Mobile fallback: stack vertically
- [x] Acceptance: Fewer scrolls on 1440px, Save always visible; no horizontal scroll
- Files: `src/views/EntryView.jsx`, `src/App.css`

2) Home with right rail
- [ ] Main: History list
- [ ] Right rail: filters (date range, groups), streak, mini insights, export
- [ ] Mobile fallback: hide rail or move below list
- [ ] Acceptance: On ≥1280px, rail visible without overlapping; filters affect History
- Files: `src/views/HistoryView.jsx`, `src/components/history/*`

3) Compact desktop mood selector (horizontal)
- [ ] Add `MoodBar` for desktop (40–48px icons, single row)
- [ ] Use `MoodBar` on Home (desktop); keep large emoji grid for mobile
- [ ] Acceptance: One-line selector on ≥1024px; grid preserved on mobile
- Files: `src/components/mood/MoodBar.jsx` (new), `src/views/HistoryView.jsx`, `src/App.css`

4) Density and spacing sweep (desktop)
- [ ] Reduce card paddings to 16–24px; tighten vertical rhythm to 12–16px
- [ ] Trim gradients/shadows on non-CTA elements; keep strong focus on primary CTAs
- [ ] Acceptance: Visually denser layouts with consistent spacing scale
- Files: `src/App.css`, component-level styles

5) Content readability guard on ultra‑wide
- [ ] Add optional inner wrapper: `.app-main > .content { max-width: 1280–1320px; margin: 0 auto; }`
- [ ] Keep app full‑width; only center inner content for readability on ≥1600px
- [ ] Acceptance: No overflow; improves line length without removing full‑bleed feel
- Files: `src/App.css`, wrappers in views

6) History list readability
- [ ] Tighter entry cards, date separators, hover affordances
- [ ] Show delete on hover; confirm before delete
- [ ] Acceptance: Faster scanning, clear affordances; keyboard focus states visible
- Files: `src/components/history/HistoryList.jsx`, `src/components/history/HistoryEntry.jsx`, styles

7) Achievements grid polish
- [x] Consistent card height; lighter surface styles; subtle rarity badge
- [x] Show progress bars inline on locked cards
- [x] 3–4 columns on wide screens; 1–2 on mobile
- [x] Acceptance: No layout shift; clear locked vs unlocked
- Files: `src/views/AchievementsView.jsx`, `src/components/nft/AchievementNFT.jsx`

8) Header refinement (desktop)
- [ ] Left-align title/subtitle; add simple breadcrumbs (e.g., Home / History)
- [ ] Reduce decorative gradient usage; keep theme switch
- [ ] Acceptance: Clear hierarchy, less decorative noise, consistent sizing
- Files: `src/components/Header.jsx`, styles

9) Keyboard shortcuts
- [ ] n = New Entry; / = focus editor on Entry
- [ ] g h = Home; g s = Stats
- [ ] Accessibility: do not override inputs; show a small help tooltip
- [ ] Acceptance: Shortcuts work reliably and are documented in Settings
- Files: `src/App.jsx`, `src/views/EntryView.jsx`, small helper component

10) Performance: lazy-load markdown editor
- [ ] Dynamically import editor on Entry route
- [ ] Add Suspense fallback (skeleton)
- [ ] Acceptance: Faster initial load; no layout jump
- Files: `src/components/MarkdownArea.jsx` (lazy in parent), `src/views/EntryView.jsx`

---

How to use
- Ask to “Implement Task N” (e.g., 1 or 2).
- I’ll implement it and check the boxes here.
- We’ll iterate with small PR-sized steps to keep changes safe and reviewable.
