# Nightlio audit (layout, APIs, UI polish) — Aug 29, 2025

This captures an audit of endpoints, API usage, UI/layout, theming, fonts, and minor fixes. Items use checkboxes; completed ones are marked [x].

## 1) Backend endpoints and API usage
- [x] Auth
  - [x] POST /api/auth/google — Google token verification, returns JWT + user
  - [x] POST /api/auth/verify — Verifies JWT, returns user
  - [x] POST /api/auth/local/login — Self-host login, returns JWT + user
- [x] Moods
  - [x] POST /api/mood — Create entry
  - [x] GET /api/moods — List entries (range supported)
  - [x] GET /api/mood/:id — Get entry
  - [x] PUT /api/mood/:id — Update entry
  - [x] DELETE /api/mood/:id — Delete entry
  - [x] GET /api/statistics — Summary stats
  - [x] GET /api/streak — Current streak
  - [x] GET /api/mood/:id/selections — Entry selections
- [x] Groups
  - [x] GET/POST /api/groups — Groups CRUD (create exposed; others via services)
  - [x] POST /api/groups/:groupId/options — Add option
  - [x] DELETE /api/groups/:groupId — Delete group
- [x] Achievements
  - [x] GET /api/achievements — User achievements
  - [x] POST /api/achievements/check — Re-evaluate
- [x] Config
  - [x] GET /api/config — Public runtime config
- [x] Misc
  - [x] GET /api/ — Health
  - [x] GET /api/time — Time

Frontend `src/services/api.js` maps to these endpoints; base URL uses Vite env with safe normalization.

## 2) Frontend UI and layout audit
- [x] App shell
  - [x] Left sidebar (desktop), bottom nav (mobile), sticky header present
  - [ ] Add global search input in header that filters History
  - [ ] Responsive grid for History cards (currently stacked list)
  - [ ] Overview KPI tiles (entries, streak, tags) at top of History
- [x] Accessibility
  - [ ] Add semantic roles/landmarks and aria-current consistently
  - [ ] Ensure focus rings on interactive controls
- [x] Minor visuals
  - [x] Remove accent “glows”; use neutral shadows
  - [x] Enforce icon color using currentColor for editor toolbar

## 3) Colors, fonts, theming
- [x] Tokenized colors + Dracula dark default
- [x] Neutral shadows; stronger text contrast across key components
- [ ] Font system: confirm Inter fallbacks and consistent sizes/line-heights
- [ ] Unify radii and spacing tokens to match reference density

## 4) Lint audit and quick fixes
Recent `npm run lint` surfaced issues. Fixed now:
- [x] Remove unused vars/params and minor tweaks
  - [x] App.jsx: unused `config`
  - [x] Header.jsx: removed unused props/helpers
  - [x] HistoryList.jsx: removed unused toast var
  - [x] GroupManager.jsx: removed unused `loading` prop
  - [x] EntryView.jsx: unused catch bindings
  - [x] LoginPage.jsx: renamed error to message and fixed unused bindings
  - [x] Vite config: env access adjusted for lint
- [x] ESLint config
  - [x] Ignore api/venv and site-packages
  - [x] Allow underscore-args, disable only-export-components rule
  - [x] Node globals for `vite.config.js`
Pending fixes:
- [ ] StatisticsView: hooks used conditionally — refactor to call hooks unconditionally (Critical)
- [ ] AuthContext: effect dep warn on `verifyToken`; either include in deps via `useCallback` or leave with comment (Should)
- [ ] LoginPage: effect dep warn for `handleGoogleResponse` (Should)

## 5) Likely unused/legacy files
- [ ] `api/routes/web3_routes.py` — legacy; not registered in app
- [ ] `api/debug_railway.py` — debug helper; non-prod
- [ ] `api/simple_test.py` — ad hoc; pytest covers
- [ ] `src/contexts/Web3Context.jsx` — not used in `App.jsx` (legacy wagmi); remove or archive
- [ ] `src/components/MarkdownArea.css` — verify duplication with tokenized styles
- [ ] `public/scripts/populate_demo_data.py` (root `scripts/`) — optional demo

## 6) Improvements with priority
1. Header search + History filtering — Critical
2. History grid layout + card hover toolbelt — Should
3. KPI tiles row — Should
4. StatisticsView hooks refactor — Critical
5. Accessibility roles and shortcuts — Should
6. Remove/retire legacy web3 and debug files — Can pass (cleanliness)
7. Tokenize fonts/radii/spacing — Should

## 7) Completed today
- [x] Increased History delete icon/button size
- [x] Multiple lint fixes and ESLint configuration improvements

## 8) Notes
- API base resolution in `src/services/api.js` is robust to quoted envs and trailing slashes.
- Consider adding e2e smoke tests for CRUD flows and auth.
