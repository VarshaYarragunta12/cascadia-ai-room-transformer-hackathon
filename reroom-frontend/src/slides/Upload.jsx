import { useRef, useState } from 'react'
import { useFlow, PHOTO_LABELS } from '../context/FlowContext.jsx'

export default function Upload() {
  const {
    photos, addPhotos, removePhoto, setPhotoLabel,
    startingFresh, setStartingFresh, goTo,
  } = useFlow()

  const fileInputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const openPicker = () => fileInputRef.current?.click()

  const onFiles = (e) => {
    if (e.target.files?.length) addPhotos(e.target.files)
    e.target.value = '' // allow re-selecting the same file
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files?.length) addPhotos(e.dataTransfer.files)
  }

  const skipFresh = (e) => {
    e.preventDefault()
    setStartingFresh(true)
    goTo(2)
  }

  const canContinue = photos.length > 0 || startingFresh
  const continueLabel = startingFresh
    ? 'Continue — starting fresh →'
    : `Continue with ${photos.length} ${photos.length === 1 ? 'photo' : 'photos'} →`

  return (
    <div className="slide s2">
      <div className="blob s2-blob-a" />
      <div className="blob s2-blob-b" />
      <div className="blob s2-blob-c" />

      <div className="s2-layout">
        <div className="s2-header">
          <div className="s2-eyebrow">Upload your room</div>
          <h2 className="s2-headline">Show us your space</h2>
          <p className="s2-sub">
            Any photo of your room works. Messy is fine — we just need to see the
            colours, furniture and layout to get started.
          </p>
        </div>

        <div className="s2-grid">
          {/* LEFT: upload + uploaded-photo feedback */}
          <div className="s2-left">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={onFiles}
            />

            <div
              className={'s2-upload-zone' + (dragging ? ' dragging' : '')}
              onClick={openPicker}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >
              <div className="s2-upload-icon">📷</div>
              <div>
                <div className="s2-upload-label">Drag &amp; drop, or tap to upload</div>
                <div className="s2-upload-hint" style={{ textAlign: 'center', marginTop: 4 }}>
                  JPG, PNG or HEIC · up to 20MB · add a few angles
                </div>
              </div>
            </div>

            {/* uploaded photos + add tile */}
            <div className="s2-thumbs">
              {photos.map((p) => (
                <div className="s2-thumb" key={p.id}>
                  <img className="s2-thumb-img" src={p.url} alt={p.label} />
                  <div className="s2-thumb-badge">✓</div>
                  <button
                    className="s2-thumb-remove"
                    title="Remove"
                    onClick={() => removePhoto(p.id)}
                  >
                    ✕
                  </button>
                  <div className="s2-thumb-label">
                    <select
                      value={p.label}
                      onChange={(e) => setPhotoLabel(p.id, e.target.value)}
                    >
                      {PHOTO_LABELS.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                    <span className="chev">▾</span>
                  </div>
                </div>
              ))}

              <div className="s2-thumb add" onClick={openPicker}>
                <div className="s2-thumb-add-icon">+</div>
                <div className="s2-thumb-add-label">Add photo</div>
              </div>
            </div>

            <div className="s2-fresh-row">
              Moving into an empty space?{' '}
              <a onClick={skipFresh}>Skip — I'm starting from scratch →</a>
            </div>

            <button className="btn-dark" disabled={!canContinue} onClick={() => goTo(2)}>
              {continueLabel}
            </button>
          </div>

          {/* RIGHT: photo tips */}
          <div className="s2-right">
            <div className="s2-tip-card">
              <div className="s2-tip-title">What makes a good photo</div>

              <div className="s2-tip-item">
                <div className="s2-tip-icon-wrap">☀️</div>
                <div>
                  <div className="s2-tip-label">Natural light helps</div>
                  <div className="s2-tip-text-body">
                    Stand by a window for a clearer shot. Lamps on is totally fine too.
                  </div>
                </div>
              </div>
              <div className="s2-tip-item">
                <div className="s2-tip-icon-wrap">📐</div>
                <div>
                  <div className="s2-tip-label">Capture the whole wall</div>
                  <div className="s2-tip-text-body">
                    Step back so we can see most of the room — corners and walls
                    matter for scale.
                  </div>
                </div>
              </div>
              <div className="s2-tip-item">
                <div className="s2-tip-icon-wrap">✅</div>
                <div>
                  <div className="s2-tip-label">Messy is genuinely fine</div>
                  <div className="s2-tip-text-body">
                    You don't need to stage anything. We're reading colour and
                    structure, not judging cleanliness.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
