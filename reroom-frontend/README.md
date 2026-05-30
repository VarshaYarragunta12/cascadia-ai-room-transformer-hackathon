# AI Room Transformer — Frontend

A React + Vite single-page app for the AI Room Transformer flow. Upload a room
photo, set a budget and style, get a shoppable room plan, and save/share it.

The whole flow is **clickable end-to-end with placeholder data** so you can
demo it today. The two spots that need the real AI backend are clearly marked
in the code (see [Connecting the backend](#connecting-the-backend)).

## Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:5173 (it opens automatically).

Other commands:

```bash
npm run build     # production build into /dist
npm run preview   # preview the production build
```

Requires Node 18+.

## The flow (6 screens)

| # | Screen | What works now |
|---|--------|----------------|
| 1 | **Hero** | Both CTAs jump into the flow |
| 2 | **Upload** | Real drag-and-drop / file picker, thumbnail previews, remove, per-photo label, "start fresh" skip |
| 3 | **Budget + Style** | Live budget slider, priority-ranked item picker (+ custom items), style picker (max 3), colour mood + specific colours |
| 4 | **AI Loading** | Animated processing steps, then auto-advances → **this is where the AI call goes** |
| 5 | **Results** | Shows the user's uploaded photo, live budget math, favourite (♥), swap (↻) for alternatives, "View" opens a shopping search, expand/collapse list |
| 6 | **Save** | Download as PDF (browser print-to-PDF), copy shareable link (clipboard), save image, back to results |

Navigate with the arrow buttons, dots, the top progress bar, or ← / → keys.

## Project structure

```
src/
  App.jsx                 # slideshow shell: nav, dots, keyboard, progress bar
  context/FlowContext.jsx # ALL shared state (photos, budget, style, plan, favourites)
  data/products.js        # placeholder product data + swap variants
  components/             # ProgressBar, Toast
  slides/                 # Hero, Upload, BudgetStyle, Loading, Results, Save
  styles/global.css       # design tokens + all styling (ported from the wireframe)
```

All user choices live in **`FlowContext`** and travel across every screen, so
the budget / style / photo the user picks show up on the Results and Save screens.

## Connecting the backend

There are exactly **two** integration points:

### 1. Generate the room + plan — `src/slides/Loading.jsx`

Inside the `useEffect`, replace the simulated step timer with the real call:

```js
const result = await generateRoom({ photos, budget, styles, colors, colorMood, items })
setGeneratedImageUrl(result.imageUrl) // the AI "after" image
setPlan(result.products)              // array shaped like data/products.js
goTo(4)
```

`setGeneratedImageUrl` and `setPlan` are available from `useFlow()`.

### 2. Product shape — `src/data/products.js`

Return products in this shape so the Results screen renders them unchanged:

```js
{
  id: 'sofa',
  emoji: '🛋',          // or swap the thumbnail for a real <img>
  color: 'var(--coral)',
  owned: false,
  variants: [            // ↻ swap cycles through these
    { name: 'Linen Accent Sofa', why: 'Why it fits…', price: 189 },
  ],
}
```

Until then, the Results screen shows the user's **uploaded photo** as a stand-in
for the generated image, with a small note marking where the AI render appears.

## Notes

- Built with plain CSS (no UI framework) so the wireframe look is preserved exactly.
- No accounts, no analytics, no external calls except the "View" shopping search.
- Uploaded photos stay in the browser (object URLs) — nothing is sent anywhere yet.
