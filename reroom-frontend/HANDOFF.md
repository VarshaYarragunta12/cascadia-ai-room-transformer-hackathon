# Handoff — AI Room Transformer Frontend

_Last updated: 2026-05-30_

## What this is

A complete, working **React + Vite** frontend for the AI Room Transformer,
converted from the desktop wireframe (`wireframe-desktop.html`). The whole
6-screen flow is clickable end-to-end with placeholder data, and every button
works. It's ready to hand to the team.

Local folder: `reroom-frontend/`

## Status: ✅ Done & verified

Built and tested end-to-end (real photo upload → results → save) in the browser.
`npm run build` passes clean.

| # | Screen | Works |
|---|--------|-------|
| 1 | Hero | Both CTAs enter the flow |
| 2 | Upload | Real drag-drop / file picker, thumbnail previews, remove, per-photo label, "start fresh" skip |
| 3 | Budget + Style | Live budget slider, priority-ranked item picker (+ custom), style picker (max 3), colour mood + specific colours |
| 4 | AI Loading | Animated steps, auto-advances — **backend hook point** |
| 5 | Results | Shows the user's uploaded photo, live budget math, favourite (♥), swap (↻), "View" opens shopping search, expand/collapse |
| 6 | Save | Download PDF (print-to-PDF), copy share link (clipboard), save image, back to results |

All user choices live in `src/context/FlowContext.jsx` and travel across every
screen. Look is ported 1:1 from the wireframe.

## How to run

```bash
cd reroom-frontend
npm install
npm run dev      # opens http://localhost:5173
```

Requires Node 18+. (Note: this app uses React 18 + Vite 5.)

## How to connect the AI backend

Two integration points, both documented in `README.md`:

1. **`src/slides/Loading.jsx`** — replace the simulated timer with the real
   `generateRoom(...)` call; set `generatedImageUrl` (the AI "after" image) and
   `plan` (the products), then `goTo(4)`.
2. **`src/data/products.js`** — return products in the documented shape.

Until then, Results shows the user's uploaded photo as a stand-in, with a note
marking where the generated image appears.

## ⚠️ Important finding — there are TWO frontend folders

While preparing to push, I found a **second, separate React app** sitting
untracked inside the team repo clone at `_their-repo/frontend/`:

- It's **React 19** with `api.js`, `screens/`, `components/`, `data/`.
- Its `screens/` files are **empty (0 bytes)** and `api.js` is empty — it looks
  like an unfinished scaffold.
- It is **not committed to any branch** (main, design-system, Front-end all lack
  a frontend folder) — it only exists locally on this machine.

**Decision needed:** confirm whether that scaffold can be superseded by this
finished app (`reroom-frontend/`) before pushing, so we don't discard a
teammate's in-progress work by accident.

## Where it's going

Target: `MansaPatidar/room-transformer`, branch **`Front-end`**, into a
`frontend/` folder. That branch currently has **no** frontend folder, so adding
ours is safe. (The repo convention is one top-level folder per component:
`ProductCurator/`, `roomgen-service/`, → `frontend/`.)

## Open items / next steps

- [ ] Confirm the two-frontends question above.
- [ ] Push `reroom-frontend/` → `Front-end` branch under `frontend/`.
- [ ] Add the logo to the app's top-left (source file `logo.html` is currently
      **empty** — need the real logo, likely from `logo-design.html`).
- [ ] (Later) Mobile/responsive pass — desktop is done first by request.
- [ ] (Later) Wire up the real AI backend at the two hook points.

## Git state

`reroom-frontend/` is its own local git repo, committed on `main`:
`AI Room Transformer frontend — full clickable React flow from wireframe`.
Not yet pushed to any remote.
