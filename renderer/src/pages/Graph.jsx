import { useEffect, useRef, useState } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import { BsFullscreenExit } from 'react-icons/bs'

export default function Graph({ topics, onSelectTopic, onBack, theme: t }) {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] })
  const [hoveredNode, setHoveredNode] = useState(null)
  const [hoveredLink, setHoveredLink] = useState(null)
  const [editingLink, setEditingLink] = useState(null)
  const [editRel, setEditRel] = useState('')
  const fgRef = useRef()

  useEffect(() => {
    const loadGraph = async () => {
      const allLinks = await window.nexus.getAllLinks()

      const nodes = topics.map((topic) => ({
        id: topic.id,
        name: topic.title,
        tags: topic.tags,
      }))

      const links = allLinks.map((l) => ({
        id: l.id,
        source: l.from_id,
        target: l.to_id,
        relationship: l.relationship,
      }))

      setGraphData({ nodes, links })
    }

    if (topics.length > 0) loadGraph()
  }, [topics])

  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      setTimeout(() => {
        fgRef.current.zoomToFit(600, 120)
      }, 800)
    }
  }, [graphData])

  const handleLinkClick = (link) => {
    setEditingLink(link)
    setEditRel(link.relationship || '')
  }

  const saveRelationship = async () => {
    if (!editingLink) return
    await window.nexus.updateLink(editingLink.id, editRel)
    setEditingLink(null)
    setEditRel('')
    const allLinks = await window.nexus.getAllLinks()
    const links = allLinks.map((l) => ({
      id: l.id,
      source: l.from_id,
      target: l.to_id,
      relationship: l.relationship,
    }))
    setGraphData((prev) => ({ ...prev, links }))
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        background: t.bg,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '28px',
          left: '32px',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: t.bg2,
            border: `1px solid ${t.border}`,
            color: t.text3,
            cursor: 'pointer',
            fontSize: '13px',
            fontFamily: 'Inter, sans-serif',
            padding: '6px 14px',
            borderRadius: '7px',
          }}
        >
          ← Back
        </button>

        <div>
          <div
            style={{
              fontSize: '15px',
              fontWeight: 600,
              color: t.text1,
              letterSpacing: '2px',
            }}
          >
            GRAPH VIEW
          </div>
          <div style={{ fontSize: '11px', color: t.text3, marginTop: '2px' }}>
            {graphData.nodes.length} topics · {graphData.links.length}{' '}
            connections
          </div>
        </div>
      </div>

      {hoveredNode && !editingLink && (
        <div
          style={{
            position: 'absolute',
            bottom: '32px',
            left: '32px',
            zIndex: 10,
            background: t.bg2,
            border: `1px solid ${t.border}`,
            borderRadius: '10px',
            padding: '14px 18px',
            maxWidth: '280px',
          }}
        >
          <div
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: t.accent2,
              marginBottom: '4px',
            }}
          >
            {hoveredNode.name}
          </div>
          {hoveredNode.tags && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '4px',
                marginTop: '6px',
              }}
            >
              {hoveredNode.tags
                .split(',')
                .filter(Boolean)
                .map((tag) => (
                  <span
                    key={tag}
                    style={{
                      background: t.newBtnBg,
                      color: t.accent,
                      fontSize: '10px',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      border: `1px solid ${t.newBtnBorder}`,
                    }}
                  >
                    {tag.trim()}
                  </span>
                ))}
            </div>
          )}
          <div style={{ fontSize: '11px', color: t.text3, marginTop: '8px' }}>
            Click to open topic
          </div>
        </div>
      )}

      {hoveredLink && !editingLink && (
        <div
          style={{
            position: 'absolute',
            bottom: '32px',
            right: '32px',
            zIndex: 10,
            background: t.bg2,
            border: `1px solid ${t.border}`,
            borderRadius: '10px',
            padding: '14px 18px',
            maxWidth: '280px',
          }}
        >
          <div
            style={{ fontSize: '11px', color: t.text3, marginBottom: '4px' }}
          >
            CONNECTION · click to edit
          </div>
          <div style={{ fontSize: '13px', color: t.text2, lineHeight: '1.5' }}>
            {hoveredLink.relationship || 'No description'}
          </div>
        </div>
      )}

      {editingLink && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: '#00000066',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div
            style={{
              background: t.modalBg,
              border: `1px solid ${t.modalBorder}`,
              borderRadius: '12px',
              padding: '24px',
              width: '420px',
            }}
          >
            <div
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: t.text1,
                marginBottom: '6px',
              }}
            >
              Edit connection
            </div>
            <div
              style={{ fontSize: '12px', color: t.text3, marginBottom: '16px' }}
            >
              {
                graphData.nodes.find(
                  (n) => n.id === (editingLink.source?.id || editingLink.source)
                )?.name
              }
              {' → '}
              {
                graphData.nodes.find(
                  (n) => n.id === (editingLink.target?.id || editingLink.target)
                )?.name
              }
            </div>
            <input
              value={editRel}
              onChange={(e) => setEditRel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveRelationship()
                if (e.key === 'Escape') setEditingLink(null)
              }}
              placeholder="Describe the relationship..."
              autoFocus
              style={{
                width: '100%',
                background: t.inputBg,
                border: `1px solid ${t.inputBorder}`,
                borderRadius: '7px',
                padding: '8px 12px',
                color: t.inputColor,
                fontSize: '13px',
                outline: 'none',
                fontFamily: 'Inter, sans-serif',
                marginBottom: '16px',
              }}
            />
            <div
              style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={() => setEditingLink(null)}
                style={{
                  background: 'none',
                  border: `1px solid ${t.border}`,
                  color: t.text3,
                  padding: '8px 16px',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveRelationship}
                style={{
                  background: t.newBtnBg,
                  border: `1px solid ${t.newBtnBorder}`,
                  color: t.accent2,
                  padding: '8px 16px',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {graphData.nodes.length === 0 ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: t.text4,
            fontSize: '14px',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ fontSize: '32px', opacity: 0.3 }}>◎</div>
          <div>No topics yet — create some and link them to see the graph.</div>
        </div>
      ) : (
        <ForceGraph2D
          ref={fgRef}
          width={window.innerWidth - 260}
          height={window.innerHeight}
          graphData={graphData}
          backgroundColor={t.bg}
          nodeLabel=""
          nodeColor={(node) =>
            hoveredNode?.id === node.id ? t.accent : t.accent2
          }
          nodeRelSize={6}
          linkColor={(link) => (hoveredLink === link ? t.accent : t.border)}
          linkWidth={(link) => (hoveredLink === link ? 2.5 : 1.5)}
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={1}
          linkDirectionalArrowColor={(link) =>
            hoveredLink === link ? t.accent : t.border
          }
          onNodeClick={(node) => onSelectTopic(node.id)}
          onNodeHover={(node) => setHoveredNode(node)}
          onLinkClick={handleLinkClick}
          onLinkHover={(link) => setHoveredLink(link)}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const fontSize = Math.max(11, 13 / globalScale)
            const isHovered = hoveredNode?.id === node.id

            ctx.beginPath()
            ctx.arc(node.x, node.y, isHovered ? 8 : 5, 0, 2 * Math.PI)
            ctx.fillStyle = isHovered ? t.accent : t.accent2
            ctx.fill()

            if (isHovered) {
              ctx.beginPath()
              ctx.arc(node.x, node.y, 12, 0, 2 * Math.PI)
              ctx.strokeStyle = t.accent + '33'
              ctx.lineWidth = 3
              ctx.stroke()
            }

            ctx.font = `${fontSize}px Inter, sans-serif`
            ctx.fillStyle = t.text2
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(node.name, node.x, node.y + 18)
          }}
          cooldownTicks={80}
          d3AlphaDecay={0.03}
          d3VelocityDecay={0.4}
          minZoom={0.3}
          maxZoom={3}
        />
      )}
      <button
        onClick={() => fgRef.current?.zoomToFit(400, 120)}
        title="Recenter graph"
        style={{
          position: 'absolute',
          bottom: '80px',
          right: '24px',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: t.bg2,
          border: `1px solid ${t.border}`,
          color: t.text3,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          zIndex: 10,
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = t.accent
          e.currentTarget.style.color = t.accent
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = t.border
          e.currentTarget.style.color = t.text3
        }}
      >
        <BsFullscreenExit size={16} />
      </button>
    </div>
  )
}
