import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import Topic from './pages/Topic'
import Graph from './pages/Graph'
import Onboarding from './pages/Onboarding'
import './App.css'
import { BsMoon, BsSun } from 'react-icons/bs'

export default function App() {
  const [topics, setTopics] = useState([])
  const [activePage, setActivePage] = useState('home')
  const [activeTopicId, setActiveTopicId] = useState(null)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('nexus-theme')
    return saved ? saved === 'dark' : true
  })
  const [search, setSearch] = useState('')
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('nexus-launched')
  })
  const [topicOrder, setTopicOrder] = useState(() => {
    const saved = localStorage.getItem('nexus-topic-order')
    return saved ? JSON.parse(saved) : []
  })
  const [dragOverId, setDragOverId] = useState(null)

  const theme = darkMode ? {
    bg: '#0a0a0f',
    bg2: '#0d0d1a',
    bg3: '#070710',
    border: '#1a1a2e',
    border2: '#141428',
    accent: '#4a7fff',
    accent2: '#6b9fff',
    text1: '#c8d8ff',
    text2: '#8892b0',
    text3: '#3a4480',
    text4: '#2a3460',
    inputBg: '#070710',
    inputBorder: '#141428',
    inputColor: '#8892b0',
    sidebarBg: '#0d0d1a',
    newBtnBg: '#0f1535',
    newBtnBorder: '#1e2a6e',
    topbarBorder: '#1a1a2e',
    linkCardBg: '#070710',
    linkCardBorder: '#141428',
    addLinkBg: '#0a0f25',
    addLinkBorder: '#1e2a6e',
    addLinkColor: '#4a6aaa',
    modalBg: '#0d0d1a',
    modalBorder: '#2e4aae',
    toggleBg: '#0d0d1a',
    toggleBorder: '#1a1a2e',
    toggleColor: '#3a4480',
  } : {
    bg: '#f4f6fb',
    bg2: '#ffffff',
    bg3: '#eef1f8',
    border: '#dde2f0',
    border2: '#e8ecf5',
    accent: '#3a6fff',
    accent2: '#2255dd',
    text1: '#1a2050',
    text2: '#4a5580',
    text3: '#8892b0',
    text4: '#aab0c8',
    inputBg: '#f8f9fd',
    inputBorder: '#dde2f0',
    inputColor: '#4a5580',
    sidebarBg: '#ffffff',
    newBtnBg: '#eef3ff',
    newBtnBorder: '#c0d0ff',
    topbarBorder: '#dde2f0',
    linkCardBg: '#f4f6fb',
    linkCardBorder: '#dde2f0',
    addLinkBg: '#eef3ff',
    addLinkBorder: '#c0d0ff',
    addLinkColor: '#3a6fff',
    modalBg: '#ffffff',
    modalBorder: '#3a6fff',
    toggleBg: '#ffffff',
    toggleBorder: '#dde2f0',
    toggleColor: '#8892b0',
  }

  const loadTopics = async () => {
    const data = await window.nexus.getTopics()
    setTopics(data)
    return data
  }

  useEffect(() => {
    loadTopics().then(data => {
      const lastId = localStorage.getItem('nexus-last-topic')
      if (lastId) {
        const found = data.find(t => t.id === parseInt(lastId))
        if (found) {
          setActiveTopicId(parseInt(lastId))
          setActivePage('topic')
        }
      }
    })
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      const cmd = e.metaKey || e.ctrlKey

      if (cmd && e.key === 'n') {
        e.preventDefault()
        window.nexus.createTopic('Untitled').then(result => {
          loadTopics().then(() => openTopic(result.lastInsertRowid))
        })
      }

      if (cmd && e.key === 'g') {
        e.preventDefault()
        setActivePage('graph')
      }

      if (cmd && e.key === 'f') {
        e.preventDefault()
        document.querySelector('input[placeholder*="Search"]')?.focus()
      }

      if (cmd && e.key === 'e') {
        e.preventDefault()
        handleExport()
      }

      if (e.key === 'Escape') {
        if (activePage === 'topic' || activePage === 'graph') {
          goHome()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activePage, topics])

  const openTopic = (id) => {
    setActiveTopicId(id)
    setActivePage('topic')
    setSearch('')
    localStorage.setItem('nexus-last-topic', id)
  }

  const goHome = () => {
    setActivePage('home')
    setActiveTopicId(null)
    setSearch('')
    localStorage.removeItem('nexus-last-topic')
    loadTopics()
  }

  const getSortedTopics = () => {
    if (topicOrder.length === 0) return topics
    const ordered = []
    topicOrder.forEach(id => {
      const t = topics.find(t => t.id === id)
      if (t) ordered.push(t)
    })
    topics.forEach(t => {
      if (!topicOrder.includes(t.id)) ordered.push(t)
    })
    return ordered
  }

  const handleDragStart = (e, id) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('topicId', id)
  }

  const handleDragOver = (e, id) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverId(id)
  }

  const handleDrop = (e, targetId) => {
    e.preventDefault()
    const draggedId = parseInt(e.dataTransfer.getData('topicId'))
    if (draggedId === targetId) return

    const sorted = getSortedTopics()
    const fromIndex = sorted.findIndex(t => t.id === draggedId)
    const toIndex = sorted.findIndex(t => t.id === targetId)

    const newOrder = sorted.map(t => t.id)
    newOrder.splice(fromIndex, 1)
    newOrder.splice(toIndex, 0, draggedId)

    setTopicOrder(newOrder)
    localStorage.setItem('nexus-topic-order', JSON.stringify(newOrder))
    setDragOverId(null)
  }

  const handleDragEnd = () => setDragOverId(null)

  const handleExport = async () => {
    const allTopics = await window.nexus.getTopics()
    const allLinks = await window.nexus.getAllLinks()

    const data = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      topics: allTopics,
      links: allLinks,
    }

    const markdown = allTopics.map(topic => {
      const topicLinks = allLinks.filter(l => l.from_id === topic.id || l.to_id === topic.id)
      const linkedTopics = topicLinks.map(l => {
        const otherId = l.from_id === topic.id ? l.to_id : l.from_id
        const other = allTopics.find(t => t.id === otherId)
        return `- **${other?.title || 'Unknown'}**: ${l.relationship}`
      }).join('\n')

      const plainContent = topic.content
        ? topic.content.replace(/<[^>]+>/g, '').trim()
        : ''

      return `# ${topic.title}

**Tags:** ${topic.tags || 'none'}
**Created:** ${new Date(topic.created_at).toLocaleDateString()}

## Notes

${plainContent || '_No notes yet._'}

## Linked Topics

${linkedTopics || '_No links yet._'}

---`
    }).join('\n\n')

    const jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const mdBlob = new Blob([markdown], { type: 'text/markdown' })

    const jsonUrl = URL.createObjectURL(jsonBlob)
    const mdUrl = URL.createObjectURL(mdBlob)

    const jsonLink = document.createElement('a')
    jsonLink.href = jsonUrl
    jsonLink.download = `nexus-export-${new Date().toISOString().split('T')[0]}.json`
    jsonLink.click()

    setTimeout(() => {
      const mdLink = document.createElement('a')
      mdLink.href = mdUrl
      mdLink.download = `nexus-export-${new Date().toISOString().split('T')[0]}.md`
      mdLink.click()
      URL.revokeObjectURL(jsonUrl)
      URL.revokeObjectURL(mdUrl)
    }, 500)
  }

  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result)
        if (!data.topics || !data.links) {
          alert('Invalid Nexus export file.')
          return
        }

        const existingTopics = await window.nexus.getTopics()
        const existingTitles = new Set(existingTopics.map(t => t.title.toLowerCase().trim()))

        const titleToNewId = {}
        let imported = 0
        let skipped = 0

        for (const topic of data.topics) {
          const normalizedTitle = topic.title.toLowerCase().trim()
          if (existingTitles.has(normalizedTitle)) {
            const existing = existingTopics.find(t => t.title.toLowerCase().trim() === normalizedTitle)
            titleToNewId[topic.id] = existing.id
            skipped++
          } else {
            const result = await window.nexus.createTopic(topic.title)
            const newId = result.lastInsertRowid
            titleToNewId[topic.id] = newId
            await window.nexus.updateTopic(newId, topic.content || '', topic.tags || '', topic.title)
            existingTitles.add(normalizedTitle)
            imported++
          }
        }

        const existingLinks = await window.nexus.getAllLinks()
        let linksImported = 0

        for (const link of data.links) {
          const newFromId = titleToNewId[link.from_id]
          const newToId = titleToNewId[link.to_id]
          if (!newFromId || !newToId) continue

          const duplicate = existingLinks.find(l =>
            (l.from_id === newFromId && l.to_id === newToId) ||
            (l.from_id === newToId && l.to_id === newFromId)
          )

          if (!duplicate) {
            await window.nexus.createLink(newFromId, newToId, link.relationship)
            linksImported++
          }
        }

        await loadTopics()
        alert(`Import complete!\n\n✓ ${imported} topics imported\n⊘ ${skipped} duplicates skipped\n✓ ${linksImported} links imported`)
      } catch (err) {
        alert('Failed to import — make sure it is a valid Nexus JSON export file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const filteredTopics = getSortedTopics().filter(topic =>
    topic.title.toLowerCase().includes(search.toLowerCase()) ||
    (topic.content && topic.content.replace(/<[^>]+>/g, '').toLowerCase().includes(search.toLowerCase())) ||
    (topic.tags && topic.tags.toLowerCase().includes(search.toLowerCase()))
  )

  if (showOnboarding) {
    return (
      <Onboarding
        theme={theme}
        onStart={() => {
          localStorage.setItem('nexus-launched', 'true')
          setShowOnboarding(false)
        }}
      />
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: theme.bg, position: 'relative' }}>
      <Sidebar
        topics={getSortedTopics()}
        activeTopicId={activeTopicId}
        activePage={activePage}
        onSelectTopic={openTopic}
        onNewTopic={async () => {
          const result = await window.nexus.createTopic('Untitled')
          await loadTopics()
          openTopic(result.lastInsertRowid)
        }}
        onHome={goHome}
        onGraph={() => setActivePage('graph')}
        onExport={handleExport}
        onImport={() => document.getElementById('import-input').click()}
        theme={theme}
        dragOverId={dragOverId}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragEnd={handleDragEnd}
      />

      <input
        id="import-input"
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleImport}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activePage !== 'graph' && (
          <div style={{
            height: '52px',
            borderBottom: `1px solid ${theme.topbarBorder}`,
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            gap: '12px',
            flexShrink: 0,
            background: theme.bg,
          }}>
            <input
              value={search}
              onChange={e => {
                setSearch(e.target.value)
                if (activePage !== 'home') goHome()
              }}
              placeholder="Search topics, notes, tags..."
              style={{
                flex: 1,
                width: '100%',
                background: theme.inputBg,
                border: `1.5px solid ${darkMode ? '#2a3060' : '#b0bde0'}`,
                borderRadius: '8px',
                padding: '8px 16px',
                color: theme.text2,
                fontSize: '13px',
                outline: 'none',
                fontFamily: 'Inter, sans-serif',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.currentTarget.style.borderColor = theme.accent}
              onBlur={e => e.currentTarget.style.borderColor = darkMode ? '#2a3060' : '#b0bde0'}
            />
            {search && (
              <span style={{ fontSize: '12px', color: theme.text3, whiteSpace: 'nowrap' }}>
                {filteredTopics.length} result{filteredTopics.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}

        <main style={{ flex: 1, overflowY: activePage === 'graph' ? 'hidden' : 'auto', background: theme.bg }}>
          {activePage === 'home' && (
            <Home
              topics={search ? filteredTopics : getSortedTopics()}
              onSelectTopic={openTopic}
              theme={theme}
              search={search}
            />
          )}
          {activePage === 'graph' && (
            <Graph
              topics={topics}
              onSelectTopic={openTopic}
              onBack={goHome}
              theme={theme}
            />
          )}
          {activePage === 'topic' && (
            <Topic
              id={activeTopicId}
              topics={topics}
              onBack={goHome}
              onSelectTopic={openTopic}
              onDelete={async () => {
                await loadTopics()
                goHome()
              }}
              theme={theme}
            />
          )}
        </main>
      </div>

      <button
        onClick={() => {
          const next = !darkMode
          setDarkMode(next)
          localStorage.setItem('nexus-theme', next ? 'dark' : 'light')
        }}
        title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        style={{
          position: 'fixed', bottom: '24px', right: '24px',
          width: '40px', height: '40px', borderRadius: '50%',
          background: theme.toggleBg, border: `1px solid ${theme.toggleBorder}`,
          color: theme.toggleColor, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', zIndex: 999, transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.color = theme.accent }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = theme.toggleBorder; e.currentTarget.style.color = theme.toggleColor }}
      >
        {darkMode ? <BsSun size={16} /> : <BsMoon size={16} />}
      </button>
    </div>
  )
}