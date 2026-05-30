import { useFlow } from '../context/FlowContext.jsx'

export default function Hero() {
  const { goTo } = useFlow()

  return (
    <div className="slide s1">
      <div className="blob s1-blob-a" />
      <div className="blob s1-blob-b" />
      <div className="blob s1-blob-c" />
      <div className="blob s1-blob-d" />

      <div className="s1-layout">
        <div className="s1-left">
          <div className="s1-eyebrow">AI Room Transformer</div>
          <h1 className="s1-headline">
            Your pieces<br />don't talk to<br />each other.
          </h1>
          <p className="s1-sub">
            Upload a photo of your room. We find real products that match your
            style and budget — then show you how your room looks before you buy a
            single thing.
          </p>

          <div className="s1-cta-row">
            <button className="btn-dark" onClick={() => goTo(1)}>
              Transform my room →
            </button>
            <button className="btn-outline" onClick={() => goTo(1)}>
              See how it works
            </button>
          </div>

          <div className="s1-proof">
            <div className="s1-avatars">
              <div className="s1-av" style={{ background: 'var(--coral)' }} />
              <div className="s1-av" style={{ background: 'var(--blue)' }} />
              <div className="s1-av" style={{ background: 'var(--green)' }} />
              <div className="s1-av" style={{ background: 'var(--yellow)' }} />
            </div>
            <div className="s1-proof-text">
              <strong>2,400+ rooms transformed</strong> this week<br />
              No account needed · free to try
            </div>
          </div>
        </div>

        <div className="s1-right">
          <div className="s1-ba-wrap">
            <div className="s1-ba-panel s1-ba-before">
              <div className="ba-floor" />
              <div className="ba-sofa" />
              <div className="s1-ba-label-pill">Before</div>
            </div>
            <div className="s1-ba-panel s1-ba-after">
              <div className="ba-floor2" />
              <div className="ba-rug2" />
              <div className="ba-sofa2" />
              <div className="ba-plant2" />
              <div className="ba-lamp2" />
              <div className="s1-ba-label-pill">After</div>
            </div>
          </div>

          <div className="s1-stat-row">
            <div className="s1-stat">
              <div className="s1-stat-num">91%</div>
              <div className="s1-stat-label">cohesion score</div>
            </div>
            <div className="s1-stat">
              <div className="s1-stat-num">$252</div>
              <div className="s1-stat-label">spent of $350 budget</div>
            </div>
            <div className="s1-stat">
              <div className="s1-stat-num">8</div>
              <div className="s1-stat-label">matched products</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
