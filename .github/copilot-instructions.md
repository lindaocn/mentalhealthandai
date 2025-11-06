## Purpose
This repository is a small, static website (HTML/CSS/JS) for a project titled "mental health and AI." The guidance below helps an automated coding agent produce edits that match repository conventions and get changes running locally.

## Big-picture architecture (what to know quickly)
- Static front-end only: no build system, package.json, server code, or tests found. Files are served directly from the filesystem or a simple static server.
- Main pages: `mentalHealthAI.html`, `piechart1.html`, `piechart2.html` — each is a standalone HTML page that links to `style.css` and optionally `animation.js`.
- Charts: `piechart1.html` and `piechart2.html` use Chart.js via CDN: `<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>` and create charts with `new Chart(ctx, config)`.
- Fonts: local WOFF2 files live under `Fonts/`. `Fonts/font.css` declares `@font-face` rules and is linked from HTML as `Fonts/font.css`.
- Images: referenced under `Images/` (e.g., `Images/mentalHealthAI1.png`).

## Developer / agent workflows
- Preview locally: open any HTML file in a browser or run a simple static server. Recommended quick command (PowerShell):

```powershell
# from repo root
python -m http.server 8000
# then open http://localhost:8000/mentalHealthAI.html
```

- No builds or test runners to run. If you add build tooling, document it in the README and update these instructions.

## Project-specific conventions and patterns
- Content placeholders: some paragraphs contain explicit length/constraint notes (e.g., "must be 100 characters long" or "must be 350 characters"). Preserve or update these placeholders deliberately — they are intentional project constraints.
- Animation pattern: `animation.js` uses an `IntersectionObserver` and writes a CSS custom property `--p` on `.frame-one`. Visual effects are implemented via CSS `background-size` expressions that depend on `--p`. If you change animation timing or layout, update both `animation.js` and the CSS that reads `--p`.
- Font loading: `Fonts/font.css` references WOFF2 files relative to itself (expect `Fonts/Inter-*.woff2`). If you add fonts, keep them in `Fonts/` and add matching `@font-face` entries.
- Chart pages: charts are pure client-side and use inline data arrays in the HTML. If you move data to external files, maintain the same Chart.js config shape (labels/datasets/options).

## Key files to inspect when making changes
- `mentalHealthAI.html` — main landing page, links `style.css`, `Fonts/font.css`, `animation.js`.
- `piechart1.html`, `piechart2.html` — Chart.js examples (useful when adding new visualizations).
- `animation.js` — IntersectionObserver + requestAnimationFrame pattern that updates CSS custom properties.
- `style.css` and `Fonts/font.css` — layout, custom fonts, and the CSS that reads `--p`.

## Examples (do this, and why)
- To add a new chart page:
  - Copy `piechart1.html` and update the inline `data` object; keep the Chart.js CDN import.
  - Verify legend/tooltip options match existing pages for consistent UX.
- To tweak the animation:
  - Modify `animation.js` only for intersection and update frequency; modify `style.css` if you change how `--p` is consumed.
- To add fonts or images:
  - Put WOFF2 files in `Fonts/` and reference them from `Fonts/font.css`.
  - Put images in `Images/` and reference them using the same capitalization (`Images/` folder is used by the site).

## Safe edit rules for agents
- Keep edits minimal and localized — these are static pages used for presentation. Large refactors (introducing frameworks, build tools) require an explicit plan and README updates.
- Preserve text placeholders about character counts unless the user asks to change content requirements.
- When updating paths, test by running a local server and opening the modified HTML in a browser.

## When to ask the human maintainer
- If you plan to add a build step (npm/Yarn/pnpm) or CI, ask maintainers before adding `package.json` or workflow files.
- If content constraints (character counts) need changing, confirm intended new limits.

---
If anything above is unclear or you'd like me to expand examples (e.g., show a minimal HTML->module conversion or add a local server script), tell me which area to expand. I can iterate on this file based on your feedback.
