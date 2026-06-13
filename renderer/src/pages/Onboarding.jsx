export default function Onboarding({ theme: t, onStart }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: t.bg,
      flexDirection: 'column',
      gap: '0',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '480px', padding: '32px' }}>

        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '11px', color: t.text3, letterSpacing: '3px', marginBottom: '12px' }}>WELCOME TO</div>
          <div style={{ fontSize: '48px', fontWeight: 700, color: t.text1, letterSpacing: '6px', fontFamily: 'Inter, sans-serif' }}>NEXUS</div>
          <div style={{ fontSize: '13px', color: t.text3, marginTop: '8px', letterSpacing: '1px' }}>your knowledge, connected</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
          {[
            ['◎', 'Create topics', 'Each topic is a concept, idea, or note'],
            ['⟶', 'Link them', 'Connect topics and describe how they relate'],
            ['⬡', 'See the graph', 'Watch your knowledge map grow visually'],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{
              background: t.bg2,
              border: `1px solid ${t.border}`,
              borderRadius: '10px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
              textAlign: 'left',
            }}>
              <span style={{ fontSize: '20px', color: t.accent, flexShrink: 0, marginTop: '1px' }}>{icon}</span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: t.text1, marginBottom: '2px' }}>{title}</div>
                <div style={{ fontSize: '12px', color: t.text3, lineHeight: '1.5' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onStart}
          style={{
            background: t.newBtnBg,
            border: `1px solid ${t.newBtnBorder}`,
            color: t.accent2,
            fontSize: '14px',
            fontWeight: 500,
            padding: '12px 36px',
            borderRadius: '9px',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '0.5px',
            transition: 'all 0.15s',
            width: '100%',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.accent }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = t.newBtnBorder; e.currentTarget.style.color = t.accent2 }}
        >
          Start building →
        </button>

        <div style={{ fontSize: '11px', color: t.text4, marginTop: '16px' }}>
          Your data stays on your Mac. Always.
        </div>
      </div>
    </div>
  )
}