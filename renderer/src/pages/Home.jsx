export default function Home({ topics, onSelectTopic, theme: t }) {
  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 600, color: t.text1, marginBottom: '4px' }}>
          Your Knowledge
        </h1>
        <p style={{ color: t.text3, fontSize: '13px' }}>
          {topics.length} topic{topics.length !== 1 ? 's' : ''} · click any to open
        </p>
      </div>

      {topics.length === 0 && (
        <div style={{
          textAlign: 'center', color: t.text4, fontSize: '14px',
          marginTop: '80px', lineHeight: '2',
        }}>
          No topics yet.<br />
          Hit "+ New Topic" to start building your knowledge graph.
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '12px',
      }}>
        {topics.map(topic => (
          <div key={topic.id} onClick={() => onSelectTopic(topic.id)} style={{
            background: t.bg2,
            border: `1px solid ${t.border}`,
            borderRadius: '10px',
            padding: '16px',
            cursor: 'pointer',
            transition: 'border-color 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = t.accent}
            onMouseLeave={e => e.currentTarget.style.borderColor = t.border}
          >
            <div style={{ fontSize: '13px', fontWeight: 500, color: t.text1, marginBottom: '6px' }}>
              {topic.title}
            </div>
            <div style={{ fontSize: '11px', color: t.text4, marginBottom: '8px' }}>
              {new Date(topic.created_at).toLocaleDateString()}
            </div>
            {topic.content && (
              <div style={{
                fontSize: '11px', color: t.text3, marginBottom: '8px',
                lineHeight: '1.5', overflow: 'hidden',
                display: '-webkit-box', WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}>
                {topic.content.replace(/<[^>]+>/g, '').slice(0, 100)}
              </div>
            )}
            {topic.tags && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {topic.tags.split(',').filter(Boolean).map(tag => (
                  <span key={tag} style={{
                    background: t.newBtnBg, color: t.accent, fontSize: '10px',
                    padding: '2px 7px', borderRadius: '4px',
                    border: `1px solid ${t.newBtnBorder}`, fontWeight: 500,
                  }}>
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}