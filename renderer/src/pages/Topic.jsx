import Editor from '../components/Editor'
import { useState, useEffect, useRef } from 'react'

export default function Topic({
  id,
  topics,
  onBack,
  onDelete,
  onSelectTopic,
  theme: t,
}) {
  const [topic, setTopic] = useState(null)
  const [links, setLinks] = useState([])
  const [backlinks, setBacklinks] = useState([])
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [title, setTitle] = useState('')
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [linkTarget, setLinkTarget] = useState('')
  const [linkRel, setLinkRel] = useState('')
  const [saveStatus, setSaveStatus] = useState('saved')
  const saveTimer = useRef(null)
  const tagTimer = useRef(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const load = async () => {
    const tp = await window.nexus.getTopic(id)
    const l = await window.nexus.getLinks(id)
    const bl = await window.nexus.getBacklinks(id)
    setTopic(tp)
    setTitle(tp.title)
    setContent(tp.content || '')
    setTags(tp.tags || '')
    setLinks(l)
    setBacklinks(bl)
  }

  useEffect(() => {
    load()
  }, [id])

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
    await window.nexus.deleteTopic(id)
    onBack()
  }

  if (!topic)
    return <div style={{ padding: '32px', color: t.text3 }}>Loading...</div>

  const otherTopics = topics.filter(
    (tp) =>
      tp.id !== id &&
      !links.find((l) => l.to_id === tp.id)
  )

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

  const sectionLabel = {
    fontSize: '10px',
    color: t.text3,
    letterSpacing: '1.5px',
    fontWeight: 600,
    marginBottom: '10px',
  }

  const linkCard = (onClick, key, children) => (
    <div
      key={key}
      onClick={onClick}
      style={{
        background: t.linkCardBg,
        border: `1px solid ${t.linkCardBorder}`,
        borderRadius: '8px',
        padding: '12px 14px',
        marginBottom: '8px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.accent }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.linkCardBorder }}
    >
      {children}
    </div>
  )

  const renderSnippetCard = ({ title: cardTitle, content: cardContent, tags: cardTags, relationship, dotColor, onClick, key, extra }) => {
    const plainText = cardContent ? cardContent.replace(/<[^>]+>/g, '').trim() : ''
    const snippet = plainText.length > 100 ? plainText.slice(0, 100) + '…' : plainText

    return linkCard(onClick, key, (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: snippet ? '5px' : 0 }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
          <div style={{ fontSize: '13px', color: t.accent2, fontWeight: 500, flex: 1 }}>
            {cardTitle}
          </div>
          {relationship && (
            <div style={{
              fontSize: '10px', color: t.text3,
              background: t.bg3, border: `1px solid ${t.border2}`,
              borderRadius: '4px', padding: '1px 6px', flexShrink: 0,
            }}>
              {relationship}
            </div>
          )}
          {extra}
        </div>
        {snippet && (
          <div style={{ fontSize: '12px', color: t.text2, lineHeight: '1.6', paddingLeft: '14px' }}>
            {snippet}
          </div>
        )}
        {cardTags && (
          <div style={{ paddingLeft: '14px', marginTop: '5px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {cardTags.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => (
              <span key={tag} style={{
                fontSize: '10px', color: t.text3,
                background: t.bg3, border: `1px solid ${t.border2}`,
                borderRadius: '4px', padding: '1px 6px',
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </>
    ))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>

      {/* Topbar */}
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
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: t.text3, cursor: 'pointer', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}
        >
          ← Topics
        </button>
        <span style={{ color: t.border }}>/</span>
        <span style={{ fontSize: '13px', color: t.accent, fontWeight: 500 }}>{title}</span>
        <span style={{
          fontSize: '11px',
          color: saveStatus === 'saved' ? t.text3 : t.accent,
          marginLeft: '8px',
          transition: 'color 0.2s',
        }}>
          {saveStatus === 'saved' ? '✓ Saved' : 'Saving...'}
        </span>
        <button
          onClick={() => setConfirmDelete(true)}
          style={{
            marginLeft: 'auto', background: 'none', border: '1px solid transparent',
            color: t.text3, fontSize: '12px', padding: '5px 12px', borderRadius: '6px',
            cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.12s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#cc3333'; e.currentTarget.style.color = '#cc3333' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = t.text3 }}
        >
          Delete
        </button>
      </div>

      {/* Two-column body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* LEFT — editor */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '32px 36px',
          borderRight: `1px solid ${t.border}`,
        }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={(e) => saveTitle(e.target.value)}
            style={{
              fontSize: '24px', fontWeight: 700, color: t.text1,
              background: 'none', border: 'none', outline: 'none',
              width: '100%', marginBottom: '6px', fontFamily: 'Inter, sans-serif',
            }}
          />
          <div style={{ fontSize: '11px', color: t.text4, marginBottom: '28px' }}>
            {new Date(topic.created_at).toLocaleDateString()}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={sectionLabel}>NOTES</div>
            <Editor
              content={content}
              onChange={(html) => {
                setContent(html)
                setSaveStatus('unsaved')
                clearTimeout(saveTimer.current)
                saveTimer.current = setTimeout(() => {
                  window.nexus.updateTopic(id, html, tags, title)
                  setSaveStatus('saved')
                }, 500)
              }}
              theme={t}
            />
          </div>

          <div>
            <div style={sectionLabel}>TAGS</div>
            <input
              value={tags}
              onChange={(e) => {
                setTags(e.target.value)
                setSaveStatus('unsaved')
                clearTimeout(tagTimer.current)
                tagTimer.current = setTimeout(() => {
                  window.nexus.updateTopic(id, content, e.target.value, title)
                  setSaveStatus('saved')
                }, 500)
              }}
              onBlur={save}
              placeholder="chemistry, atomic-structure"
              style={inputStyle}
            />
          </div>
        </div>

        {/* RIGHT — connections panel */}
        <div style={{
          width: '40%',
          flexShrink: 0,
          overflowY: 'auto',
          padding: '24px 20px',
          background: t.bg2,
        }}>

          {/* Linked Topics */}
          <div style={{ marginBottom: '28px' }}>
            <div style={sectionLabel}>LINKED TOPICS</div>

            {links.length === 0 && (
              <div style={{ color: t.text4, fontSize: '13px', marginBottom: '12px' }}>
                No links yet.
              </div>
            )}

            {links.map((l) => renderSnippetCard({
              key: l.id,
              title: l.to_title,
              content: l.to_content,
              tags: l.to_tags,
              relationship: l.relationship,
              dotColor: t.accent,
              onClick: () => onSelectTopic(l.to_id),
              extra: (
                <button
                  onClick={(e) => { e.stopPropagation(); removeLink(l.id) }}
                  style={{ background: 'none', border: 'none', color: t.text3, cursor: 'pointer', fontSize: '16px', lineHeight: 1, flexShrink: 0 }}
                >
                  ×
                </button>
              ),
            }))}

            <button
              onClick={() => setShowLinkModal(true)}
              style={{
                background: t.addLinkBg, border: `1px dashed ${t.addLinkBorder}`,
                color: t.addLinkColor, fontSize: '12px', padding: '7px 12px',
                borderRadius: '7px', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px',
                width: '100%',
              }}
            >
              + Add Link
            </button>
          </div>

          {/* Referenced By */}
          {backlinks.length > 0 && (
            <div>
              <div style={sectionLabel}>REFERENCED BY</div>
              {backlinks.map((bl) => renderSnippetCard({
                key: bl.id,
                title: bl.from_title,
                content: bl.from_content,
                tags: bl.from_tags,
                relationship: bl.relationship,
                dotColor: t.accent2,
                onClick: () => onSelectTopic(bl.from_id),
              }))}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation popup */}
      {confirmDelete && (
        <div
          onClick={() => setConfirmDelete(false)}
          style={{
            position: 'fixed', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: t.modalBg,
              border: `1px solid #cc3333`,
              borderRadius: '10px',
              padding: '20px 24px',
              width: '300px',
              boxShadow: '0 8px 32px #00000055',
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: 600, color: t.text1, marginBottom: '6px' }}>
              Delete "{title}"?
            </div>
            <div style={{ fontSize: '12px', color: t.text3, marginBottom: '18px' }}>
              This cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{
                  background: 'none', border: `1px solid ${t.border}`, color: t.text3,
                  padding: '7px 14px', borderRadius: '7px', cursor: 'pointer',
                  fontSize: '12px', fontFamily: 'Inter, sans-serif',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                style={{
                  background: '#2a0808', border: '1px solid #cc3333', color: '#ff6666',
                  padding: '7px 14px', borderRadius: '7px', cursor: 'pointer',
                  fontSize: '12px', fontFamily: 'Inter, sans-serif',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link modal */}
      {showLinkModal && (
        <div style={{
          position: 'fixed', inset: 0, background: '#00000066',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
          <div style={{
            background: t.modalBg, border: `1px solid ${t.modalBorder}`,
            borderRadius: '12px', padding: '24px', width: '400px',
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: t.text1, marginBottom: '16px' }}>
              Link to a topic
            </div>
            <select
              value={linkTarget}
              onChange={(e) => setLinkTarget(e.target.value)}
              style={{ ...inputStyle, marginBottom: '10px' }}
            >
              <option value="">Select a topic...</option>
              {otherTopics.map((tp) => (
                <option key={tp.id} value={tp.id}>{tp.title}</option>
              ))}
            </select>
            <input
              value={linkRel}
              onChange={(e) => setLinkRel(e.target.value)}
              placeholder="How are they related? e.g. 1 amu = 1/Nₐ grams"
              style={{ ...inputStyle, marginBottom: '16px' }}
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowLinkModal(false)}
                style={{
                  background: 'none', border: `1px solid ${t.border}`, color: t.text3,
                  padding: '8px 16px', borderRadius: '7px', cursor: 'pointer',
                  fontSize: '12px', fontFamily: 'Inter, sans-serif',
                }}
              >
                Cancel
              </button>
              <button
                onClick={addLink}
                style={{
                  background: t.newBtnBg, border: `1px solid ${t.newBtnBorder}`,
                  color: t.accent2, padding: '8px 16px', borderRadius: '7px',
                  cursor: 'pointer', fontSize: '12px', fontFamily: 'Inter, sans-serif',
                }}
              >
                Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}