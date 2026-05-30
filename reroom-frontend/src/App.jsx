import { useEffect } from 'react'
import { useFlow, TOTAL_SLIDES } from './context/FlowContext.jsx'
import { ToastProvider } from './components/Toast.jsx'
import ProgressBar from './components/ProgressBar.jsx'
import Hero from './slides/Hero.jsx'
import Upload from './slides/Upload.jsx'
import BudgetStyle from './slides/BudgetStyle.jsx'
import Loading from './slides/Loading.jsx'
import Results from './slides/Results.jsx'
import Save from './slides/Save.jsx'

const isTyping = (el) =>
  el && ['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName)

export default function App() {
  const { current, goTo, navigate } = useFlow()

  // Keyboard navigation (ignored while typing in a field)
  useEffect(() => {
    const onKey = (e) => {
      if (isTyping(e.target)) return
      if (e.key === 'ArrowRight') navigate(1)
      if (e.key === 'ArrowLeft') navigate(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])

  return (
    <ToastProvider>
      <ProgressBar />

      <div className="slideshow">
        <div
          className="slides-track"
          style={{ transform: `translateX(-${current * 100}vw)` }}
        >
          <Hero />
          <Upload />
          <BudgetStyle />
          <Loading />
          <Results />
          <Save />
        </div>
      </div>

      <button
        className="nav-btn prev"
        onClick={() => navigate(-1)}
        disabled={current === 0}
        aria-label="Previous"
      >
        ←
      </button>
      <button
        className="nav-btn next"
        onClick={() => navigate(1)}
        disabled={current === TOTAL_SLIDES - 1}
        aria-label="Next"
      >
        →
      </button>

      <div className="dots">
        {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
          <button
            key={i}
            className={'dot' + (i === current ? ' active' : '')}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </ToastProvider>
  )
}
