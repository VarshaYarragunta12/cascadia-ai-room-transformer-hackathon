import { useFlow } from '../context/FlowContext.jsx'

const STEPS = ['Upload', 'Budget + Style', 'AI Magic', 'Results', 'Save']

export default function ProgressBar() {
  const { current, goTo } = useFlow()

  // Slide 0 = Hero (bar hidden). Slides 1–5 map to steps 0–4.
  const hidden = current === 0
  const flowStep = current - 1

  return (
    <div className={'progress-bar' + (hidden ? ' hidden' : '')}>
      <div className="pb-steps">
        {STEPS.map((label, i) => {
          const cls =
            'pb-step' + (i === flowStep ? ' active' : i < flowStep ? ' done' : '')
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
              {i > 0 && (
                <div className={'pb-connector' + (i - 1 < flowStep ? ' done' : '')} />
              )}
              <div className={cls} onClick={() => goTo(i + 1)}>
                <div className="pb-step-num">{i + 1}</div>
                <div className="pb-step-label">{label}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
