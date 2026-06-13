import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import Heading from '@tiptap/extension-heading'
import { useEffect, useState } from 'react'

const ToolbarBtn = ({ onClick, active, children, title, t }) => (
  <button
    onMouseDown={e => { e.preventDefault(); onClick() }}
    title={title}
    style={{
      background: active ? t.newBtnBg : 'none',
      border: active ? `1px solid ${t.newBtnBorder}` : '1px solid transparent',
      color: active ? t.accent2 : t.text3,
      borderRadius: '5px',
      padding: '4px 7px',
      cursor: 'pointer',
      fontSize: '13px',
      fontFamily: 'Inter, sans-serif',
      fontWeight: 500,
      transition: 'all 0.1s',
      lineHeight: 1.4,
    }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.color = t.accent2 }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.color = t.text3 }}
  >
    {children}
  </button>
)

const Divider = ({ t }) => (
  <div style={{ width: '1px', background: t.border, margin: '0 4px', alignSelf: 'stretch' }} />
)

export default function Editor({ content, onChange, theme: t }) {
  const [, forceUpdate] = useState(0)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Underline,
      Subscript,
      Superscript,
      Heading.configure({ levels: [1, 2, 3] }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    onSelectionUpdate: () => {
      forceUpdate(n => n + 1)
    },
    onTransaction: () => {
      forceUpdate(n => n + 1)
    },
    editorProps: {
      attributes: {
        style: `
          outline: none;
          min-height: 180px;
          padding: 12px;
          font-size: 14px;
          line-height: 1.8;
          color: ${t.inputColor};
          font-family: Inter, sans-serif;
        `
      }
    }
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '')
    }
  }, [content])

  if (!editor) return null

  const btn = (label, action, isActive, title) => (
    <ToolbarBtn key={label} onClick={action} active={isActive} title={title} t={t}>
      {label}
    </ToolbarBtn>
  )

  return (
    <div style={{
      background: t.inputBg,
      border: `1px solid ${t.inputBorder}`,
      borderRadius: '7px',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '2px',
        padding: '6px 8px',
        borderBottom: `1px solid ${t.inputBorder}`,
        background: t.bg2,
      }}>
        {btn('H1', () => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive('heading', { level: 1 }), 'Heading 1')}
        {btn('H2', () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }), 'Heading 2')}
        {btn('H3', () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive('heading', { level: 3 }), 'Heading 3')}
        <Divider t={t} />
        {btn('B', () => editor.chain().focus().toggleBold().run(), editor.isActive('bold'), 'Bold')}
        {btn('I', () => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'), 'Italic')}
        {btn('U', () => editor.chain().focus().toggleUnderline().run(), editor.isActive('underline'), 'Underline')}
        <Divider t={t} />
        {btn('• List', () => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'), 'Bullet list')}
        {btn('1. List', () => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'), 'Numbered list')}
        <Divider t={t} />
        {btn('X₂', () => editor.chain().focus().toggleSubscript().run(), editor.isActive('subscript'), 'Subscript')}
        {btn('X²', () => editor.chain().focus().toggleSuperscript().run(), editor.isActive('superscript'), 'Superscript')}
        <Divider t={t} />
        {btn('{ }', () => editor.chain().focus().toggleCode().run(), editor.isActive('code'), 'Inline code')}
      </div>

      <div style={{ background: t.inputBg }}>
        <style>{`
          .tiptap-editor h1 { font-size: 20px; font-weight: 600; margin: 12px 0 6px; color: ${t.text1}; }
          .tiptap-editor h2 { font-size: 17px; font-weight: 600; margin: 10px 0 5px; color: ${t.text1}; }
          .tiptap-editor h3 { font-size: 15px; font-weight: 600; margin: 8px 0 4px; color: ${t.text1}; }
          .tiptap-editor ul { padding-left: 20px; margin: 6px 0; }
          .tiptap-editor ol { padding-left: 20px; margin: 6px 0; }
          .tiptap-editor li { margin: 3px 0; color: ${t.inputColor}; }
          .tiptap-editor p { margin: 4px 0; }
          .tiptap-editor code { background: ${t.bg3}; padding: 2px 5px; border-radius: 4px; font-size: 13px; color: ${t.accent2}; font-family: monospace; }
          .tiptap-editor strong { color: ${t.text1}; font-weight: 600; }
          .tiptap-editor em { color: ${t.text2}; }
        `}</style>
        <div className="tiptap-editor">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}