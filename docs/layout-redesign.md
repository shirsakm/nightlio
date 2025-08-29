# Nightlio layout and IA redesign plan

This plan focuses on structure and interaction (not colors), inspired by the reference layout. Items marked [x] are implemented now; [ ] are proposed for later.

## 1) Global app shell
- [x] Persistent left sidebar on desktop; bottom nav + FAB on mobile (already present)
- [x] Sticky header; content area scrolls (already present)
- [ ] Add a prominent header search input that filters content in place
- [ ] Unify spacing scale across shell (grid gutters, paddings)
- [ ] Add keyboard shortcuts (/) focus search, g h to go home, etc.

## 2) Header structure
- [ ] Add centered/primary Search bar in the header with icon and clear affordance
- [ ] Add quick actions cluster (e.g., "+ New", "Edit Layout") aligned to the right
- [ ] Provide a compact header variant on scroll (reduce height)

## 3) Dashboard overview (top of main content)
- [ ] KPI tiles row (counts): Entries, Collections, Tags (Selections)
- [ ] Make KPI tiles configurable and clickable to filter the list
- [ ] Show trend deltas (7d/30d) on tiles

## 4) Content layout
- [ ] Switch History list to a responsive grid of cards
- [ ] Add card toolbelt (inline actions) that appears on hover
- [ ] Support multi-select + bulk actions in grid view

## 5) Sidebar information architecture
- [ ] Add collapsible sections with headers
  - [ ] Collections (Groups) listing
  - [ ] Tags (top selections) listing
- [ ] Surface counts as badges on items
- [ ] Clicking a collection/tag filters the main grid via global state

## 6) Mobile adaptations
- [x] Grid collapses to 1 column; search remains accessible
- [ ] Sticky mobile search at top with slide-away on scroll

## 7) Accessibility and polish
- [ ] Landmark roles (banner, navigation, main)
- [ ] Ensure tab order and focus rings for search and tiles
- [ ] ARIA for collapsible sidebar sections

---

## Implemented in this iteration
- [x] Increased History delete icon/button size for better affordance

## Next steps (fast follow)
- Implement header search and grid layout for History
- Add KPI tiles and click-through filters
- Introduce bulk selection and inline card actions
