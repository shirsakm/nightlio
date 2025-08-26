# Nightlio UX/UI Overhaul Checklist

Date: 2025-08-26
Owner: shirsakm

This document tracks proposed UX and UI improvements. Each item is a concrete, actionable task. We’ll execute in small, verified increments (design tokens → navigation → entry flow → stats → achievements → settings → polish).

---

## 1) High‑impact quick wins (low effort)

- [x] Navigation
  - [x] Mobile: add a fixed bottom tab bar with icons + labels (History, Entry, Stats, Achievements, Settings)
  - [x] Desktop: add a collapsible left sidebar; keep header for page context only
  - [x] Add a persistent "+ New Entry" Floating Action Button (FAB) on mobile
- [ ] Visual hierarchy
  - [ ] Reduce header height/padding
  - [ ] Ensure a clear page title and optional subtitle on every screen
  - [ ] Promote primary action with a FAB and/or primary button above the fold
- [ ] Typography and spacing
  - [ ] Adopt 4/8px spacing scale, consistent margins/paddings
  - [ ] Set base font-size 16px; line-height 1.4–1.6 for body text
  - [ ] Use Inter or system font stack; minimize font weights to 3–4 steps (400/500/600/800)
- [ ] Color and theming
  - [ ] Introduce CSS variables (tokens) for colors, spacing, radius, shadows, typography
  - [ ] Add dark mode via prefers-color-scheme and a user toggle
  - [ ] Check WCAG AA contrast for text and UI elements
- [ ] Feedback and empty states
  - [ ] Add skeleton loaders for lists and charts
  - [ ] Add friendly empty states with single primary CTA (e.g., “Create first entry”)
  - [ ] Add toasts for success/error; inline field errors for forms
- [ ] Accessibility
  - [ ] Add visible focus states to interactive elements
  - [ ] Add skip-to-content link and semantic headings hierarchy
  - [ ] Add ARIA labels/roles for charts/toggles; avoid color-only signals
  - [ ] Respect reduced motion preference for animations

---

## 2) Screen‑specific improvements

- [ ] Header (src/components/Header.jsx)
  - [ ] Compact profile menu: Account, Export Data, Settings, Logout
  - [ ] Streak chip with tooltip (“X-day streak. Keep going!”)
  - [ ] Theme toggle (light/dark/system) in the profile menu
- [ ] HistoryView (src/views/HistoryView.jsx)
  - [ ] Add view tabs: Timeline | Calendar | Grid
  - [ ] Timeline: group entries by month with sticky headers
  - [ ] Filters: mood, tags, text search (debounced)
  - [ ] Calendar: heatmap by mood intensity; tap to open/create entry
  - [ ] Grid: cards with emoji mood chips and tag pills
- [ ] EntryView (src/views/EntryView.jsx)
  - [ ] Stepper: 1) Mood picker, 2) Tags (chips + typeahead), 3) Notes (Markdown)
  - [ ] Markdown editor: toolbar (bold/italic/list/link), preview toggle, word count
  - [ ] Suggested tags: show recent/frequent tags and time-of-day suggestions
  - [ ] Autosave draft; confirm before navigating away with unsaved changes
- [ ] StatisticsView (src/components/stats/StatisticsView.jsx)
  - [ ] Time range tabs: 7d, 30d, 90d, YTD, Custom
  - [ ] Mood trend with 7‑day moving average line
  - [ ] Tag correlations: top positive/negative (card list)
  - [ ] Time‑of‑day distribution chart (stacked bars or ridge plot alternative)
  - [ ] Export buttons: PNG/CSV per chart
- [ ] AchievementsView (src/views/AchievementsView.jsx)
  - [ ] Locked achievements: add progress bars (e.g., “5/7 days”)
  - [ ] Filter/sort by rarity; subtle confetti on unlock (respect reduced motion)
  - [ ] Detail modal: “how to achieve”, current progress, related tips
- [ ] Settings (new view)
  - [ ] Profile: name, avatar
  - [ ] Appearance: theme, density, reduced motion toggle
  - [ ] Data: export/import JSON/CSV, manual backup, auto-backup toggle
  - [ ] Privacy: screen blur, auto-lock after idle (PIN)
  - [ ] Integrations: toggle Google OAuth when enabled

---

## 3) Interaction and micro‑UX

- [ ] Micro‑interactions
  - [ ] Subtle button press/hover states and success checks
  - [ ] Streak chip gentle pulse on daily completion (reduced motion friendly)
  - [ ] Haptic feedback on mobile for mood selection (where supported)
- [ ] Error handling
  - [ ] Per-field validation with concise helper text
  - [ ] Global network offline banner; retry/backoff on failed requests
  - [ ] Queue offline mutations and sync via React Query once online
- [ ] Onboarding
  - [ ] First‑run 3‑step tour (Log mood → Add tags → See stats)
  - [ ] Optional demo entry seeding for empty DBs

---

## 4) System‑level improvements

- [ ] Design system (tokens + components)
  - [ ] Define tokens in :root (colors, spacing, radii, shadows, typography)
  - [ ] Build base components: Button, Chip, Card, Modal, Tooltip, Tabs, List, EmptyState, Toast, FAB
  - [ ] Elevation scale (0/1/2/3) and consistent corner radius (e.g., 12px)
- [ ] Performance
  - [ ] Route-based code splitting (Stats, Achievements)
  - [ ] Prefetch history/stats on tab hover/intent; set sensible staleTime in React Query
  - [ ] Optimize images and long-term cache headers
- [ ] Responsiveness
  - [ ] Mobile-first layouts; bottom sheet for Entry on small screens
  - [ ] Touch targets ≥44px; ensure chip/button density is comfortable
- [ ] PWA & offline
  - [ ] Add web manifest and service worker (Vite plugin)
  - [ ] Cache app shell + last 30 days of entries; offline entry creation with background sync
  - [ ] Install prompt and splash screen
- [ ] Internationalization
  - [ ] i18n scaffolding; externalize strings
  - [ ] Humanized dates (“Today”, “Yesterday”), timezone-safe handling

---

## 5) Visual refresh

- [ ] Palette: keep neutral surfaces (#F7F7FA light, #0E0E10 dark), gradient accents sparingly
- [ ] Cards: elevation 1, larger radius (10–12px), soft borders (1px @ ~10% opacity)
- [ ] Icons: lucide-react sizes standardized (16/20/24) and aligned to 4px grid
- [ ] Motion: duration 120–200ms, ease-out for entrances; respect reduced motion

---

## 6) Concrete, incremental milestones

- [ ] Milestone A: Foundation
  - [ ] Add design tokens (CSS variables) and dark mode toggle
  - [ ] Replace header spacing; add streak chip with tooltip
  - [ ] Add toast system and skeletons
- [ ] Milestone B: Navigation + Entry
  - [ ] Add bottom tab bar (mobile) and sidebar (desktop)
  - [ ] Add "+ New Entry" FAB (mobile)
  - [ ] Implement Entry stepper (mood → tags → notes) with Markdown toolbar
- [ ] Milestone C: Stats + Achievements
  - [ ] Add time range tabs and 7‑day moving average
  - [ ] Add tag correlation cards and export
  - [ ] Achievements progress bars and detail modal
- [ ] Milestone D: Settings + System
  - [ ] New Settings view (profile/appearance/data/privacy/integrations)
  - [ ] Route-level code splitting and prefetching
  - [ ] PWA manifest + service worker; offline caching/sync

---

## 7) Engineering notes (where to wire things)

- Tokens & theming: `src/index.css`, `src/App.css`, new `src/styles/tokens.css`
- Navigation: `src/components/Navigation.jsx` (+ new mobile BottomNav and desktop Sidebar)
- Header tweaks: `src/components/Header.jsx`
- Entry stepper: `src/views/EntryView.jsx` (+ small subcomponents for MoodPicker, TagChips, MarkdownEditor)
- Stats range & charts: `src/components/stats/StatisticsView.jsx`
- Achievements: `src/views/AchievementsView.jsx`, `src/components/nft/AchievementNFT.jsx`
- Toasts & skeletons: new lightweight utilities in `src/components/ui/`
- Settings: new route `src/views/SettingsView.jsx`
- PWA: `public/manifest.webmanifest`, service worker via Vite plugin

---

## 8) Success criteria

- [ ] 95% of UI interactive elements have visible focus and accessible labels
- [ ] Dark mode parity with AA contrast for text and controls
- [ ] New Entry flow completion time reduced by ≥25% on mobile (informal test)
- [ ] Stats page initial render TTI improved by ≥20% (code splitting + caching)
- [ ] Zero console errors; network failure states are recoverable with clear messaging

---

## 9) Nice-to-haves (later)

- [ ] Tag management screen with merge/rename
- [ ] Calendar week heatmap in header streak chip popover
- [ ] Quick actions: long‑press home screen (PWA) to “Log Mood”

---

## 10) Open questions

- [ ] Do we need a compact density mode for data-heavy users?
- [ ] Should we support custom mood scales (e.g., 1–10) as an advanced setting?
- [ ] Export formats: CSV only or JSON + ZIP (including attachments in future)?

---

Tip: We’ll tackle Milestone A first (tokens, header polish, toasts/skeletons). Once checked off, we’ll proceed to Navigation + Entry.
