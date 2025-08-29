For each item: a short instruction, step-by-step implementation notes a Copilot assistant can follow, and clear acceptance criteria.

1. [x] Add a top search placeholder in the top bar (UI-only)
    - Task: Insert a non-functional search input in the top bar. Include a left magnifier icon, placeholder text `Search entries… (Press / to focus)`, and a right-side `/` hint. Make the input `readonly` so no search logic runs yet.
    - Steps: add markup for a container with icon + readonly input + hint; position it center-left in the topbar using flex layout; ensure it visually blends with the theme.
    - Acceptance: placeholder visible, magnifier at left, `/` hint at right, no network calls.

2. [x] Make the `/` keyboard hint focus the search (UI-only)
    - Task: Add a keydown handler so pressing `/` focuses the readonly input and shows a brief toast “Search focused — search not yet implemented”.
    - Steps: add a listener for key `/` (ignore with meta/ctrl), programmatically focus the input and show a 1.5s ephemeral toast.
    - Acceptance: pressing `/` focuses the input and shows toast; no backend invoked.

3. [ ] Create theme variables for spacing and colors
    - Task: Centralize spacing and color tokens as variables so subsequent changes are fast and consistent.
    - Steps: introduce tokens for spacing (8/16/24/32), card radius, card background alpha, border alpha, primary accent, primary text and muted text; replace a handful of hard-coded values to reference tokens.
    - Acceptance: token definitions exist and at least five visual styles reference them.

4. [ ] Convert history rows into interactive card components
    - Task: Replace list rows with a card component that includes: thumbnail area (or placeholder), meta row (collection + date), title, excerpt, and tag chips. Make the entire card clickable and keyboard focusable.
    - Steps: implement the card markup pattern, wire an `onClick` or anchor to open the full record, ensure `tabindex=0` and `onKeyDown` handles Enter.
    - Acceptance: history list shows cards; clicking or pressing Enter opens the full record (or stub modal).

5. [ ] Wrap cards in a responsive grid
    - Task: Place cards into a responsive grid that auto-fills columns on desktop with consistent gaps.
    - Steps: create grid container that produces columns based on a min column width (~280px) and consistent spacing between cards; ensure layout adapts to window resizing.
    - Acceptance: on desktop (>=1366px) cards form multiple columns with consistent 24px gaps and no horizontal overflow.

6. [ ] Equalize page and card padding/gutters
    - Task: Standardize the page gutter so left/right/top padding match across content and card container.
    - Steps: pick a single gutter value and apply it to main content container and card grid padding; visually confirm matching gutters.
    - Acceptance: left/right gutters numerically equal top padding; visually aligned.

7. [ ] Set consistent inner card padding
    - Task: Ensure every card uses identical inner padding so the top padding doesn’t appear larger than left/right.
    - Steps: decide an inner padding value (e.g., 16px) and apply it to the card content sections (title, excerpt, tags).
    - Acceptance: all cards look consistent; no visual imbalance between top and side padding.

8. [ ] Standardize card shape & borders
    - Task: Make all cards use the same corner radius and subtle border treatment to create a unified surface language.
    - Steps: apply same radius value and a low-opacity border color across all cards and similar panels.
    - Acceptance: all cards share identical rounded corners and subtle borders.

9. [ ] Add hover elevation + smooth transition on cards
    - Task: Add a subtle transform and soft shadow on hover/focus so cards feel interactive.
    - Steps: implement a transform translateY(-X) and a soft box-shadow with a short transition; ensure the same effect is visible on keyboard focus.
    - Acceptance: hover and focus produce smooth elevation; aesthetic is consistent.

10. [ ] Create a thumbnail cover area with fallback
     - Task: Each card should have a cover area (fixed height) that shows either an image or a blurred/color placeholder if no image exists.
     - Steps: render thumbnail if available; otherwise show a visually interesting placeholder (blurred pattern or brand color block with an icon).
     - Acceptance: cards without images still look polished and non-empty.

11. [ ] Implement consistent tag chips
     - Task: Render tags as small pill chips with consistent padding, radius and spacing; chips should be clickable.
     - Steps: create a chip element style and ensure chips are horizontally spaced and vertically centered in the tag row.
     - Acceptance: tag chips look uniform across cards and are clickable.

12. [ ] Add hover overlay quick-actions on thumbnail
     - Task: On thumbnail hover, reveal a small overlay with quick-action icons (open/preview, pin, edit). Keep them hidden by default.
     - Steps: render overlay icons inside the thumbnail area with opacity 0 → 1 on hover; ensure actions have `aria-label` and are keyboard-focusable.
     - Acceptance: overlay appears on hover/focus and actions are operable via keyboard and mouse.

13. [ ] Apply subtle glass/blur on stat tiles only
     - Task: Use a gentle blur/glass look for top stat tiles while avoiding adding this effect to many repeating elements.
     - Steps: apply a muted blur and slightly translucent background to stat tiles; confirm performance is acceptable.
     - Acceptance: stat tiles have a subtle glass effect; page remains smooth.

14. [ ] Add skeleton shimmer placeholders for lists
     - Task: When content is loading, render skeleton cards with a CSS-only shimmer animation to indicate progress.
     - Steps: show skeleton cards during async loads; use keyframe animation for shimmer; ensure no JS-heavy animation logic.
     - Acceptance: skeletons display and animate while loading and are removed once content loads.

15. [ ] Add a Floating Action Button (FAB) for “New Entry”
     - Task: Add a prominent bottom-right circular FAB with `+` that opens a new-entry modal or stub UI.
     - Steps: position fixed bottom-right, visually distinctive gradient, accessible label, keyboard focusable, opens modal stub.
     - Acceptance: FAB visible, tab-focusable, opens the new entry stub when activated.

16. [ ] Unify icon sizes and stroke widths
     - Task: Make icons visually consistent across the left nav, topbar, and cards by standardizing sizes and stroke weights.
     - Steps: use a single icon scale for nav, a slightly smaller scale for micro-icons; replace mismatched icons with consistent variants.
     - Acceptance: icons across the UI appear coherent and balanced.

17. [ ] Soften Dracula accents (reduce saturation)
     - Task: Tone down extremely saturated accent colors to reduce eye fatigue while staying in the brand family.
     - Steps: reduce saturation/hue of primary accent by ~10–20% and increase card background luminance slightly.
     - Acceptance: UI feels softer and more comfortable to read for longer sessions.

18. [ ] Reserve high saturation for a single primary CTA
     - Task: Keep one bright element (FAB or primary CTA) saturated; use muted accents elsewhere.
     - Steps: mark the FAB/primary CTA as the only element with full saturation; introduce a muted accent for tags/stat highlights.
     - Acceptance: one element draws attention while others are calmer.

19. [ ] Tune typography scale and line-height
     - Task: Adjust font sizes and line-heights for readability: body ~14–16px, headings larger, increased line-height for paragraphs.
     - Steps: standardize body size and line-height, increase card title size slightly, check wrapping and readability.
     - Acceptance: long entries are comfortable to read; headings and body are visually hierarchical.

20. [ ] Ensure text contrast on card backgrounds meets WCAG AA
     - Task: Adjust card background alpha or text color so body text is ≥4.5:1 contrast ratio.
     - Steps: measure contrast for body and small text against card bg; tweak alpha until acceptable.
     - Acceptance: body text passes WCAG AA contrast.

21. [ ] Standardize date display with tooltip for absolute time
     - Task: Show relative time (e.g., “2 days ago”) in the UI and reveal the absolute timestamp on hover via tooltip.
     - Steps: display relative date string and add tooltip attribute containing absolute date/time.
     - Acceptance: hovering date shows absolute timestamp; format consistent across UI.

22. [ ] Add keyboard focus states and ARIA labels
     - Task: Ensure all interactive elements have visible focus indicators and accessible labels for screen readers.
     - Steps: add accessible focus styles and `aria-label` or `aria-describedby` to icon-only buttons, chips, and quick actions.
     - Acceptance: focus rings visible; screen reader announces elements correctly.

23. [ ] Make cards fully keyboard-navigable
     - Task: Cards must be reachable by Tab, openable with Enter, and closable with Escape in modals.
     - Steps: add `tabindex=0`, handle Enter to open and Escape to close preview; manage focus trap in modal.
     - Acceptance: keyboard-only users can open and close cards reliably.

24. [ ] Create a quick-preview modal for cards
     - Task: Implement a preview dialog that shows excerpt, tags and quick controls without navigating away.
     - Steps: open accessible modal overlay, trap focus, provide close `X`, close on Escape and background click.
     - Acceptance: modal opens, traps focus, is closeable via Escape and close button.

25. [ ] Make tag chips filter the board
     - Task: Clicking a tag should apply a client-side filter to the displayed cards and show an active filter breadcrumb with a clear action.
     - Steps: implement filtering state, update card list, display filter pill with clear button that resets filters.
     - Acceptance: clicking tag filters results; clear action restores unfiltered list.

26. [ ] Add consistent micro-interactions
     - Task: Implement small interactive feedbacks (button scale on click, hover states for links, tooltips).
     - Steps: implement short transitions for hover/focus across buttons and links; ensure durations are consistent.
     - Acceptance: interactions feel snappy and consistent across the app.

27. [ ] Audit and normalize container paddings
     - Task: Scan main layout containers and normalize paddings to the chosen page gutter; produce a short report of fixes.
     - Steps: identify containers with mismatched padding values and update them to the standardized gutter.
     - Acceptance: audit shows no mismatched containers; visual alignment verified.

28. [ ] Unify border treatments across UI surfaces
     - Task: Use the same subtle border style for cards, panels and tiles so edges read consistently.
     - Steps: replace hard-coded borders with the unified low-opacity border style across surfaces.
     - Acceptance: borders look uniform throughout the interface.

29. [ ] Align tag vertical positioning
     - Task: Ensure tags in the tag-row are vertically centered and do not jump between cards.
     - Steps: make tag-row a flex container with center alignment so chips sit consistently.
     - Acceptance: tags are visually aligned across different card heights.

30. [ ] Reduce visual weight of header small items
     - Task: Make the top-right date/time less visually competing with the “Today” heading by reducing weight or moving it.
     - Steps: lower font weight or opacity of the date, or place it under the heading.
     - Acceptance: “Today” heading remains visually dominant.

31. [ ] Make stat tiles match card visuals
     - Task: Apply the same surface language (radius, border, bg) to stat tiles so they feel cohesive with cards.
     - Steps: restyle stat tiles to use the same tokens used for cards.
     - Acceptance: stat tiles and cards share visual language.

32. [ ] Lazy-load thumbnail images
     - Task: Prevent large image loads from blocking initial paint by deferring offscreen thumbnails.
     - Steps: use native lazy-loading or IntersectionObserver fallback; show placeholder until image loads.
     - Acceptance: page initial paint is fast and images load progressively.

33. [ ] Limit heavy backdrop-filters
     - Task: Remove expensive backdrop-filters from repetitive elements; only keep them on stat tiles/topbar.
     - Steps: find and remove unnecessary backdrop filters, keep them minimal to avoid GPU strain.
     - Acceptance: page runs smoothly; only a few elements use backdrop-filter.

34. [ ] Use CSS-only shimmer animations
     - Task: Implement skeleton shimmer purely with CSS keyframes; avoid JS-driven animations.
     - Steps: create skeleton classes with keyframes and reuse them while loading.
     - Acceptance: shimmer works without JS and performs well.

35. [ ] Normalize transition timing across UI
     - Task: Standardize hover/focus/click transition durations so interactions feel unified.
     - Steps: choose a small set of timing tokens (e.g., 150ms, 180ms) and use them for transitions.
     - Acceptance: transitions across widgets have matching timing and easing.

36. [ ] Standardize small-copy and CTA capitalization
     - Task: Make CTA copy consistent (e.g., “View all” sentence-case) and headings consistent in style.
     - Steps: update labels to follow the chosen style guide and confirm in UI.
     - Acceptance: CTA text is consistent across screens.

37. [ ] Increase contrast for small icons
     - Task: Ensure small icons are set to higher alpha or color so they meet readable contrast.
     - Steps: adjust small-icon color alpha to a value that passes contrast checks; re-evaluate visually.
     - Acceptance: small icons are clearly visible and readable.

38. [ ] Add accessible tooltips for icon-only nav items
     - Task: Provide text tooltips on hover/focus for icon-only items in the left nav, with ARIA support.
     - Steps: render tooltip on hover/focus, use `aria-describedby` or `aria-label`, ensure mobile fallback.
     - Acceptance: tooltips appear for hover and when focused; screen readers can access labels.

39. [ ] Show ephemeral shortcut toast when search shortcut used
     - Task: When user presses `/` or `⌘K`, show a small ephemeral toast indicating search is focused or that search is not implemented yet.
     - Steps: implement ephemeral toast component that can be reused; show for ~1.5s on shortcut press.
     - Acceptance: toast reliably appears on shortcut use and fades out automatically.

40. [ ] Create copy-paste patch of core UI classes (dev convenience)
     - Task: Produce a single patch file containing the variables and core classes for search-placeholder, cards-grid, history-card, fab and skeletons so styling can be dropped in quickly.
     - Steps: assemble the token definitions and class names used across the app into a single patch for quick import.
     - Acceptance: loading the patch applies basic visual changes (placeholder, grid, card base styles, FAB, skeletons).

41. [ ] Convert one real history entry into a functional card for testing
     - Task: Pick one existing history record and implement it as a card instance with a working preview modal and keyboard interactions.
     - Steps: hard-code a single card with content, wire preview open/close, ensure accessibility and focus management.
     - Acceptance: test card opens preview, keyboard interactions work, and styles match tokens.

42. [ ] Run accessibility checks and produce a short report
     - Task: Run Lighthouse/aXe accessibility audit on the updated UI and list any critical issues found.
     - Steps: run the audits, capture the main failures (focus order, contrast, ARIA), and present them as actionable fixes.
     - Acceptance: no critical accessibility failures left unresolved.

43. [ ] Perform visual QA on desktop breakpoints
     - Task: Verify the UI at common desktop sizes (1366×768, 1920×1080) to ensure grids/gutters/FAB/topbar align.
     - Steps: capture screenshots or visually confirm layout at these sizes and log any issues.
     - Acceptance: UI looks correct at both breakpoints.

44. [ ] Collect initial user feedback from a small pool
     - Task: Deploy UI-only changes to a staging environment and get feedback on readability, search discoverability, and card interactions.
     - Steps: create short feedback form or in-app prompt; collect at least 3 responses and summarize.
     - Acceptance: at least 3 actionable feedback items collected.

45. [ ] Iterate on spacing & color tokens based on feedback
     - Task: Tweak spacing and color variables after feedback and re-run QA and accessibility checks.
     - Steps: update tokens, re-evaluate contrast and spacing, validate with the same QA checklist.
     - Acceptance: final pass approved and no remaining critical issues.

---

### Small nitpicks to fix (additional checklist)
46. [ ] Fix top vs side padding numeric mismatch
     - Task: Make top padding value numerically equal to left/right gutters for card containers.
     - Acceptance: numeric match verified.

47. [ ] Center tag vertical alignment
     - Task: Ensure tag chips align to center vertically in their row across cards.
     - Acceptance: tags appear level across different card heights.

48. [ ] Reduce weight of top-right date/time
     - Task: Lower font weight or opacity of the date/time so it doesn't compete with the “Today” heading.
     - Acceptance: “Today” is visually dominant.

49. [ ] Make border opacity uniform
     - Task: Change borders across tiles and cards to use the same low-opacity value.
     - Acceptance: border opacities consistent.

50. [ ] Normalize left-nav icon stroke widths
     - Task: Make left-nav icons match the stroke weight used in topbar icons.
     - Acceptance: icons visually consistent.

51. [ ] Standardize empty-state thumbnails
     - Task: When there is no thumbnail, render a consistent blurred placeholder pattern or icon block across all cards.
     - Acceptance: empty-state cards match design.

52. [ ] Apply identical styling to pinned/collections/tags tiles
     - Task: Ensure pinned/collections/tags stat tiles use the same card styling tokens.
     - Acceptance: stat tiles visually match card surfaces.

---

## Suggested QA test checklist to run after each item
- Press `/` — search focuses and toast appears (if implemented).
- Tab through header → cards → FAB: focus ring visible on each.
- Hover a card: thumbnail quick-actions appear.
- Click or press Enter on a card: preview/modal opens and Escape closes it.
- Run an accessibility scan for contrast & focus issues.
- Check desktop screenshots at 1366×768 and 1920×1080 for grid/gutter alignment.
