import { useEffect, useRef, useState, useCallback } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import { BsFullscreenExit } from 'react-icons/bs'

// ── Union-Find for connected components ──────────────────────────────────────
function computeClusters(nodes, links) {
  const parent = {}
  const rank = {}

  nodes.forEach(n => { parent[n.id] = n.id; rank[n.id] = 0 })

  function find(x) {
    if (parent[x] !== x) parent[x] = find(parent[x])
    return parent[x]
  }

  function union(a, b) {
    const ra = find(a), rb = find(b)
    if (ra === rb) return
    if (rank[ra] < rank[rb]) parent[ra] = rb
    else if (rank[ra] > rank[rb]) parent[rb] = ra
    else { parent[rb] = ra; rank[ra]++ }
  }

  links.forEach(l => {
    const src = typeof l.source === 'object' ? l.source.id : l.source
    const tgt = typeof l.target === 'object' ? l.target.id : l.target
    if (parent[src] !== undefined && parent[tgt] !== undefined) union(src, tgt)
  })

  const rootToIndex = {}
  let nextIndex = 0
  nodes.forEach(n => {
    const root = find(n.id)
    if (rootToIndex[root] === undefined) rootToIndex[root] = nextIndex++
  })

  const clusterMap = {}
  nodes.forEach(n => { clusterMap[n.id] = rootToIndex[find(n.id)] })
  return clusterMap
}

// ── Cluster palette ───────────────────────────────────────────────────────────
const CLUSTER_COLORS = [
  '#4a7fff', '#a78bfa', '#34d399', '#fb923c', '#f472b6',
  '#38bdf8', '#facc15', '#f87171', '#2dd4bf', '#c084fc',
]

function getClusterColor(clusterId, alpha = 1) {
  const hex = CLUSTER_COLORS[clusterId % CLUSTER_COLORS.length]
  if (alpha === 1) return hex
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function computeHubs(nodes, links, clusterMap) {
  const degree = {}
  nodes.forEach(n => { degree[n.id] = 0 })
  links.forEach(l => {
    const src = typeof l.source === 'object' ? l.source.id : l.source
    const tgt = typeof l.target === 'object' ? l.target.id : l.target
    if (degree[src] !== undefined) degree[src]++
    if (degree[tgt] !== undefined) degree[tgt]++
  })

  const hubMap = {}
  nodes.forEach(n => {
    const cid = clusterMap[n.id]
    if (!hubMap[cid] || degree[n.id] > degree[hubMap[cid].id]) hubMap[cid] = n
  })
  return hubMap
}

function computeClusterSizes(nodes, clusterMap) {
  const sizes = {}
  nodes.forEach(n => {
    const cid = clusterMap[n.id]
    sizes[cid] = (sizes[cid] || 0) + 1
  })
  return sizes
}

export default function Graph({ topics, onSelectTopic, onBack, theme: t }) {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] })
  const [hoveredNode, setHoveredNode] = useState(null)
  const [hoveredLink, setHoveredLink] = useState(null)
  const [clusterMap, setClusterMap] = useState({})
  const [hubMap, setHubMap] = useState({})
  const [clusterSizes, setClusterSizes] = useState({})
  const [selectedCluster, setSelectedCluster] = useState(null)
  const [clusterNames, setClusterNames] = useState({}) // cid → custom name
  const [clusterColors, setClusterColors] = useState({}) // cid → custom color
  // Context menu
  const [ctxMenu, setCtxMenu] = useState(null) // { x, y, node, cid }
  const ctxRef = useRef()
  // Rename modal
  const [renameModal, setRenameModal] = useState(null) // { cid, currentName }
  const [renameValue, setRenameValue] = useState('')
  const [renameColor, setRenameColor] = useState('')
  const fgRef = useRef()

  useEffect(() => {
    const loadGraph = async () => {
      const allLinks = await window.nexus.getAllLinks()
      const nodes = topics.map(topic => ({ id: topic.id, name: topic.title, tags: topic.tags }))
      const links = allLinks.map(l => ({ id: l.id, source: l.from_id, target: l.to_id, relationship: l.relationship }))
      const cm = computeClusters(nodes, links)
      const hm = computeHubs(nodes, links, cm)
      const cs = computeClusterSizes(nodes, cm)
      setClusterMap(cm); setHubMap(hm); setClusterSizes(cs)
      setGraphData({ nodes, links })
    }
    if (topics.length > 0) loadGraph()
  }, [topics])

  const handleEngineStop = useCallback(() => {
    if (graphData.nodes.length === 0) return
    const cm = computeClusters(graphData.nodes, graphData.links)
    const hm = computeHubs(graphData.nodes, graphData.links, cm)
    const cs = computeClusterSizes(graphData.nodes, cm)
    setClusterMap(cm); setHubMap(hm); setClusterSizes(cs)
  }, [graphData])

  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      setTimeout(() => fgRef.current.zoomToFit(600, 120), 800)
    }
  }, [graphData])

  // Close ctx menu on outside click or canvas click
  useEffect(() => {
    if (!ctxMenu) return
    const handler = (e) => { if (!ctxRef.current?.contains(e.target)) setCtxMenu(null) }
    document.addEventListener('mousedown', handler)
    document.addEventListener('click', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('click', handler)
    }
  }, [ctxMenu])

  const handleNodeRightClick = useCallback((node, evt) => {
    evt.preventDefault()
    const cid = clusterMap[node.id]
    setCtxMenu({ x: evt.clientX, y: evt.clientY, node, cid })
  }, [clusterMap])

  const openRename = (cid, hub) => {
    const currentName = clusterNames[cid] || hub.name
    const currentColor = clusterColors[cid] || null
    setRenameModal({ cid, currentName })
    setRenameValue(currentName)
    setRenameColor(currentColor || CLUSTER_COLORS[cid % CLUSTER_COLORS.length])
    setCtxMenu(null)
  }

  const saveRename = () => {
    if (!renameModal) return
    setClusterNames(prev => ({ ...prev, [renameModal.cid]: renameValue.trim() || undefined }))
    setClusterColors(prev => ({ ...prev, [renameModal.cid]: renameColor }))
    setRenameModal(null)
  }

  const getEffectiveColor = (cid, alpha = 1) => {
    const customHex = clusterColors[cid]
    if (!customHex) return getClusterColor(cid, alpha)
    if (alpha === 1) return customHex
    const r = parseInt(customHex.slice(1, 3), 16)
    const g = parseInt(customHex.slice(3, 5), 16)
    const b = parseInt(customHex.slice(5, 7), 16)
    return `rgba(${r},${g},${b},${alpha})`
  }

  const getClusterDisplayName = (cid, hub) => clusterNames[cid] || hub.name

  // ── Canvas renderer ───────────────────────────────────────────────────────
  const nodeCanvasObject = useCallback((node, ctx, globalScale) => {
    const cid = clusterMap[node.id]
    const isHovered = hoveredNode?.id === node.id
    const isHub = hubMap[cid]?.id === node.id
    const inSelectedCluster = selectedCluster === null || selectedCluster === cid
    const clusterSize = clusterSizes[cid] || 1
    const baseRadius = isHub ? 7 : 5
    const nodeRadius = isHovered ? baseRadius + 3 : baseRadius

    // Cluster bubble (drawn once by hub)
    if (isHub && clusterSize > 1) {
      const members = graphData.nodes.filter(n => clusterMap[n.id] === cid && n.x !== undefined)
      if (members.length > 1) {
        const cx = members.reduce((s, n) => s + n.x, 0) / members.length
        const cy = members.reduce((s, n) => s + n.y, 0) / members.length
        const maxDist = Math.max(...members.map(n => Math.sqrt((n.x - cx) ** 2 + (n.y - cy) ** 2)))
        const bubbleR = maxDist + 28

        ctx.beginPath()
        ctx.arc(cx, cy, bubbleR, 0, 2 * Math.PI)
        ctx.fillStyle = getEffectiveColor(cid, inSelectedCluster ? 0.06 : 0.02)
        ctx.fill()

        ctx.beginPath()
        ctx.arc(cx, cy, bubbleR, 0, 2 * Math.PI)
        ctx.strokeStyle = getEffectiveColor(cid, inSelectedCluster ? 0.35 : 0.1)
        ctx.lineWidth = inSelectedCluster ? 1.5 : 1
        ctx.setLineDash([4, 4])
        ctx.stroke()
        ctx.setLineDash([])

        const labelFontSize = Math.max(9, 11 / globalScale)
        ctx.font = `600 ${labelFontSize}px Inter, sans-serif`
        ctx.fillStyle = getEffectiveColor(cid, inSelectedCluster ? 0.7 : 0.25)
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const displayName = clusterNames[cid] || node.name
        ctx.fillText(displayName, cx, cy - bubbleR + labelFontSize * 1.2)
      }
    }

    const alpha = inSelectedCluster ? 1 : 0.25

    if (isHovered) {
      ctx.beginPath()
      ctx.arc(node.x, node.y, nodeRadius + 5, 0, 2 * Math.PI)
      ctx.fillStyle = getEffectiveColor(cid, 0.15)
      ctx.fill()
    }

    if (isHub && clusterSize > 1) {
      ctx.beginPath()
      ctx.arc(node.x, node.y, nodeRadius + 2, 0, 2 * Math.PI)
      ctx.strokeStyle = getEffectiveColor(cid, alpha * 0.5)
      ctx.lineWidth = 1
      ctx.stroke()
    }

    ctx.beginPath()
    ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI)
    ctx.fillStyle = cid !== undefined
      ? getEffectiveColor(cid, alpha)
      : `${t.accent2}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`
    ctx.fill()

    if (clusterSize === 1) {
      ctx.beginPath()
      ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI)
      ctx.fillStyle = t.text3 + '99'
      ctx.fill()
    }

    const fontSize = Math.max(10, 12 / globalScale)
    ctx.font = `${isHub ? '600' : '400'} ${fontSize}px Inter, sans-serif`
    ctx.fillStyle = inSelectedCluster ? (isHub ? getEffectiveColor(cid, 0.95) : t.text2) : t.text4
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(node.name, node.x, node.y + nodeRadius + fontSize * 0.9)
  }, [clusterMap, hubMap, clusterSizes, hoveredNode, selectedCluster, graphData.nodes, t, clusterNames, clusterColors])

  const uniqueClusters = Object.entries(hubMap).filter(([cid]) => clusterSizes[cid] > 1)

  const inputStyle = {
    width: '100%', background: t.inputBg, border: `1px solid ${t.inputBorder}`,
    borderRadius: '7px', padding: '8px 12px', color: t.inputColor,
    fontSize: '13px', outline: 'none', fontFamily: 'Inter, sans-serif',
    boxSizing: 'border-box', marginBottom: '12px',
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', background: t.bg, overflow: 'hidden' }}>

      {/* Top bar */}
      <div style={{
        position: 'absolute', top: '28px', left: '32px', zIndex: 10,
        display: 'flex', alignItems: 'center', gap: '20px',
      }}>
        <button onClick={onBack} style={{
          background: t.bg2, border: `1px solid ${t.border}`, color: t.text3,
          cursor: 'pointer', fontSize: '13px', fontFamily: 'Inter, sans-serif',
          padding: '6px 14px', borderRadius: '7px',
        }}>← Back</button>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: t.text1, letterSpacing: '2px' }}>GRAPH VIEW</div>
          <div style={{ fontSize: '11px', color: t.text3, marginTop: '2px' }}>
            {graphData.nodes.length} topics · {graphData.links.length} connections
            {uniqueClusters.length > 0 && ` · ${uniqueClusters.length} cluster${uniqueClusters.length !== 1 ? 's' : ''}`}
          </div>
        </div>
      </div>

      {/* Cluster legend */}
      {uniqueClusters.length > 0 && (
        <div style={{
          position: 'absolute', top: '28px', right: '24px', zIndex: 10,
          display: 'flex', flexDirection: 'column', gap: '6px',
          background: t.bg2, border: `1px solid ${t.border}`,
          borderRadius: '10px', padding: '12px 14px', maxWidth: '200px',
        }}>
          <div style={{ fontSize: '10px', color: t.text3, letterSpacing: '1.5px', fontWeight: 600, marginBottom: '4px' }}>
            CLUSTERS
          </div>
          {uniqueClusters.map(([cid, hub]) => {
            const cidNum = parseInt(cid)
            const isActive = selectedCluster === cidNum
            const displayName = getClusterDisplayName(cidNum, hub)
            return (
              <div
                key={cid}
                onClick={() => setSelectedCluster(isActive ? null : cidNum)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  cursor: 'pointer', padding: '4px 6px', borderRadius: '6px',
                  background: isActive ? getEffectiveColor(cidNum, 0.12) : 'transparent',
                  border: `1px solid ${isActive ? getEffectiveColor(cidNum, 0.4) : 'transparent'}`,
                  transition: 'all 0.15s',
                }}
              >
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                  background: getEffectiveColor(cidNum),
                }} />
                <div style={{ fontSize: '12px', color: isActive ? getEffectiveColor(cidNum) : t.text2, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {displayName}
                </div>
                <div style={{ fontSize: '10px', color: t.text3, flexShrink: 0 }}>{clusterSizes[cid]}</div>
              </div>
            )
          })}
          {selectedCluster !== null && (
            <div
              onClick={() => setSelectedCluster(null)}
              style={{ fontSize: '10px', color: t.text3, cursor: 'pointer', textAlign: 'center', marginTop: '2px', padding: '2px' }}
            >clear filter</div>
          )}
        </div>
      )}

      {/* Hovered node tooltip */}
      {hoveredNode && (
        <div style={{
          position: 'absolute', bottom: '32px', left: '32px', zIndex: 10,
          background: t.bg2, border: `1px solid ${t.border}`,
          borderRadius: '10px', padding: '14px 18px', maxWidth: '280px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            {clusterMap[hoveredNode.id] !== undefined && (
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, background: getEffectiveColor(clusterMap[hoveredNode.id]) }} />
            )}
            <div style={{ fontSize: '14px', fontWeight: 600, color: t.accent2 }}>{hoveredNode.name}</div>
          </div>
          {hoveredNode.tags && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
              {hoveredNode.tags.split(',').filter(Boolean).map(tag => (
                <span key={tag} style={{ background: t.newBtnBg, color: t.accent, fontSize: '10px', padding: '2px 7px', borderRadius: '4px', border: `1px solid ${t.newBtnBorder}` }}>
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}
          <div style={{ fontSize: '11px', color: t.text3, marginTop: '8px' }}>Click to open · right-click to customize cluster</div>
        </div>
      )}

      {/* Hovered link tooltip */}
      {hoveredLink && (
        <div style={{
          position: 'absolute', bottom: '32px', right: '32px', zIndex: 10,
          background: t.bg2, border: `1px solid ${t.border}`,
          borderRadius: '10px', padding: '14px 18px', maxWidth: '280px',
        }}>
          <div style={{ fontSize: '11px', color: t.text3, marginBottom: '4px' }}>CONNECTION</div>
          <div style={{ fontSize: '13px', color: t.text2, lineHeight: '1.5' }}>{hoveredLink.relationship || 'No description'}</div>
        </div>
      )}

      {/* Right-click context menu */}
      {ctxMenu && (
        <div ref={ctxRef} style={{
          position: 'fixed', top: ctxMenu.y, left: ctxMenu.x, zIndex: 9999,
          background: t.modalBg, border: `1px solid ${t.border}`,
          borderRadius: '8px', padding: '4px', minWidth: '170px',
          boxShadow: '0 6px 24px #00000055',
        }}>
          <div style={{ padding: '6px 12px 4px', fontSize: '10px', color: t.text3, letterSpacing: '1px' }}>
            {ctxMenu.node.name.length > 22 ? ctxMenu.node.name.slice(0, 22) + '…' : ctxMenu.node.name}
          </div>
          <div style={{ height: '1px', background: t.border, margin: '2px 0' }} />
          {ctxMenu.cid !== undefined && clusterSizes[ctxMenu.cid] > 1 ? (
            <div
              onMouseDown={() => openRename(ctxMenu.cid, hubMap[ctxMenu.cid])}
              style={{ padding: '7px 12px', fontSize: '12px', cursor: 'pointer', color: t.text2, borderRadius: '5px' }}
              onMouseEnter={e => e.currentTarget.style.background = t.bg3}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              Customize cluster…
            </div>
          ) : (
            <div style={{ padding: '7px 12px', fontSize: '12px', color: t.text4, borderRadius: '5px' }}>
              No cluster (unlinked)
            </div>
          )}
        </div>
      )}

      {/* Rename/recolor cluster modal */}
      {renameModal && (
        <div style={{
          position: 'fixed', inset: 0, background: '#00000066',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500,
        }}>
          <div style={{
            background: t.modalBg, border: `1px solid ${t.modalBorder}`,
            borderRadius: '12px', padding: '24px', width: '320px',
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: t.text1, marginBottom: '16px' }}>
              Customize cluster
            </div>
            <div style={{ fontSize: '11px', color: t.text3, marginBottom: '6px' }}>NAME</div>
            <input
              autoFocus
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveRename(); if (e.key === 'Escape') setRenameModal(null) }}
              style={inputStyle}
            />
            <div style={{ fontSize: '11px', color: t.text3, marginBottom: '8px' }}>COLOR</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {CLUSTER_COLORS.map(c => (
                <div
                  key={c}
                  onClick={() => setRenameColor(c)}
                  style={{
                    width: 24, height: 24, borderRadius: '50%', background: c, cursor: 'pointer',
                    border: renameColor === c ? `2px solid ${t.text1}` : '2px solid transparent',
                    boxSizing: 'border-box',
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setRenameModal(null)} style={{
                background: 'none', border: `1px solid ${t.border}`, color: t.text3,
                padding: '7px 14px', borderRadius: '7px', cursor: 'pointer', fontSize: '12px', fontFamily: 'Inter, sans-serif',
              }}>Cancel</button>
              <button onClick={saveRename} style={{
                background: t.newBtnBg, border: `1px solid ${t.newBtnBorder}`, color: t.accent2,
                padding: '7px 14px', borderRadius: '7px', cursor: 'pointer', fontSize: '12px', fontFamily: 'Inter, sans-serif',
              }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {graphData.nodes.length === 0 ? (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: '100%', color: t.text4, fontSize: '14px',
          flexDirection: 'column', gap: '8px',
        }}>
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
          nodeRelSize={6}
          linkColor={(link) => hoveredLink === link ? t.accent : t.border}
          linkWidth={(link) => hoveredLink === link ? 2.5 : 1.5}
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={1}
          linkDirectionalArrowColor={(link) => hoveredLink === link ? t.accent : t.border}
          onNodeClick={(node) => onSelectTopic(node.id)}
          onNodeHover={(node) => setHoveredNode(node)}
          onNodeRightClick={handleNodeRightClick}
          onBackgroundClick={() => setCtxMenu(null)}
          onLinkHover={(link) => setHoveredLink(link)}
          nodeCanvasObject={nodeCanvasObject}
          onEngineStop={handleEngineStop}
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
          position: 'absolute', bottom: '80px', right: '24px',
          width: '40px', height: '40px', borderRadius: '50%',
          background: t.bg2, border: `1px solid ${t.border}`,
          color: t.text3, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', zIndex: 10, transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.accent }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.text3 }}
      >
        <BsFullscreenExit size={16} />
      </button>
    </div>
  )
}