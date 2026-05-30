import { useEffect, useState } from 'react'
import { useFlow } from '../context/FlowContext.jsx'

const STEPS = [
  { icon: '🔍', label: 'Reading your room', desc: 'Detecting colours, layout and existing furniture.' },
  { icon: '🎨', label: 'Matching your style', desc: 'Lining up products with your style & palette.' },
  { icon: '🛍', label: 'Finding real products', desc: 'Searching live catalogues for pieces that fit.' },
  { icon: '💰', label: 'Checking your budget', desc: 'Spreading spend across what matters most.' },
]

const STEP_MS = 1100

export default function Loading() {
  const { current, goTo } = useFlow()
  const [activeStep, setActiveStep] = useState(0)

  // Only run the sequence while this slide is on screen.
  useEffect(() => {
    if (current !== 3) {
      setActiveStep(0)
      return
    }

    // ── BACKEND HOOK ───────────────────────────────────────────────
    // This is where you call the AI service. Replace the timed sequence
    // below with your real request, e.g.:
    //
    //   const result = await generateRoom({ photos, budget, styles, ... })
    //   setGeneratedImageUrl(result.imageUrl)
    //   setPlan(result.products)
    //   goTo(4)
    //
    // For now we simulate the steps so the flow is clickable.
    let step = 0
    const tick = setInterval(() => {
      step += 1
      if (step < STEPS.length) {
        setActiveStep(step)
      } else {
        clearInterval(tick)
        goTo(4)
      }
    }, STEP_MS)

    return () => clearInterval(tick)
  }, [current, goTo])

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
