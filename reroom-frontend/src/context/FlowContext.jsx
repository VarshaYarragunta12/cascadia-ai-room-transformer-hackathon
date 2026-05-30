import { createContext, useContext, useState, useCallback } from 'react'
import { buildPlan } from '../data/products.js'

// ── Global flow state ───────────────────────────────────────────────
// Everything the user picks (photos, budget, style, colours, items,
// favourites) lives here so it can travel across all six screens and
// be shown back to them on the Results / Save screens.

const FlowContext = createContext(null)

export const STYLE_OPTIONS = [
  'Scandinavian', 'Wabi-Sabi', 'Minimalist', 'Industrial', 'Japandi',
  'Mid-Century', 'Bohemian', 'Quiet Luxury', 'Mediterranean', 'Maximalism',
]

export const COLOR_MOODS = [
  { name: 'Warm Neutrals', sub: 'Beige · Cream · Tan', swatch: '#CBB084' },
  { name: 'Cool Neutrals', sub: 'Sage · Slate · Grey', swatch: '#9FB7B0' },
  { name: 'Bold & Saturated', sub: 'Terracotta · Rust · Ochre', swatch: '#C06A40' },
  { name: 'Black & White', sub: 'Monochrome · Contrast', swatch: '#2E2E2E' },
]

export const COLOR_DOTS = [
  { name: 'Beige', hex: '#E8D5B0' },
  { name: 'Warm Oak', hex: '#C4956A' },
  { name: 'Sage Green', hex: '#8AADA0' },
  { name: 'Dusty Pink', hex: '#C5AEED' },
  { name: 'Charcoal', hex: '#3A3A4A' },
  { name: 'Terracotta', hex: '#C47050' },
  { name: 'Mustard', hex: '#D4A820' },
  { name: 'Forest Green', hex: '#2A6040' },
  { name: 'White', hex: '#F0EDE8', border: true },
  { name: 'Black', hex: '#1C1C1C' },
]

export const PRESET_ITEMS = [
  'Sofa', 'Coffee table', 'Rug', 'Floor lamp', 'Armchair', 'Shelf',
  'Side table', 'Wall art', 'Plant', 'Curtains', 'Mirror', 'Cushions',
]

export const PHOTO_LABELS = [
  'Living room', 'Bedroom', 'Corner detail', 'Whole wall', 'Dining area', 'Other',
]

export const TOTAL_SLIDES = 6
export const MAX_STYLES = 3

let _photoId = 0

export function FlowProvider({ children }) {
  const [current, setCurrent] = useState(0)

  // Slide 2 — uploaded photos: { id, url, label }
  const [photos, setPhotos] = useState([])
  const [startingFresh, setStartingFresh] = useState(false)

  // Slide 3 — budget / items / style / colour
  const [budget, setBudget] = useState(350)
  const [items, setItems] = useState([])              // ordered (priority)
  const [styles, setStyles] = useState(['Scandinavian', 'Japandi'])
  const [colorMood, setColorMood] = useState('Warm Neutrals')
  const [colors, setColors] = useState(['Beige', 'Warm Oak'])

  // Slide 5 — the generated plan + favourites
  const [plan, setPlan] = useState(buildPlan())
  const [favorites, setFavorites] = useState(() => new Set(['sofa', 'rug']))

  // Where the AI-generated "after" image will go once the backend is wired up.
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null)

  // ── Navigation ──
  const goTo = useCallback((n) => {
    setCurrent(Math.max(0, Math.min(TOTAL_SLIDES - 1, n)))
  }, [])
  const navigate = useCallback((dir) => {
    setCurrent((c) => Math.max(0, Math.min(TOTAL_SLIDES - 1, c + dir)))
  }, [])

  // ── Photos ──
  const addPhotos = useCallback((fileList) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'))
    if (!files.length) return
    const next = files.map((f, i) => ({
      id: ++_photoId,
      url: URL.createObjectURL(f),
      label: PHOTO_LABELS[Math.min(i, 1)],
    }))
    setPhotos((prev) => [...prev, ...next])
    setStartingFresh(false)
  }, [])
  const removePhoto = useCallback((id) => {
    setPhotos((prev) => {
      const found = prev.find((p) => p.id === id)
      if (found) URL.revokeObjectURL(found.url)
      return prev.filter((p) => p.id !== id)
    })
  }, [])
  const setPhotoLabel = useCallback((id, label) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, label } : p)))
  }, [])

  // ── Items (ordered by priority) ──
  const toggleItem = useCallback((item) => {
    setItems((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]))
  }, [])
  const addCustomItem = useCallback((raw) => {
    const val = raw.trim()
    if (!val) return false
    let added = false
    setItems((prev) => {
      if (prev.some((i) => i.toLowerCase() === val.toLowerCase())) return prev
      added = true
      return [...prev, val]
    })
    return added
  }, [])
  const removeItem = useCallback((item) => {
    setItems((prev) => prev.filter((i) => i !== item))
  }, [])

  // ── Styles (max 3) ──
  const toggleStyle = useCallback((style) => {
    setStyles((prev) => {
      if (prev.includes(style)) return prev.filter((s) => s !== style)
      if (prev.length >= MAX_STYLES) return prev
      return [...prev, style]
    })
  }, [])

  // ── Colours ──
  const toggleColor = useCallback((name) => {
    setColors((prev) => (prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]))
  }, [])

  // ── Favourites ──
  const toggleFavorite = useCallback((id) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  // ── Plan: swap a product to its next variant ──
  const swapProduct = useCallback((id) => {
    setPlan((prev) => prev.map((p) => (p.id === id ? { ...p, variantIndex: p.variantIndex + 1 } : p)))
  }, [])

  const value = {
    current, goTo, navigate,
    photos, addPhotos, removePhoto, setPhotoLabel,
    startingFresh, setStartingFresh,
    budget, setBudget,
    items, toggleItem, addCustomItem, removeItem,
    styles, toggleStyle,
    colorMood, setColorMood,
    colors, toggleColor,
    plan, swapProduct,
    favorites, toggleFavorite,
    generatedImageUrl, setGeneratedImageUrl,
  }

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>
}

export function useFlow() {
  const ctx = useContext(FlowContext)
  if (!ctx) throw new Error('useFlow must be used inside <FlowProvider>')
  return ctx
}
