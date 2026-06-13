<div align="center">

# NEXUS

**Your knowledge, connected.**

A local-first knowledge graph app for macOS.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Platform](https://img.shields.io/badge/platform-macOS-lightgrey)
![License](https://img.shields.io/badge/license-MIT-green)

</div>

---

Nexus lets you create topics, link them together, and see your knowledge as a live visual graph. Your data stays on your Mac — no accounts, no cloud, no subscriptions.

## Features

- Rich text notes with formatting
- Link topics with relationship descriptions
- Interactive graph view
- Search across titles, notes and tags
- Dark and light mode
- Export to JSON and Markdown
- Fully offline, local SQLite database

## Install

Download the latest `.dmg` from [Releases](https://github.com/suveerkh/nexus/releases), open it, and drag Nexus to Applications.

## Build from source

```bash
git clone https://github.com/suveerkh/nexus.git
cd nexus
npm install
cd renderer && npm install && cd ..
npm install --save-dev @electron/rebuild
./node_modules/.bin/electron-rebuild -f -w better-sqlite3
npm run dev
```

## Shortcuts

| Key | Action |
|-----|--------|
| `⌘N` | New topic |
| `⌘G` | Graph view |
| `⌘F` | Search |
| `⌘E` | Export |
| `Esc` | Go home |

## Tech

Electron · React · SQLite · TipTap · react-force-graph-2d

## License

MIT © Phantom