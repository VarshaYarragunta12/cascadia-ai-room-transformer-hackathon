import { useFlow } from '../context/FlowContext.jsx'
import { activeVariant } from '../data/products.js'
import { useToast } from '../components/Toast.jsx'

export default function Save() {
  const { photos, generatedImageUrl, plan, styles, colorMood, goTo } = useFlow()
  const toast = useToast()

  const previewImage = generatedImageUrl || photos[0]?.url || null
  const total = plan.reduce((sum, p) => (p.owned ? sum : sum + activeVariant(p).price), 0)
  const styleLabel = styles.join(' · ') || 'Your'

  // ── Download as PDF — uses the browser's print-to-PDF (no dependency) ──
  const downloadPdf = () => {
    toast('Opening print dialog — choose "Save as PDF" 📄')
    setTimeout(() => window.print(), 400)
  }

  // ── Copy a shareable link ──
  const copyLink = async () => {
    // Placeholder share URL — the backend would return a real one.
    const url = `${window.location.origin}/plan/${Math.random().toString(36).slice(2, 9)}`
    try {
      await navigator.clipboard.writeText(url)
      toast('Link copied to clipboard 🔗')
    } catch {
      toast('Copy failed — your browser blocked it')
    }
  }

  // ── Save the before/after image ──
  const saveImage = () => {
    if (!previewImage) {
      toast('No image yet — connect the AI backend to generate one 🖼')
      return
    }
    const a = document.createElement('a')
    a.href = previewImage
    a.download = 'my-room-plan.jpg'
    document.body.appendChild(a)
    a.click()
    a.remove()
    toast('Image saved 🖼')
  }

  return (
    <div className="slide s6">
      <div className="blob s6-blob-a" />
      <div className="blob s6-blob-b" />
      <div className="blob s6-blob-c" />

      <div className="s6-layout">
        <div className="s6-left">
          <div className="s6-eyebrow"><span>🎉</span> Done!</div>
          <h2 className="s6-headline">Your room<br />plan is ready</h2>
          <p className="s6-sub">
            Save it, share it, or come back and shop from it whenever you're ready.
            The plan stays yours.
          </p>

          <div className="s6-preview">
            <div className="s6-preview-img">
              {previewImage ? (
                <img className="s6-preview-photo" src={previewImage} alt="Room preview" />
              ) : (
                <>
                  <div className="s6-mini-floor" />
                  <div className="s6-mini-sofa" />
                  <div className="s6-mini-plant" />
                  <div className="s6-mini-lamp" />
                </>
              )}
            </div>
            <div className="s6-preview-meta">
              <div>
                <div className="s6-preview-title">{styleLabel} Living Room</div>
                <div className="s6-preview-subtitle">
                  {plan.length} items · 91% cohesion · {colorMood} palette
                </div>
              </div>
              <div className="s6-preview-total">${total}</div>
            </div>
          </div>

          <button className="btn-outline" style={{ width: '100%' }} onClick={() => goTo(4)}>
            ← Back to results
          </button>
        </div>

        <div className="s6-right">
          <div className="s6-options-title">How do you want to save it?</div>
          <div className="s6-options">
            <button className="s6-option" onClick={downloadPdf}>
              <div className="s6-option-icon oi-pdf">📄</div>
              <div className="s6-option-body">
                <div className="s6-option-label">Download as PDF</div>
                <div className="s6-option-desc">
                  Room photo + full shopping list with prices and links in one
                  document — save it, print it, come back to it anytime.
                </div>
              </div>
              <div className="s6-option-arrow">›</div>
            </button>

            <button className="s6-option" onClick={copyLink}>
              <div className="s6-option-icon oi-link">🔗</div>
              <div className="s6-option-body">
                <div className="s6-option-label">Copy shareable link</div>
                <div className="s6-option-desc">
                  Send the full plan to a partner or friend. All buy links load
                  instantly — perfect for when you're ready to purchase this week.
                </div>
              </div>
              <div className="s6-option-arrow">›</div>
            </button>

            <button className="s6-option" onClick={saveImage}>
              <div className="s6-option-icon oi-share">🖼</div>
              <div className="s6-option-body">
                <div className="s6-option-label">Save before/after image</div>
                <div className="s6-option-desc">
                  Download the side-by-side transformation image. Made for
                  Instagram, Close Friends, or TikTok room makeover content.
                </div>
              </div>
              <div className="s6-option-arrow">›</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
