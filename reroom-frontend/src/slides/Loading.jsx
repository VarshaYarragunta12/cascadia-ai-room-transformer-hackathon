import { useEffect, useRef, useState } from 'react'
import { useFlow } from '../context/FlowContext.jsx'
import { buildPreferences, curate, mapPlan } from '../api.js'

const STEPS = [
  { icon: '🔍', label: 'Reading your room', desc: 'Detecting colours, layout and existing furniture.' },
  { icon: '🎨', label: 'Matching your style', desc: 'Lining up products with your style & palette.' },
  { icon: '🛍', label: 'Finding real products', desc: 'Searching live catalogues for pieces that fit.' },
  { icon: '💰', label: 'Checking your budget', desc: 'Spreading spend across what matters most.' },
]

const STEP_MS = 1100

export default function Loading() {
  const flow = useFlow()
  const { current, goTo, setPlan, setGeneratedImageUrl } = flow
  const [activeStep, setActiveStep] = useState(0)
  const [error, setError] = useState(null)
  const ranRef = useRef(false)

  // Only run while this slide is on screen.
  useEffect(() => {
    if (current !== 3) {
      setActiveStep(0)
      ranRef.current = false
      return
    }
    if (ranRef.current) return // guard against re-entry
    ranRef.current = true
    setError(null)

    // Advance the step animation up to the last step and hold there while
    // the real (slower) backend call runs.
    let step = 0
    const tick = setInterval(() => {
      step = Math.min(step + 1, STEPS.length - 1)
      setActiveStep(step)
    }, STEP_MS)

    let cancelled = false

    // ── REAL BACKEND CALL: P3 curate → P2 generate ─────────────────
    ;(async () => {
      try {
        const prefs = buildPreferences(flow)

        // Convert the user's uploaded photo to base64 so the server can
        // pass it directly to Bedrock as the inpainting base image.
        let roomImageBase64 = null
        if (flow.photos && flow.photos[0]) {
          try {
            const res = await fetch(flow.photos[0].url)
            const blob = await res.blob()
            roomImageBase64 = await new Promise((resolve) => {
              const reader = new FileReader()
              reader.onloadend = () => resolve(reader.result.split(',')[1])
              reader.readAsDataURL(blob)
            })
          } catch (e) {
            console.warn('Could not encode photo:', e)
          }
        }

        const curated = await curate(prefs, roomImageBase64)
        const result = curated.result || {}
        const plan = mapPlan(result)

        if (cancelled) return
        if (plan.length) setPlan(plan)
        if (result.generatedImage) setGeneratedImageUrl(result.generatedImage)
      } catch (e) {
        console.error('AI pipeline failed:', e)
        if (!cancelled) setError(e.message || 'Something went wrong')
      } finally {
        if (!cancelled) {
          clearInterval(tick)
          goTo(4) // advance to Results either way
        }
      }
    })()

    return () => {
      cancelled = true
      clearInterval(tick)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])

  return (
    <div className="slide s4">
      <div className="blob s4-blob-a" />
      <div className="blob s4-blob-b" />
      <div className="blob s4-blob-c" />

      <div className="s4-layout">
        <div className="s4-orb-wrap">
          <div className="s4-orb">
            <div className="s4-orb-inner">✦</div>
          </div>
        </div>

        <div>
          <div className="s4-headline">Working on your room…</div>
          <div className="s4-sub">Finding real pieces that match your style &amp; budget.</div>
        </div>

        <div className="s4-steps">
          {STEPS.map((s, i) => {
            const cls =
              's4-step' + (i < activeStep ? ' done' : i === activeStep ? ' active' : '')
            return (
              <div className={cls} key={s.label}>
                <div className="s4-step-icon-wrap">{i < activeStep ? '✓' : s.icon}</div>
                <div className="s4-step-label">{s.label}</div>
                <div className="s4-step-desc">{s.desc}</div>
              </div>
            )
          })}
        </div>

        <div className="s4-blocks">
          <div className="s4-block" />
          <div className="s4-block" />
          <div className="s4-block" />
          <div className="s4-block" />
          <div className="s4-block" />
          <div className="s4-block" />
        </div>
      </div>
    </div>
  )
}
