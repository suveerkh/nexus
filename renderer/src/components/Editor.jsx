import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import Heading from '@tiptap/extension-heading'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import Image from '@tiptap/extension-image'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Mathematics from '@tiptap/extension-mathematics'
import { useEffect, useRef, useState, useCallback } from 'react'
import { BsCheckSquare, BsImage, BsUpload, BsLink45Deg, BsChevronDown, BsCalculator, BsInfinity, BsBlockquoteLeft, BsGrid3X3 } from 'react-icons/bs'

// Load KaTeX styles from CDN once
if (typeof document !== 'undefined' && !document.getElementById('katex-css')) {
  const link = document.createElement('link')
  link.id = 'katex-css'
  link.rel = 'stylesheet'
  link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css'
  document.head.appendChild(link)
}

// ── Symbol groups for dropdown ─────────────────────────────────────────────────
const SYMBOL_GROUPS = [
  {
    label: 'Greek',
    symbols: [
      { symbol: 'α', label: 'Alpha', latex: '\\alpha' },
      { symbol: 'β', label: 'Beta', latex: '\\beta' },
      { symbol: 'γ', label: 'Gamma', latex: '\\gamma' },
      { symbol: 'δ', label: 'Delta', latex: '\\delta' },
      { symbol: 'ε', label: 'Epsilon', latex: '\\epsilon' },
      { symbol: 'θ', label: 'Theta', latex: '\\theta' },
      { symbol: 'λ', label: 'Lambda', latex: '\\lambda' },
      { symbol: 'μ', label: 'Mu', latex: '\\mu' },
      { symbol: 'π', label: 'Pi', latex: '\\pi' },
      { symbol: 'σ', label: 'Sigma', latex: '\\sigma' },
      { symbol: 'τ', label: 'Tau', latex: '\\tau' },
      { symbol: 'φ', label: 'Phi', latex: '\\phi' },
      { symbol: 'ω', label: 'Omega', latex: '\\omega' },
      { symbol: 'Δ', label: 'Delta (upper)', latex: '\\Delta' },
      { symbol: 'Γ', label: 'Gamma (upper)', latex: '\\Gamma' },
      { symbol: 'Λ', label: 'Lambda (upper)', latex: '\\Lambda' },
      { symbol: 'Ω', label: 'Omega (upper)', latex: '\\Omega' },
      { symbol: 'Π', label: 'Pi (upper)', latex: '\\Pi' },
    ],
  },
  {
    label: 'Logic & Sets',
    symbols: [
      { symbol: '∀', label: 'For all', latex: '\\forall' },
      { symbol: '∃', label: 'There exists', latex: '\\exists' },
      { symbol: '∈', label: 'Element of', latex: '\\in' },
      { symbol: '∉', label: 'Not element of', latex: '\\notin' },
      { symbol: '⊂', label: 'Subset', latex: '\\subset' },
      { symbol: '⊃', label: 'Superset', latex: '\\supset' },
      { symbol: '∪', label: 'Union', latex: '\\cup' },
      { symbol: '∩', label: 'Intersection', latex: '\\cap' },
      { symbol: '∅', label: 'Empty set', latex: '\\emptyset' },
      { symbol: '¬', label: 'Negation', latex: '\\neg' },
      { symbol: '∧', label: 'And', latex: '\\land' },
      { symbol: '∨', label: 'Or', latex: '\\lor' },
      { symbol: '⟹', label: 'Implies', latex: '\\implies' },
      { symbol: '⟺', label: 'Iff', latex: '\\iff' },
    ],
  },
  {
    label: 'Relations',
    symbols: [
      { symbol: '≤', label: 'Less or equal', latex: '\\leq' },
      { symbol: '≥', label: 'Greater or equal', latex: '\\geq' },
      { symbol: '≠', label: 'Not equal', latex: '\\neq' },
      { symbol: '≈', label: 'Approx', latex: '\\approx' },
      { symbol: '≡', label: 'Equivalent', latex: '\\equiv' },
      { symbol: '∝', label: 'Proportional', latex: '\\propto' },
      { symbol: '±', label: 'Plus-minus', latex: '\\pm' },
      { symbol: '×', label: 'Times', latex: '\\times' },
      { symbol: '÷', label: 'Divide', latex: '\\div' },
      { symbol: '·', label: 'Dot product', latex: '\\cdot' },
    ],
  },
  {
    label: 'Arrows',
    symbols: [
      { symbol: '→', label: 'Right arrow', latex: '\\rightarrow' },
      { symbol: '←', label: 'Left arrow', latex: '\\leftarrow' },
      { symbol: '↔', label: 'Both arrows', latex: '\\leftrightarrow' },
      { symbol: '⇒', label: 'Double right', latex: '\\Rightarrow' },
      { symbol: '⇐', label: 'Double left', latex: '\\Leftarrow' },
      { symbol: '⇔', label: 'Double both', latex: '\\Leftrightarrow' },
      { symbol: '↑', label: 'Up', latex: '\\uparrow' },
      { symbol: '↓', label: 'Down', latex: '\\downarrow' },
    ],
  },
]

// ── Toolbar button ─────────────────────────────────────────────────────────────
const ToolbarBtn = ({ onClick, active, children, title, t, danger }) => (
  <button
    onMouseDown={e => { e.preventDefault(); onClick() }}
    title={title}
    style={{
      background: active ? t.newBtnBg : 'none',
      border: active ? `1px solid ${t.newBtnBorder}` : '1px solid transparent',
      color: active ? t.accent2 : danger ? '#cc5555' : t.text3,
      borderRadius: '5px',
      padding: '4px 7px',
      cursor: 'pointer',
      fontSize: '13px',
      fontFamily: 'Inter, sans-serif',
      fontWeight: 500,
      transition: 'all 0.1s',
      lineHeight: 1.4,
      whiteSpace: 'nowrap',
    }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.color = danger ? '#ff6666' : t.accent2 }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.color = danger ? '#cc5555' : t.text3 }}
  >
    {children}
  </button>
)

const Divider = ({ t }) => (
  <div style={{ width: '1px', background: t.border, margin: '0 4px', alignSelf: 'stretch' }} />
)

// ── Symbol picker dropdown ─────────────────────────────────────────────────────
function SymbolPicker({ editor, t, onClose }) {
  const [activeGroup, setActiveGroup] = useState(0)

  const insertSymbol = (sym) => {
    // Insert the plain Unicode character so it works in any text context
    editor.chain().focus().insertContent(sym.symbol).run()
    onClose()
  }

  return (
    <div style={{
      position: 'absolute', top: '100%', left: 0, zIndex: 300, marginTop: '4px',
      background: t.modalBg, border: `1px solid ${t.border}`,
      borderRadius: '10px', width: '320px',
      boxShadow: '0 8px 24px #00000044',
      overflow: 'hidden',
    }}>
      {/* Group tabs */}
      <div style={{
        display: 'flex', borderBottom: `1px solid ${t.border}`,
        overflowX: 'auto', padding: '4px 4px 0',
        gap: '2px',
      }}>
        {SYMBOL_GROUPS.map((g, i) => (
          <div
            key={g.label}
            onMouseDown={e => { e.preventDefault(); setActiveGroup(i) }}
            style={{
              padding: '5px 10px', fontSize: '11px', cursor: 'pointer',
              color: activeGroup === i ? t.accent2 : t.text3,
              borderBottom: activeGroup === i ? `2px solid ${t.accent}` : '2px solid transparent',
              fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
              fontWeight: activeGroup === i ? 600 : 400,
            }}
          >
            {g.label}
          </div>
        ))}
      </div>

      {/* Symbol grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '2px', padding: '8px',
        maxHeight: '200px', overflowY: 'auto',
      }}>
        {SYMBOL_GROUPS[activeGroup].symbols.map((sym) => (
          <div
            key={sym.latex}
            onMouseDown={e => { e.preventDefault(); insertSymbol(sym) }}
            title={sym.label}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '8px 4px', borderRadius: '6px', cursor: 'pointer',
              border: `1px solid transparent`,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = t.bg3
              e.currentTarget.style.borderColor = t.border
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'transparent'
            }}
          >
            <span style={{ fontSize: '18px', color: t.text1, lineHeight: 1 }}>{sym.symbol}</span>
            <span style={{ fontSize: '9px', color: t.text3, marginTop: '3px', textAlign: 'center', lineHeight: 1.2 }}>
              {sym.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Image upload / URL modal ───────────────────────────────────────────────────
function ImageModal({ onInsert, onClose, t }) {
  const [url, setUrl] = useState('')
  const [tab, setTab] = useState('upload') // 'upload' | 'url'
  const fileRef = useRef()
  const inputRef = useRef()

  useEffect(() => { inputRef.current?.focus() }, [tab])

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => { onInsert(ev.target.result); onClose() }
    reader.readAsDataURL(file)
  }

  const submitUrl = () => {
    if (url.trim()) { onInsert(url.trim()); onClose() }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#00000066',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500,
    }}>
      <div style={{
        background: t.modalBg, border: `1px solid ${t.modalBorder}`,
        borderRadius: '12px', padding: '0', width: '400px', overflow: 'hidden',
      }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${t.border}` }}>
          {['upload', 'url'].map(tb => (
            <div
              key={tb}
              onClick={() => setTab(tb)}
              style={{
                flex: 1, padding: '12px', textAlign: 'center',
                fontSize: '13px', cursor: 'pointer',
                color: tab === tb ? t.accent2 : t.text3,
                borderBottom: tab === tb ? `2px solid ${t.accent}` : '2px solid transparent',
                fontFamily: 'Inter, sans-serif', fontWeight: tab === tb ? 600 : 400,
              }}
            >
              {tb === 'upload' ? <><BsUpload size={12} style={{marginRight:'5px'}} />Upload file</> : <><BsLink45Deg size={12} style={{marginRight:'5px'}} />From URL</>}
            </div>
          ))}
        </div>

        <div style={{ padding: '20px' }}>
          {tab === 'upload' ? (
            <div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  border: `2px dashed ${t.border}`, borderRadius: '10px',
                  padding: '32px', textAlign: 'center', cursor: 'pointer',
                  color: t.text3, fontSize: '13px', fontFamily: 'Inter, sans-serif',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = t.accent}
                onMouseLeave={e => e.currentTarget.style.borderColor = t.border}
              >
                <BsImage size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
                <div style={{ color: t.text2, marginBottom: '4px' }}>Click to choose an image</div>
                <div style={{ fontSize: '11px' }}>PNG, JPG, GIF, WebP</div>
              </div>
            </div>
          ) : (
            <div>
              <input
                ref={inputRef}
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') submitUrl(); if (e.key === 'Escape') onClose() }}
                placeholder="https://example.com/image.png"
                style={{
                  width: '100%', background: t.inputBg, border: `1px solid ${t.inputBorder}`,
                  borderRadius: '7px', padding: '8px 12px', color: t.inputColor,
                  fontSize: '13px', outline: 'none', fontFamily: 'Inter, sans-serif',
                  marginBottom: '14px', boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button onClick={onClose} style={{
                  background: 'none', border: `1px solid ${t.border}`, color: t.text3,
                  padding: '7px 14px', borderRadius: '7px', cursor: 'pointer',
                  fontSize: '12px', fontFamily: 'Inter, sans-serif',
                }}>Cancel</button>
                <button onClick={submitUrl} style={{
                  background: t.newBtnBg, border: `1px solid ${t.newBtnBorder}`,
                  color: t.accent2, padding: '7px 14px', borderRadius: '7px',
                  cursor: 'pointer', fontSize: '12px', fontFamily: 'Inter, sans-serif',
                }}>Insert</button>
              </div>
            </div>
          )}
          {tab === 'upload' && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button onClick={onClose} style={{
                background: 'none', border: `1px solid ${t.border}`, color: t.text3,
                padding: '7px 14px', borderRadius: '7px', cursor: 'pointer',
                fontSize: '12px', fontFamily: 'Inter, sans-serif',
              }}>Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


// ── Table right-click context menu ─────────────────────────────────────────────
function TableContextMenu({ editor, x, y, t, onClose }) {
  const ref = useRef()

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const items = [
    { label: '+ Row above', action: () => editor.chain().focus().addRowBefore().run() },
    { label: '+ Row below', action: () => editor.chain().focus().addRowAfter().run() },
    { label: '− Delete row', action: () => editor.chain().focus().deleteRow().run(), danger: true },
    null,
    { label: '+ Column left', action: () => editor.chain().focus().addColumnBefore().run() },
    { label: '+ Column right', action: () => editor.chain().focus().addColumnAfter().run() },
    { label: '− Delete column', action: () => editor.chain().focus().deleteColumn().run(), danger: true },
    null,
    { label: 'Merge cells', action: () => editor.chain().focus().mergeCells().run() },
    { label: 'Split cell', action: () => editor.chain().focus().splitCell().run() },
    null,
    { label: 'Delete table', action: () => editor.chain().focus().deleteTable().run(), danger: true },
  ]

  return (
    <div ref={ref} style={{
      position: 'fixed', top: y, left: x, zIndex: 9999,
      background: t.modalBg, border: `1px solid ${t.border}`,
      borderRadius: '8px', padding: '4px', minWidth: '165px',
      boxShadow: '0 6px 24px #00000055',
    }}>
      {items.map((item, i) =>
        item === null ? (
          <div key={i} style={{ height: '1px', background: t.border, margin: '3px 0' }} />
        ) : (
          <div
            key={item.label}
            onMouseDown={e => { e.preventDefault(); item.action(); onClose() }}
            style={{
              padding: '6px 12px', fontSize: '12px', borderRadius: '5px',
              color: item.danger ? '#cc5555' : t.text2,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            }}
            onMouseEnter={e => e.currentTarget.style.background = t.bg3}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {item.label}
          </div>
        )
      )}
    </div>
  )
}

// ── Table expand button injected into DOM ──────────────────────────────────────
function useTableControls(editor, t, onExpand) {
  useEffect(() => {
    if (!editor) return

    const inject = () => {
      const dom = editor.view.dom
      dom.querySelectorAll('.nexus-table-controls').forEach(el => el.remove())

      dom.querySelectorAll('.tableWrapper').forEach(wrapper => {
        const table = wrapper.querySelector('table')
        if (!table) return

        // ── Expand button (top-right corner) — full view popup ────────────
        const expandBtn = document.createElement('div')
        expandBtn.className = 'nexus-table-controls nexus-expand-table'
        expandBtn.title = 'Open full view'
        expandBtn.innerHTML = '⤢'
        expandBtn.addEventListener('mousedown', (e) => {
          e.preventDefault()
          e.stopPropagation()
          if (onExpand) onExpand(table.outerHTML)
        })
        wrapper.appendChild(expandBtn)
      })
    }

    editor.on('update', inject)
    editor.on('selectionUpdate', inject)
    const t0 = setTimeout(inject, 50)

    return () => {
      clearTimeout(t0)
      editor.off('update', inject)
      editor.off('selectionUpdate', inject)
      editor.view?.dom?.querySelectorAll('.nexus-table-controls').forEach(el => el.remove())
    }
  }, [editor, t])
}

// ── Math templates ─────────────────────────────────────────────────────────────
const MATH_TEMPLATE_GROUPS = [
  {
    label: 'Calculus',
    items: [
      { label: '∫ Integral', latex: '\\int_{a}^{b} f(x)\\,dx' },
      { label: '∬ Double', latex: '\\iint_{D} f(x,y)\\,dA' },
      { label: '∮ Contour', latex: '\\oint_{C} f(z)\\,dz' },
      { label: 'lim', latex: '\\lim_{x \\to \\infty} f(x)' },
      { label: 'd/dx', latex: '\\frac{d}{dx} f(x)' },
      { label: '∂/∂x', latex: '\\frac{\\partial f}{\\partial x}' },
      { label: '∇ Gradient', latex: '\\nabla f' },
    ],
  },
  {
    label: 'Algebra',
    items: [
      { label: 'x²', latex: 'x^{2}' },
      { label: 'xⁿ', latex: 'x^{n}' },
      { label: '√x', latex: '\\sqrt{x}' },
      { label: 'ⁿ√x', latex: '\\sqrt[n]{x}' },
      { label: 'a/b', latex: '\\frac{a}{b}' },
      { label: 'quadratic', latex: 'x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}' },
      { label: 'log', latex: '\\log_{b}(x)' },
    ],
  },
  {
    label: 'Sums',
    items: [
      { label: 'Σ Sum', latex: '\\sum_{i=0}^{n} x_i' },
      { label: '∏ Product', latex: '\\prod_{i=1}^{n} x_i' },
      { label: 'Series', latex: '\\sum_{n=1}^{\\infty} \\frac{1}{n^2}' },
    ],
  },
  {
    label: 'Structures',
    items: [
      { label: 'matrix 2×2', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
      { label: 'matrix 3×3', latex: '\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}' },
      { label: 'cases', latex: 'f(x) = \\begin{cases} x & x > 0 \\\\ 0 & x = 0 \\\\ -x & x < 0 \\end{cases}' },
      { label: 'binomial', latex: '\\binom{n}{k}' },
    ],
  },
]

// ── Math modal — live preview + templates ─────────────────────────────────────
function MathModal({ editor, onClose, t }) {
  const [latex, setLatex] = useState('')
  const [isBlock, setIsBlock] = useState(false)
  const [preview, setPreview] = useState('')
  const [previewError, setPreviewError] = useState(false)
  const [search, setSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [highlightedIdx, setHighlightedIdx] = useState(0)
  const inputRef = useRef()
  const searchRef = useRef()
  const dropdownRef = useRef()

  // All items flat for search
  const allItems = MATH_TEMPLATE_GROUPS.flatMap(g =>
    g.items.map(item => ({ ...item, group: g.label }))
  )

  const filtered = search.trim()
    ? allItems.filter(item =>
        item.label.toLowerCase().includes(search.toLowerCase()) ||
        item.group.toLowerCase().includes(search.toLowerCase()) ||
        item.latex.toLowerCase().includes(search.toLowerCase())
      )
    : allItems

  useEffect(() => { searchRef.current?.focus() }, [])
  useEffect(() => { setHighlightedIdx(0) }, [search])

  // Load katex JS for live preview
  useEffect(() => {
    if (!window.katex && !document.getElementById('katex-js')) {
      const s = document.createElement('script')
      s.id = 'katex-js'
      s.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js'
      document.head.appendChild(s)
    }
  }, [])

  // Live preview
  useEffect(() => {
    if (!latex.trim()) { setPreview(''); setPreviewError(false); return }
    const timer = setTimeout(() => {
      try {
        if (window.katex) {
          const html = window.katex.renderToString(latex, { throwOnError: true, displayMode: isBlock })
          setPreview(html)
          setPreviewError(false)
        }
      } catch {
        setPreviewError(true)
        setPreview('')
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [latex, isBlock])

  const insert = () => {
    if (!latex.trim()) return
    if (isBlock) {
      editor.chain().focus().insertBlockMath({ latex: latex.trim() }).run()
    } else {
      editor.chain().focus().insertInlineMath({ latex: latex.trim() }).run()
    }
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#00000066',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500,
    }}>
      <div style={{
        background: t.modalBg, border: `1px solid ${t.modalBorder}`,
        borderRadius: '12px', padding: '24px', width: '500px',
      }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: t.text1, marginBottom: '12px' }}>
          Insert equation
        </div>

        {/* Searchable template dropdown */}
        <div style={{ marginBottom: '12px', position: 'relative' }} ref={dropdownRef}>
          <div style={{ fontSize: '10px', color: t.text3, letterSpacing: '1px', marginBottom: '5px' }}>TEMPLATE</div>
          <div style={{ position: 'relative' }}>
            <input
              ref={searchRef}
              value={search}
              onChange={e => { setSearch(e.target.value); setShowDropdown(true) }}
              onClick={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              onKeyDown={e => {
                if (!showDropdown) return
                if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightedIdx(i => Math.min(i + 1, filtered.length - 1)) }
                if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightedIdx(i => Math.max(i - 1, 0)) }
                if (e.key === 'Enter') {
                  e.preventDefault()
                  if (filtered[highlightedIdx]) { setLatex(prev => prev ? prev + ' ' + filtered[highlightedIdx].latex : filtered[highlightedIdx].latex); setShowDropdown(false); setSearch('') }
                }
                if (e.key === 'Escape') { setShowDropdown(false) }
              }}
              placeholder="Click to add a template — builds on existing equation"
              style={{
                width: '100%', background: t.inputBg, border: `1px solid ${t.inputBorder}`,
                borderRadius: '7px', padding: '8px 12px', color: t.inputColor,
                fontSize: '13px', outline: 'none', fontFamily: 'Inter, sans-serif',
                boxSizing: 'border-box',
              }}
            />
            {showDropdown && filtered.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                background: t.modalBg, border: `1px solid ${t.border}`,
                borderRadius: '8px', marginTop: '4px',
                maxHeight: '220px', overflowY: 'auto',
                boxShadow: '0 4px 20px #00000044',
              }}>
                {(() => {
                  let lastGroup = null
                  return filtered.map((item, idx) => {
                    const showGroupHeader = item.group !== lastGroup
                    lastGroup = item.group
                    return (
                      <div key={item.label + item.group}>
                        {showGroupHeader && (
                          <div style={{
                            padding: '6px 12px 3px', fontSize: '10px',
                            color: t.text3, letterSpacing: '1px',
                            borderTop: idx > 0 ? `1px solid ${t.border}` : 'none',
                          }}>
                            {item.group.toUpperCase()}
                          </div>
                        )}
                        <div
                          onMouseDown={e => {
                            e.preventDefault()
                            setLatex(prev => prev ? prev + ' ' + item.latex : item.latex)
                            setSearch('')
                            setShowDropdown(false)
                            setTimeout(() => inputRef.current?.focus(), 50)
                          }}
                          style={{
                            padding: '7px 12px', fontSize: '13px', cursor: 'pointer',
                            background: idx === highlightedIdx ? t.newBtnBg : 'transparent',
                            color: idx === highlightedIdx ? t.accent2 : t.text2,
                            fontFamily: 'Inter, sans-serif',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          }}
                          onMouseEnter={() => setHighlightedIdx(idx)}
                        >
                          <span>{item.label}</span>
                          <span style={{ fontSize: '11px', color: t.text3, fontFamily: 'monospace', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.latex.length > 28 ? item.latex.slice(0, 28) + '…' : item.latex}
                          </span>
                        </div>
                      </div>
                    )
                  })
                })()}
              </div>
            )}
          </div>
        </div>

        {/* LaTeX input */}
        <div style={{ fontSize: '10px', color: t.text3, letterSpacing: '1px', marginBottom: '5px' }}>LATEX</div>
        <textarea
          ref={inputRef}
          value={latex}
          onChange={e => setLatex(e.target.value)}
          onKeyDown={e => { if (e.key === 'Escape') onClose() }}
          placeholder="\int_0^\infty e^{-x^2} dx"
          rows={3}
          style={{
            width: '100%', background: t.inputBg,
            border: `1px solid ${previewError ? '#cc5555' : t.inputBorder}`,
            borderRadius: '7px', padding: '10px 12px', color: t.accent2,
            fontSize: '13px', outline: 'none', fontFamily: 'monospace',
            marginBottom: '10px', boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.6,
          }}
        />

        {/* Live preview */}
        {latex.trim() && (
          <div style={{
            background: t.bg3, border: `1px solid ${previewError ? '#cc5555' : t.border}`,
            borderRadius: '7px', padding: '12px 16px', marginBottom: '12px',
            minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {previewError
              ? <span style={{ fontSize: '12px', color: '#cc5555', fontFamily: 'monospace' }}>Invalid LaTeX</span>
              : preview
                ? <div dangerouslySetInnerHTML={{ __html: preview }} style={{ color: t.text1 }} />
                : <span style={{ fontSize: '12px', color: t.text3 }}>Preview...</span>
            }
          </div>
        )}

        {/* Block toggle */}
        <div onClick={() => setIsBlock(v => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '18px' }}>
          <div style={{
            width: '16px', height: '16px', borderRadius: '4px',
            border: `1.5px solid ${isBlock ? t.accent : t.border}`,
            background: isBlock ? t.accent : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {isBlock && <span style={{ color: '#fff', fontSize: '10px', lineHeight: 1 }}>✓</span>}
          </div>
          <span style={{ fontSize: '12px', color: t.text2, fontFamily: 'Inter, sans-serif' }}>
            Block equation (centered on its own line)
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            background: 'none', border: `1px solid ${t.border}`, color: t.text3,
            padding: '7px 14px', borderRadius: '7px', cursor: 'pointer',
            fontSize: '12px', fontFamily: 'Inter, sans-serif',
          }}>Cancel</button>
          <button onClick={insert} style={{
            background: t.newBtnBg, border: `1px solid ${t.newBtnBorder}`,
            color: t.accent2, padding: '7px 14px', borderRadius: '7px',
            cursor: 'pointer', fontSize: '12px', fontFamily: 'Inter, sans-serif',
          }}>Insert</button>
        </div>
      </div>
    </div>
  )
}

// ── Main Editor ───────────────────────────────────────────────────────────────
export default function Editor({ content, onChange, theme: t }) {
  const [, forceUpdate] = useState(0)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showSymbols, setShowSymbols] = useState(false)
  const [showMathModal, setShowMathModal] = useState(false)
  const [tableCtxMenu, setTableCtxMenu] = useState(null) // { x, y }
  const [tableFullView, setTableFullView] = useState(null) // table HTML string
  const symbolsRef = useRef()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Subscript,
      Superscript,
      Heading.configure({ levels: [1, 2, 3] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({ inline: false, allowBase64: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Mathematics,
    ],
    content: content || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    onSelectionUpdate: () => forceUpdate(n => n + 1),
    onTransaction: () => forceUpdate(n => n + 1),
    editorProps: {
      attributes: {
        style: `
          outline: none;
          min-height: 200px;
          padding: 14px;
          font-size: 14px;
          line-height: 1.8;
          color: ${t.inputColor};
          font-family: Inter, sans-serif;
        `
      }
    }
  })

  // Inject table +/− DOM controls
  useTableControls(editor, t, (html) => setTableFullView(html))

  // Sync theme CSS vars onto editor DOM for injected buttons
  useEffect(() => {
    if (!editor) return
    const dom = editor.view.dom
    dom.style.setProperty('--nexus-accent2', t.accent2)
    dom.style.setProperty('--nexus-accent', t.accent)
    dom.style.setProperty('--nexus-btn-bg', t.newBtnBg)
  }, [editor, t])

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '')
    }
  }, [content])

  // Right-click on table → context menu
  useEffect(() => {
    if (!editor) return
    const dom = editor.view.dom
    const handler = (e) => {
      const cell = e.target.closest('td, th')
      if (!cell) return
      e.preventDefault()
      // Position cursor in clicked cell
      try {
        const pos = editor.view.posAtDOM(cell, 0)
        editor.chain().focus().setTextSelection(pos).run()
      } catch {}
      setTableCtxMenu({ x: e.clientX, y: e.clientY })
    }
    dom.addEventListener('contextmenu', handler)
    return () => dom.removeEventListener('contextmenu', handler)
  }, [editor])

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (symbolsRef.current && !symbolsRef.current.contains(e.target)) setShowSymbols(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!editor) return null

  const btn = (label, action, isActive, title) => (
    <ToolbarBtn key={title} onClick={action} active={isActive} title={title} t={t}>
      {label}
    </ToolbarBtn>
  )

  return (
    <>
      {showImageModal && (
        <ImageModal
          t={t}
          onInsert={src => editor.chain().focus().setImage({ src }).run()}
          onClose={() => setShowImageModal(false)}
        />
      )}
      {showMathModal && (
        <MathModal editor={editor} t={t} onClose={() => setShowMathModal(false)} />
      )}
      {tableCtxMenu && (
        <TableContextMenu
          editor={editor} t={t}
          x={tableCtxMenu.x} y={tableCtxMenu.y}
          onClose={() => setTableCtxMenu(null)}
        />
      )}
      {tableFullView && (
        <div
          onMouseDown={() => setTableFullView(null)}
          style={{
            position: 'fixed', inset: 0, background: '#000000aa',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 600,
            padding: '40px',
          }}
        >
          <div
            onMouseDown={e => e.stopPropagation()}
            style={{
              background: t.modalBg, border: `1px solid ${t.modalBorder}`,
              borderRadius: '12px', padding: '20px',
              maxWidth: '92vw', maxHeight: '88vh',
              display: 'flex', flexDirection: 'column', gap: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: t.text1, letterSpacing: '0.5px' }}>
                Table — full view
              </div>
              <button
                onClick={() => setTableFullView(null)}
                style={{
                  background: 'none', border: `1px solid ${t.border}`, color: t.text3,
                  borderRadius: '6px', padding: '4px 12px', cursor: 'pointer',
                  fontSize: '12px', fontFamily: 'Inter, sans-serif',
                }}
              >Close</button>
            </div>
            <div
              className="nexus-fullview-table"
              style={{ overflow: 'auto', flex: 1 }}
              dangerouslySetInnerHTML={{ __html: tableFullView }}
            />
            <div style={{ fontSize: '11px', color: t.text4 }}>
              Read-only view. Edit directly in the note.
            </div>
          </div>
        </div>
      )}

      <div style={{
        background: t.inputBg,
        border: `1px solid ${t.inputBorder}`,
        borderRadius: '7px',
        overflow: 'visible',
        position: 'relative',
      }}>
        {/* ── Toolbar ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '2px',
          padding: '6px 8px',
          borderBottom: `1px solid ${t.inputBorder}`,
          background: t.bg2,
          borderRadius: '7px 7px 0 0',
        }}>
          {/* Headings */}
          {btn('H1', () => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive('heading', { level: 1 }), 'Heading 1')}
          {btn('H2', () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }), 'Heading 2')}
          {btn('H3', () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive('heading', { level: 3 }), 'Heading 3')}

          <Divider t={t} />

          {/* Text formatting */}
          {btn('B', () => editor.chain().focus().toggleBold().run(), editor.isActive('bold'), 'Bold')}
          {btn('I', () => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'), 'Italic')}
          {btn('U', () => editor.chain().focus().toggleUnderline().run(), editor.isActive('underline'), 'Underline')}
          {btn('S', () => editor.chain().focus().toggleStrike().run(), editor.isActive('strike'), 'Strikethrough')}

          <Divider t={t} />

          {/* Lists */}
          {btn('• List', () => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'), 'Bullet list')}
          {btn('1. List', () => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'), 'Numbered list')}
          {btn(<BsCheckSquare size={13} />, () => editor.chain().focus().toggleTaskList().run(), editor.isActive('taskList'), 'Checklist')}

          <Divider t={t} />

          {/* Sub/Superscript */}
          {btn('X₂', () => editor.chain().focus().toggleSubscript().run(), editor.isActive('subscript'), 'Subscript')}
          {btn('X²', () => editor.chain().focus().toggleSuperscript().run(), editor.isActive('superscript'), 'Superscript')}

          <Divider t={t} />

          {/* Code & Quote */}
          {btn('{ }', () => editor.chain().focus().toggleCode().run(), editor.isActive('code'), 'Inline code')}
          {btn(<BsBlockquoteLeft size={13} />, () => editor.chain().focus().toggleBlockquote().run(), editor.isActive('blockquote'), 'Blockquote')}

          <Divider t={t} />

          {/* Math modal */}
          <ToolbarBtn onClick={() => setShowMathModal(true)} active={false} title="Insert equation" t={t}>
            <BsCalculator size={13} style={{marginRight:'4px'}} /> Math
          </ToolbarBtn>

          {/* Symbol picker */}
          <div style={{ position: 'relative' }} ref={symbolsRef}>
            <ToolbarBtn
              onClick={() => setShowSymbols(v => !v)}
              active={showSymbols}
              title="Insert symbol"
              t={t}
            >
              <BsInfinity size={13} style={{marginRight:'4px'}} /> Symbols <BsChevronDown size={9} style={{marginLeft:'2px'}} />
            </ToolbarBtn>
            {showSymbols && (
              <SymbolPicker editor={editor} t={t} onClose={() => setShowSymbols(false)} />
            )}
          </div>

          <Divider t={t} />

          {/* Image upload */}
          <ToolbarBtn onClick={() => setShowImageModal(true)} active={false} title="Insert image" t={t}>
            <BsImage size={13} />
          </ToolbarBtn>

          {/* Table — one click inserts 3×3 with header */}
          <ToolbarBtn
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            active={false}
            title="Insert 3×3 table (right-click table for options)"
            t={t}
          >
            <BsGrid3X3 size={12} style={{marginRight:'4px'}} />Table
          </ToolbarBtn>
        </div>

        {/* ── Editor content ── */}
        <div style={{ background: t.inputBg, borderRadius: '0 0 7px 7px' }}>
          <style>{`
            .tiptap-editor h1 { font-size: 20px; font-weight: 700; margin: 14px 0 6px; color: ${t.text1}; }
            .tiptap-editor h2 { font-size: 17px; font-weight: 600; margin: 12px 0 5px; color: ${t.text1}; }
            .tiptap-editor h3 { font-size: 15px; font-weight: 600; margin: 10px 0 4px; color: ${t.text1}; }
            .tiptap-editor ul { padding-left: 20px; margin: 6px 0; }
            .tiptap-editor ol { padding-left: 20px; margin: 6px 0; }
            .tiptap-editor li { margin: 3px 0; color: ${t.inputColor}; }
            .tiptap-editor p { margin: 4px 0; }
            .tiptap-editor code { background: ${t.bg3}; padding: 2px 5px; border-radius: 4px; font-size: 12px; color: ${t.accent2}; font-family: monospace; }
            .tiptap-editor strong { color: ${t.text1}; font-weight: 600; }
            .tiptap-editor em { color: ${t.text2}; font-style: italic; }
            .tiptap-editor s { color: ${t.text3}; }
            .tiptap-editor blockquote {
              border-left: 3px solid ${t.accent};
              padding: 4px 12px;
              margin: 8px 0;
              color: ${t.text3};
              font-style: italic;
              background: ${t.bg3};
              border-radius: 0 6px 6px 0;
            }
            .tiptap-editor hr { border: none; border-top: 1px solid ${t.border}; margin: 12px 0; }

            /* ── Table ── */
            .tiptap-editor table {
              border-collapse: collapse;
              width: 100%;
              margin: 12px 0;
              font-size: 13px;
              table-layout: auto;
            }
            .tiptap-editor th, .tiptap-editor td {
              border: 1px solid ${t.border};
              padding: 7px 10px;
              color: ${t.inputColor};
              text-align: left;
              vertical-align: top;
              min-width: 80px;
              position: relative;
            }
            .tiptap-editor th {
              background: ${t.bg3};
              color: ${t.text1};
              font-weight: 600;
              font-size: 12px;
            }
            .tiptap-editor tr:nth-child(even) td { background: ${t.bg3}44; }
            .tiptap-editor .selectedCell:after {
              background: ${t.accent}22;
              content: "";
              left: 0; right: 0; top: 0; bottom: 0;
              pointer-events: none;
              position: absolute;
              z-index: 2;
            }
            .tiptap-editor .column-resize-handle {
              background-color: ${t.accent};
              bottom: -2px;
              position: absolute;
              right: -2px;
              pointer-events: none;
              top: 0;
              width: 3px;
            }
            .tiptap-editor .tableWrapper {
              max-width: 100%;
              overflow-x: auto;
              position: relative;
            }

            /* ── Inline table controls ── */
            .nexus-expand-table {
              width: 20px; height: 20px;
              top: -10px; right: -10px;
              font-size: 12px;
            }
            .nexus-expand-table:hover { opacity: 1; transform: scale(1.15); }
            /* Full-view popup table */
            .nexus-fullview-table table {
              border-collapse: collapse;
              font-size: 14px;
              width: max-content;
              min-width: 100%;
            }
            .nexus-fullview-table th, .nexus-fullview-table td {
              border: 1px solid ${t.border};
              padding: 9px 14px;
              color: ${t.inputColor};
              text-align: left;
              vertical-align: top;
              white-space: nowrap;
            }
            .nexus-fullview-table th { background: ${t.bg3}; font-weight: 600; }
            .nexus-fullview-table tr:nth-child(even) td { background: ${t.bg3}44; }

            /* ── Image ── */
            .tiptap-editor img {
              max-width: 100%;
              border-radius: 6px;
              margin: 8px 0;
              border: 1px solid ${t.border};
              display: block;
            }
            .tiptap-editor img.ProseMirror-selectednode {
              outline: 2px solid ${t.accent};
            }

            /* ── Task list / Checklist ── */
            .tiptap-editor ul[data-type="taskList"] {
              list-style: none;
              padding-left: 4px;
            }
            .tiptap-editor ul[data-type="taskList"] li {
              display: flex;
              align-items: flex-start;
              gap: 8px;
              margin: 5px 0;
            }
            .tiptap-editor ul[data-type="taskList"] li > label {
              margin-top: 3px;
              flex-shrink: 0;
              cursor: pointer;
            }
            .tiptap-editor ul[data-type="taskList"] li > label input[type="checkbox"] {
              width: 15px;
              height: 15px;
              cursor: pointer;
              accent-color: ${t.accent};
              border-radius: 4px;
            }
            .tiptap-editor ul[data-type="taskList"] li[data-checked="true"] > div {
              color: ${t.text3};
              text-decoration: line-through;
            }
            .tiptap-editor ul[data-type="taskList"] li > div { flex: 1; }

            /* ── Math (KaTeX) ── */
            .tiptap-editor .Tiptap-mathematics-editor {
              background: ${t.bg3};
              border: 1px solid ${t.accent};
              border-radius: 5px;
              padding: 2px 8px;
              font-family: monospace;
              font-size: 13px;
              color: ${t.accent2};
              outline: none;
            }
            .tiptap-editor .Tiptap-mathematics-render {
              display: inline-block;
              padding: 1px 4px;
              border-radius: 4px;
              background: ${t.bg3};
              cursor: pointer;
              border: 1px solid transparent;
            }
            .tiptap-editor .Tiptap-mathematics-render:hover {
              border-color: ${t.border};
            }
            .tiptap-editor .Tiptap-mathematics-render--editable {
              outline: 2px solid ${t.accent};
            }
            .tiptap-editor .katex { font-size: 1em; color: ${t.text1}; }
            .tiptap-editor .katex-display { margin: 12px 0; text-align: center; }
            .tiptap-editor .katex-display > .katex {
              background: ${t.bg3};
              border: 1px solid ${t.border};
              border-radius: 8px;
              padding: 12px 20px;
              display: inline-block;
            }
          `}</style>
          <div className="tiptap-editor">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </>
  )
}