// ── Backend wiring ──────────────────────────────────────────────────
// Connects the UI to the real services:
//   P3 Product Curator (Node/Express)  → POST /curate-products
//   P2 Room Generator  (Java/Bedrock)  → POST /api/v1/generate-room
// Override the URLs with VITE_CURATOR_URL / VITE_ROOMGEN_URL if needed.

const CURATOR_URL = import.meta.env.VITE_CURATOR_URL || 'http://localhost:4000'
const ROOMGEN_URL = import.meta.env.VITE_ROOMGEN_URL || 'http://localhost:8080'

// P2 (Bedrock) inpaints a publicly-fetchable "before" room image. The user's
// uploaded photo is a browser blob the AWS side can't reach, so we use a public
// sample room as the base. Swap this for a real hosted URL when available.
const SAMPLE_ROOM_IMAGE =
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1024'

// Map the FlowContext state → the userPreferences shape the backends expect.
export function buildPreferences(flow) {
  const items = flow.items && flow.items.length ? flow.items : ['floor lamp', 'rug', 'wall art']
  return {
    items,
    style: flow.styles || [],
    colors: flow.colors || [],
    vibe: flow.colorMood || 'cozy minimalist',
    budget: flow.budget || 250,
  }
}

// P3 — scrape + curate. Returns { status, scrapedProducts, result, ... }.
export async function curate(prefs, roomImageBase64 = null) {
  const body = { userPreferences: prefs }
  if (roomImageBase64) body.roomImageBase64 = roomImageBase64
  const res = await fetch(`${CURATOR_URL}/curate-products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || (data.status && data.status !== 'success')) {
    throw new Error(data.message || `curate failed (HTTP ${res.status})`)
  }
  return data
}

// P2 — generate the "after" image. `products` should be the CURATED picks so
// the render reflects the recommendation. We send only the clean string fields
// P2's DTO expects (no bulky `raw` blob, no array-typed fields).
export async function generateRoom(prefs, products, roomImageUrl) {
  const clean = (products || []).slice(0, 10).map((p) => ({
    name: p.name || null,
    image: typeof p.image === 'string' ? p.image : null,
    category: typeof p.category === 'string' ? p.category : null,
    brand: p.brand || p.source || null,
    typeName: p.typeName || null,
  })).filter((p) => p.name)
  const body = {
    userPreferences: prefs,
    roomData: {
      roomImageUrl: roomImageUrl || SAMPLE_ROOM_IMAGE,
      roomType: 'living room',
      styleInference: (prefs.style && prefs.style[0]) || 'minimalist',
      colorPalette: prefs.colors,
      vibe: prefs.vibe,
      overallBudget: prefs.budget,
    },
    scrapedProducts: clean,
  }
  const res = await fetch(`${ROOMGEN_URL}/api/v1/generate-room`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(`generate failed (HTTP ${res.status}) ${t.slice(0, 120)}`)
  }
  const blob = await res.blob()
  return URL.createObjectURL(blob)
}

const EMOJIS = {
  lighting: '💡', mirror: '🪞', plants: '🌿', plant: '🌿', rug: '🪞',
  furniture: '🛋', decor: '🖼', 'wall art': '🖼', textiles: '🧶', storage: '🧺',
}
const COLORS = ['var(--coral)', 'var(--yellow)', 'var(--lav)', 'var(--blue)', 'var(--green)', 'var(--pink)']

// Map the curator's picks → the product shape Results.jsx renders.
export function mapPlan(result) {
  const picks = [result.topPick, ...(result.supportingPicks || [])].filter(Boolean)
  return picks.map((p, i) => {
    const slug = String(p.name || 'item')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 32)
    return {
      id: `${slug || 'item'}-${i}`,
      emoji: EMOJIS[String(p.category || '').toLowerCase()] || '🛍',
      color: COLORS[i % COLORS.length],
      owned: false,
      url: p.url || null,
      image: p.image || null,
      variants: [{ name: p.name || 'Item', why: p.reason || '', price: Math.round(Number(p.price) || 0) }],
      variantIndex: 0,
    }
  })
}
