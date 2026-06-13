import { useState, useEffect } from 'react'
import Editor from '../components/Editor'

export default function Topic({ id, topics, onBack, onDelete, onSelectTopic, theme: t }) {
  const [topic, setTopic] = useState(null)
  const [links, setLinks] = useState([])
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [title, setTitle] = useState('')
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [linkTarget, setLinkTarget] = useState('')
  const [linkRel, setLinkRel] = useState('')

  const load = async () => {
    const tp = await window.nexus.getTopic(id)
    const l = await window.nexus.getLinks(id)
    setTopic(tp)
    setTitle(tp.title)
    setContent(tp.content || '')
    setTags(tp.tags || '')
    setLinks(l)
  }

  useEffect(() => { load() }, [id])

  const save = () => window.nexus.updateTopic(id, content, tags, title)
  const saveTitle = (val) => window.nexus.updateTopic(id, content, tags, val)

  const addLink = async () => {
    if (!linkTarget || !linkRel) return
    await window.nexus.createLink(id, parseInt(linkTarget), linkRel)
    setShowLinkModal(false)
    setLinkTarget('')
    setLinkRel('')
    load()
  }

  const removeLink = async (linkId) => {
    await window.nexus.deleteLink(linkId)
    load()
  }

  const handleDelete = async () => {
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      await window.nexus.deleteTopic(id)
      onBack()
    }
  }

  if (!topic) return <div style={{ padding: '32px', color: t.text3 }}>Loading...</div>

  const otherTopics = topics.filter(tp => tp.id !== id && !links.find(l => l.to_id === tp.id || l.from_id === tp.id))

  const inputStyle = {
    width: '100%',
    background: t.inputBg,
    border: `1px solid ${t.inputBorder}`,
    borderRadius: '7px',
    padding: '8px 12px',
    color: t.inputColor,
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
  }

  const sectionStyle = {
    background: t.bg2,
    border: `1px solid ${t.border}`,
    borderRadius: '10px',
    padding: '16px',
    marginBottom: '14px',
  }

  const sectionLabel = {
    fontSize: '10px',
    color: t.text3,
    letterSpacing: '1.5px',
    fontWeight: 600,
    marginBottom: '10px',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{
        height: '48px',
        borderBottom: `1px solid ${t.topbarBorder}`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: '8px',
        flexShrink: 0,
        background: t.bg,
      }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', color: t.text3,
          cursor: 'pointer', fontSize: '13px', fontFamily: 'Inter, sans-serif',
        }}>
          ← Topics
        </button>
        <span style={{ color: t.border }}>/</span>
        <span style={{ fontSize: '13px', color: t.accent, fontWeight: 500 }}>{title}</span>

        <button onClick={handleDelete} style={{
          marginLeft: 'auto',
          background: 'none',
          border: '1px solid transparent',
          color: t.text3,
          fontSize: '12px',
          padding: '5px 12px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
          transition: 'all 0.12s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#cc3333'; e.currentTarget.style.color = '#cc3333' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = t.text3 }}
        >
          Delete
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '28px', maxWidth: '680px' }}>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={e => saveTitle(e.target.value)}
          style={{
            fontSize: '22px', fontWeight: 600, color: t.text1,
            background: 'none', border: 'none', outline: 'none',
            width: '100%', marginBottom: '8px', fontFamily: 'Inter, sans-serif',
          }}
        />

        <div style={{ fontSize: '11px', color: t.text4, marginBottom: '24px' }}>
          {new Date(topic.created_at).toLocaleDateString()}
        </div>

        <div style={sectionStyle}>
          <div style={sectionLabel}>NOTES</div>
          <Editor
            content={content}
            onChange={(html) => { setContent(html); window.nexus.updateTopic(id, html, tags, title) }}
            theme={t}
          />
        </div>

        <div style={sectionStyle}>
          <div style={sectionLabel}>TAGS</div>
          <input
            value={tags}
            onChange={e => setTags(e.target.value)}
            onBlur={save}
            placeholder="chemistry, grade-11, atomic-structure"
            style={inputStyle}
          />
        </div>

        <div style={sectionStyle}>
          <div style={sectionLabel}>LINKED TOPICS</div>

          {links.length === 0 && (
            <div style={{ color: t.text4, fontSize: '13px', marginBottom: '12px' }}>No links yet.</div>
          )}

          {links.map(l => (
            <div key={l.id} style={{
              background: t.linkCardBg,
              border: `1px solid ${t.linkCardBorder}`,
              borderRadius: '8px',
              padding: '11px 14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              marginBottom: '8px',
            }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: t.accent, marginTop: '5px', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div
                  onClick={() => onSelectTopic(l.from_id === id ? l.to_id : l.from_id)}
                  style={{ fontSize: '13px', color: t.accent2, fontWeight: 500, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  {l.to_title}
                </div>
                <div style={{ fontSize: '11px', color: t.text3, marginTop: '3px', lineHeight: '1.5' }}>{l.relationship}</div>
              </div>
              <button onClick={() => removeLink(l.id)} style={{
                background: 'none', border: 'none', color: t.text3,
                cursor: 'pointer', fontSize: '16px', lineHeight: 1,
              }}>×</button>
            </div>
          ))}

          <button onClick={() => setShowLinkModal(true)} style={{
            background: t.addLinkBg,
            border: `1px dashed ${t.addLinkBorder}`,
            color: t.addLinkColor,
            fontSize: '12px',
            padding: '8px 14px',
            borderRadius: '7px',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '4px',
          }}>
            + Add Link
          </button>
        </div>
      </div>

      {showLinkModal && (
        <div style={{
          position: 'fixed', inset: 0, background: '#00000066',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
          <div style={{
            background: t.modalBg,
            border: `1px solid ${t.modalBorder}`,
            borderRadius: '12px',
            padding: '24px',
            width: '400px',
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: t.text1, marginBottom: '16px' }}>
              Link to a topic
            </div>
            <select value={linkTarget} onChange={e => setLinkTarget(e.target.value)}
              style={{ ...inputStyle, marginBottom: '10px' }}>
              <option value=''>Select a topic...</option>
              {otherTopics.map(tp => <option key={tp.id} value={tp.id}>{tp.title}</option>)}
            </select>
            <input
              value={linkRel}
              onChange={e => setLinkRel(e.target.value)}
              placeholder="How are they related? e.g. 1 amu = 1/Nₐ grams"
              style={{ ...inputStyle, marginBottom: '16px' }}
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowLinkModal(false)} style={{
                background: 'none', border: `1px solid ${t.border}`, color: t.text3,
                padding: '8px 16px', borderRadius: '7px', cursor: 'pointer',
                fontSize: '12px', fontFamily: 'Inter, sans-serif',
              }}>Cancel</button>
              <button onClick={addLink} style={{
                background: t.newBtnBg, border: `1px solid ${t.newBtnBorder}`, color: t.accent2,
                padding: '8px 16px', borderRadius: '7px', cursor: 'pointer',
                fontSize: '12px', fontFamily: 'Inter, sans-serif',
              }}>Link</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}