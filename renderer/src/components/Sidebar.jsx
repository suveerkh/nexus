import { BsDiagram3, BsDownload, BsUpload } from 'react-icons/bs'

export default function Sidebar({
  topics, activeTopicId, activePage, onSelectTopic, onNewTopic,
  onHome, onGraph, onExport, onImport, theme: t,
  dragOverId, onDragStart, onDragOver, onDrop, onDragEnd,
  clusters = [],
}) {
  return (
    <aside style={{
      width: '260px',
      background: t.sidebarBg,
      borderRight: `1px solid ${t.border}`,
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      height: '100vh',
    }}>
      <div onClick={onHome} style={{
        padding: '24px 20px 18px',
        borderBottom: `1px solid ${t.border}`,
        cursor: 'pointer',
      }}>
        <div style={{ fontSize: '17px', fontWeight: 600, color: t.text1, letterSpacing: '3px' }}>NEXUS</div>
        <div style={{ fontSize: '11px', color: t.text3, marginTop: '3px', letterSpacing: '1px' }}>knowledge graph</div>
      </div>

      <div style={{ padding: '12px 14px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <button onClick={onNewTopic} style={{
          background: t.newBtnBg, border: `1px solid ${t.newBtnBorder}`,
          color: t.accent2, fontSize: '13px', fontWeight: 500,
          padding: '10px 14px', borderRadius: '8px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '7px',
          fontFamily: 'Inter, sans-serif', transition: 'all 0.12s',
        }}>
          + New Topic
        </button>

        <button onClick={onGraph} style={{
          background: activePage === 'graph' ? t.newBtnBg : 'none',
          border: activePage === 'graph' ? `1px solid ${t.newBtnBorder}` : `1px solid ${t.border}`,
          color: activePage === 'graph' ? t.accent2 : t.text3,
          fontSize: '13px', fontWeight: 500,
          padding: '10px 14px', borderRadius: '8px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '7px',
          fontFamily: 'Inter, sans-serif', transition: 'all 0.12s',
        }}>
          <BsDiagram3 size={14} /> Graph View
        </button>
      </div>

      <div style={{
        fontSize: '11px', color: t.text3,
        padding: '16px 20px 8px', letterSpacing: '1.5px', fontWeight: 600,
      }}>
        TOPICS
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px 16px' }}>
        {topics.length === 0 && (
          <div style={{ fontSize: '13px', color: t.text4, padding: '8px 12px' }}>
            No topics yet.
          </div>
        )}
        {topics.map(topic => (
          <div
            key={topic.id}
            draggable
            onDragStart={e => onDragStart(e, topic.id)}
            onDragOver={e => onDragOver(e, topic.id)}
            onDrop={e => onDrop(e, topic.id)}
            onDragEnd={onDragEnd}
            onClick={() => onSelectTopic(topic.id)}
            style={{
              padding: '9px 12px', borderRadius: '7px', cursor: 'grab',
              display: 'flex', alignItems: 'center', marginBottom: '2px',
              background: dragOverId === topic.id
                ? t.border
                : activeTopicId === topic.id ? t.newBtnBg : 'transparent',
              borderLeft: activeTopicId === topic.id ? `2px solid ${t.accent}` : '2px solid transparent',
              transition: 'all 0.12s',
              opacity: dragOverId === topic.id ? 0.7 : 1,
            }}
            onMouseEnter={e => { if (activeTopicId !== topic.id && dragOverId !== topic.id) e.currentTarget.style.background = t.bg3 }}
            onMouseLeave={e => { if (activeTopicId !== topic.id && dragOverId !== topic.id) e.currentTarget.style.background = 'transparent' }}
          >
            {(() => {
              const cluster = topic.cluster_id ? clusters.find(c => c.id === topic.cluster_id) : null
              return (
                <>
                  {cluster && (
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: cluster.color, flexShrink: 0, marginRight: '6px' }} />
                  )}
                  <span style={{
                    fontSize: '13px', fontWeight: 500,
                    color: activeTopicId === topic.id ? t.accent2 : t.text2,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    userSelect: 'none',
                  }}>
                    {topic.title}
                  </span>
                </>
              )
            })()}
          </div>
        ))}
      </div>

      <div style={{
        padding: '10px 14px',
        borderTop: `1px solid ${t.border}`,
        display: 'flex',
        gap: '6px',
      }}>
        <button onClick={onExport} style={{
          flex: 1, background: 'none', border: `1px solid ${t.border}`,
          color: t.text3, fontSize: '12px', padding: '7px 10px',
          borderRadius: '7px', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
          transition: 'all 0.12s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.accent2 }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.text3 }}
        >
          <BsDownload size={12} /> Export
        </button>
        <button onClick={onImport} style={{
          flex: 1, background: 'none', border: `1px solid ${t.border}`,
          color: t.text3, fontSize: '12px', padding: '7px 10px',
          borderRadius: '7px', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
          transition: 'all 0.12s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.accent2 }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.text3 }}
        >
          <BsUpload size={12} /> Import
        </button>
      </div>

      <div style={{
        padding: '10px 16px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}>
        {[
          ['⌘N', 'New topic'],
          ['⌘G', 'Graph view'],
          ['⌘F', 'Search'],
          ['⌘E', 'Export'],
          ['Esc', 'Go home'],
        ].map(([key, label]) => (
          <div key={key} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: '11px', color: t.text4 }}>{label}</span>
            <span style={{
              fontSize: '10px', color: t.text3,
              background: t.bg3, border: `1px solid ${t.border}`,
              borderRadius: '4px', padding: '1px 5px', fontFamily: 'monospace',
            }}>{key}</span>
          </div>
        ))}
      </div>
    </aside>
  )
}