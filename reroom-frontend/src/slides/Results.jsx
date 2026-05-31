import { useState } from 'react'
import { useFlow } from '../context/FlowContext.jsx'
import { activeVariant } from '../data/products.js'
import { useToast } from '../components/Toast.jsx'

export default function Results() {
  const {
    photos, generatedImageUrl, budget, plan, swapProduct,
    favorites, toggleFavorite, styles, goTo,
  } = useFlow()
  const toast = useToast()

  const [expanded, setExpanded] = useState(false)
  const [spinning, setSpinning] = useState(null)

  const roomImage = generatedImageUrl || photos[0]?.url || null

  // Budget math from the live plan
  const spent = plan.reduce((sum, p) => {
    if (p.owned) return sum
    return sum + activeVariant(p).price
  }, 0)
  const fillPct = Math.min(100, (spent / budget) * 100)
  const over = spent > budget

  const visible = expanded ? plan : plan.slice(0, 4)
  const styleLabel = styles.join(' · ') || 'Your'

  const handleSwap = (id) => {
    setSpinning(id)
    swapProduct(id)
    setTimeout(() => setSpinning(null), 350)
  }

  const handleView = (name) => {
    window.open(
      'https://www.google.com/search?tbm=shop&q=' + encodeURIComponent(name),
      '_blank',
      'noopener',
    )
  }

  return (
    <div className="slide s5">
      <div className="blob s5-blob-a" />
      <div className="blob s5-blob-b" />

      <div className="s5-layout">
        {/* LEFT — room photo */}
        <div className="s5-photo-panel">
          {roomImage ? (
            <img className="s5-photo-img" src={roomImage} alt="Your room" />
          ) : (
            <div className="s5-room-scene">
              <div className="s5-wall" />
              <div className="s5-floor" />
              <div className="s5-rug" />
              <div className="s5-sofa">
                <div className="s5-sofa-arm-l" />
                <div className="s5-sofa-arm-r" />
              </div>
              <div className="s5-plant" />
              <div className="s5-lamp" />
              <div className="s5-art">🖼</div>
            </div>
          )}

          <div className="s5-photo-overlay">
            <div className="s5-transformed-badge">✦ Your room, transformed</div>
            <div
              className="s5-cohesion-badge"
              title="Cohesion score: how well these pieces work together as one look — colour harmony, style match and scale."
            >
              <span>91%</span> cohesion score ⓘ
            </div>
          </div>

          {/* Marks the spot where the AI-generated image plugs in */}
          {!generatedImageUrl && (
            <div className="s5-ai-note">
              <span>✦</span>
              <div>
                <strong>AI image goes here.</strong>{' '}
                {roomImage ? 'Showing your uploaded photo' : 'Showing a sample room'} for
                now — the generated "after" render drops in once the backend is connected.
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — products */}
        <div className="s5-product-panel">
          <div className="s5-panel-title">Results · {plan.length} products found</div>
          <div className="s5-panel-headline">Your {styleLabel} room plan</div>

          <div className="s5-budget-row">
            <div className="s5-budget-track">
              <div
                className={'s5-budget-fill' + (over ? ' over' : '')}
                style={{ width: fillPct + '%' }}
              />
            </div>
            <div className="s5-budget-label">
              ${spent} of ${budget}
            </div>
          </div>

          <div className="s5-refine-bar">
            <div className="s5-refine-text">
              <strong>Not quite right?</strong> Swap any item below, or re-run with a
              different budget or style.
            </div>
            <button className="s5-refine-btn" onClick={() => goTo(2)}>
              Adjust &amp; re-run ↻
            </button>
          </div>

          {visible.map((p) => {
            const v = activeVariant(p)
            const fav = favorites.has(p.id)
            return (
              <div className="s5-product" key={p.id}>
                <div className="s5-product-thumb" style={{ background: p.color }}>
                  {p.image
                    ? <img src={p.image} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} onError={e => { e.target.style.display = 'none' }} />
                    : p.emoji}
                </div>
                <div className="s5-product-body">
                  <div className="s5-product-name">{v.name}</div>
                  <div className="s5-product-why">{v.why}</div>
                  <div className="s5-product-row">
                    <div className="s5-product-price">
                      {p.owned ? (
                        <>$0 <span style={{ fontSize: 11, color: 'var(--mid)' }}>already own</span></>
                      ) : (
                        '$' + v.price
                      )}
                    </div>
                    <div className="s5-product-actions">
                      <button
                        className={'s5-swap' + (spinning === p.id ? ' spinning' : '')}
                        title={p.owned ? 'You own this' : 'Swap — show me another option'}
                        onClick={() => !p.owned && handleSwap(p.id)}
                      >
                        {p.owned ? '✕' : '↻'}
                      </button>
                      <button
                        className={'s5-heart' + (fav ? ' active' : '')}
                        title={fav ? 'Saved' : 'Save to favourites'}
                        onClick={() => toggleFavorite(p.id)}
                      >
                        {fav ? '♥' : '♡'}
                      </button>
                      {!p.owned && (
                        <button className="s5-buy-btn" onClick={() => handleView(v.name)}>
                          View →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {plan.length > 4 && (
            <button className="s5-more" onClick={() => setExpanded((e) => !e)}>
              {expanded ? '↑ Show fewer items' : `+ ${plan.length - 4} more items ↓`}
            </button>
          )}

          <button className="s5-save-btn" onClick={() => goTo(5)}>
            Save my room plan →
          </button>
        </div>
      </div>
    </div>
  )
}
