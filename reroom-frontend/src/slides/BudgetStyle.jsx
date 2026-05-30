import { useState } from 'react'
import {
  useFlow, STYLE_OPTIONS, COLOR_MOODS, COLOR_DOTS, PRESET_ITEMS, MAX_STYLES,
} from '../context/FlowContext.jsx'

export default function BudgetStyle() {
  const {
    budget, setBudget,
    items, toggleItem, addCustomItem, removeItem,
    styles, toggleStyle,
    colorMood, setColorMood,
    colors, toggleColor,
    goTo,
  } = useFlow()

  const [customText, setCustomText] = useState('')

  const budgetLabel = budget >= 1000 ? '$1,000+' : '$' + budget
  const pct = ((budget - 50) / (1000 - 50)) * 100
  const sliderBg = `linear-gradient(to right, var(--yellow) ${pct}%, #333 ${pct}%)`

  const submitCustom = () => {
    if (addCustomItem(customText)) setCustomText('')
  }

  // preset items that aren't already chosen via a preset slot are shown as
  // dark "custom" pills below the input
  const customOnly = items.filter((i) => !PRESET_ITEMS.includes(i))

  const summary =
    items.length === 0
      ? ''
      : items.length === 1
      ? <>Must-have: <strong>{items[0]}</strong></>
      : <>Must-have: <strong>{items[0]}</strong> &nbsp;·&nbsp; then {items.slice(1).join(', ')}</>

  const hintColors = colors.length ? ' · ' + colors.join(' · ') : ''

  return (
    <div className="slide s3">
      <div className="blob s3-blob-a" />
      <div className="blob s3-blob-b" />

      <div className="s3-layout">
        {/* LEFT — budget */}
        <div className="s3-left">
          <div className="s3-eyebrow">Budget + style</div>
          <h2 className="s3-headline">Budget first,<br />then vibe</h2>
          <p className="s3-sub">
            We lock in your budget before anything else — so we only ever show you
            things you can actually buy.
          </p>

          <div className="s3-budget-card">
            <div className="s3-budget-label">A &nbsp; Your budget</div>
            <div className="s3-budget-amount">
              {budgetLabel} <em>max</em>
            </div>
            <input
              type="range"
              className="s3-budget-slider"
              min="50"
              max="1000"
              step="10"
              value={budget}
              style={{ background: sliderBg }}
              onChange={(e) => setBudget(parseInt(e.target.value, 10))}
            />
            <div className="s3-slider-range"><span>$50</span><span>$1,000+</span></div>
          </div>

          <div className="s3-budget-hint">
            💡 &nbsp;We'll spread your budget across the items that matter most —
            big pieces first.
          </div>
        </div>

        {/* RIGHT — items, style, colour */}
        <div className="s3-right">
          {/* B. Items */}
          <div className="s3-section-block">
            <div className="s3-section-label">
              B &nbsp; What do you want to add?
              <span className="s3-section-sublabel">
                Tap in order of priority — first tap = most important
              </span>
            </div>

            <div className="s3-items-grid">
              {PRESET_ITEMS.map((item) => {
                const rank = items.indexOf(item)
                const selected = rank !== -1
                return (
                  <div
                    key={item}
                    className={'s3-item-pill' + (selected ? ' selected' : '')}
                    onClick={() => toggleItem(item)}
                  >
                    {item}
                    {selected && <div className="s3-item-badge">{rank + 1}</div>}
                  </div>
                )
              })}
            </div>

            <div className="s3-item-input-row">
              <input
                className="s3-custom-input"
                type="text"
                placeholder="Something else? e.g. bedside lamp, TV unit…"
                maxLength={40}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submitCustom() } }}
              />
              <button className="s3-add-btn" title="Add item" onClick={submitCustom}>+</button>
            </div>

            {customOnly.length > 0 && (
              <div className="s3-items-grid" style={{ marginTop: 12 }}>
                {customOnly.map((item) => {
                  const rank = items.indexOf(item)
                  return (
                    <div className="s3-custom-pill" key={item}>
                      {item}
                      <div className="s3-custom-pill-badge">{rank + 1}</div>
                      <button
                        className="s3-custom-pill-remove"
                        title="Remove"
                        onClick={() => removeItem(item)}
                      >
                        ✕
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="s3-item-summary">{summary}</div>
          </div>

          {/* C. Style */}
          <div className="s3-section-block">
            <div className="s3-section-label">
              C &nbsp; Style
              <span className="s3-section-sublabel">Pick up to {MAX_STYLES}</span>
            </div>
            <div className="s3-pill-grid">
              {STYLE_OPTIONS.map((style) => {
                const selected = styles.includes(style)
                const atMax = !selected && styles.length >= MAX_STYLES
                return (
                  <div
                    key={style}
                    className={'s3-pill' + (selected ? ' selected' : '')}
                    style={atMax ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
                    onClick={() => toggleStyle(style)}
                  >
                    {style}
                  </div>
                )
              })}
            </div>
          </div>

          {/* D. Colour */}
          <div className="s3-section-block">
            <div className="s3-section-label">D &nbsp; Color Preference</div>
            <div className="s3-section-sublabel" style={{ marginBottom: 0 }}>
              Pick a mood, then optionally choose specific colors
            </div>

            <div className="s3-color-moods">
              {COLOR_MOODS.map((mood) => {
                const selected = colorMood === mood.name
                return (
                  <button
                    key={mood.name}
                    className={'s3-mood-card' + (selected ? ' selected' : '')}
                    onClick={() => setColorMood(mood.name)}
                  >
                    <div className="s3-mood-swatch" style={{ backgroundColor: mood.swatch }} />
                    <div className="s3-mood-info">
                      <div className="s3-mood-name">{mood.name}</div>
                      <div className="s3-mood-sub">{mood.sub}</div>
                      {selected && <div className="s3-mood-tick">✓ Selected</div>}
                    </div>
                  </button>
                )
              })}
            </div>

            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--mid)', marginBottom: 8 }}>
              Specific colors{' '}
              <span style={{ fontWeight: 400, color: 'var(--light)' }}>(optional, pick any)</span>
            </div>
            <div className="s3-color-dots">
              {COLOR_DOTS.map((c) => {
                const selected = colors.includes(c.name)
                return (
                  <div
                    key={c.name}
                    className={'s3-color-dot-pill' + (selected ? ' selected' : '')}
                    onClick={() => toggleColor(c.name)}
                  >
                    <div
                      className="s3-color-dot"
                      style={{ background: c.hex, ...(c.border ? { border: '1px solid #D0C8B8' } : {}) }}
                    />
                    {c.name}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="s3-cta-row">
            <button className="btn-dark" onClick={() => goTo(3)}>Find my style →</button>
            <div className="s3-selected-hint">
              <strong>{styles.join(' · ') || 'No style yet'}</strong>
              {' · '}{colorMood}{hintColors}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
