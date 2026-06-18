const Database = require('better-sqlite3')
const path = require('path')
const { app } = require('electron')

const dbPath = path.join(app.getPath('userData'), 'nexus.db')
const db = new Database(dbPath)

db.exec(`
  CREATE TABLE IF NOT EXISTS topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    tags TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_id INTEGER,
    to_id INTEGER,
    relationship TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_id) REFERENCES topics(id),
    FOREIGN KEY (to_id) REFERENCES topics(id)
  );

  CREATE TABLE IF NOT EXISTS clusters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#4a7fff',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`)

// Safe migrations for existing DBs
const migrations = [
  `ALTER TABLE topics ADD COLUMN pos_x REAL`,
  `ALTER TABLE topics ADD COLUMN pos_y REAL`,
  `ALTER TABLE topics ADD COLUMN cluster_id INTEGER REFERENCES clusters(id)`,
]
for (const sql of migrations) {
  try { db.exec(sql) } catch {}
}

module.exports = {
  getTopics: () => db.prepare('SELECT * FROM topics ORDER BY created_at DESC').all(),
  createTopic: (title) => db.prepare('INSERT INTO topics (title) VALUES (?)').run(title),
  getTopic: (id) => db.prepare('SELECT * FROM topics WHERE id = ?').get(id),
  updateTopic: (id, content, tags, title) => {
    if (title !== undefined) {
      return db.prepare('UPDATE topics SET title = ?, content = ?, tags = ? WHERE id = ?').run(title, content, tags, id)
    }
    return db.prepare('UPDATE topics SET content = ?, tags = ? WHERE id = ?').run(content, tags, id)
  },
  deleteTopic: (id) => {
    db.prepare('DELETE FROM links WHERE from_id = ? OR to_id = ?').run(id, id)
    db.prepare('DELETE FROM topics WHERE id = ?').run(id)
  },
  updateLink: (id, relationship) => db.prepare('UPDATE links SET relationship = ? WHERE id = ?').run(relationship, id),
  createLink: (fromId, toId, relationship) => db.prepare('INSERT INTO links (from_id, to_id, relationship) VALUES (?, ?, ?)').run(fromId, toId, relationship),
  getLinks: (topicId) => db.prepare(`
    SELECT l.id, l.from_id, l.to_id, l.relationship, t2.title as to_title
    FROM links l
    JOIN topics t2 ON l.to_id = t2.id
    WHERE l.from_id = ?
  `).all(topicId),
  getBacklinks: (topicId) => db.prepare(`
    SELECT l.id, l.from_id, l.to_id, l.relationship, t1.title as to_title
    FROM links l
    JOIN topics t1 ON l.from_id = t1.id
    WHERE l.to_id = ?
  `).all(topicId),
  deleteLink: (id) => db.prepare('DELETE FROM links WHERE id = ?').run(id),
  getAllLinks: () => db.prepare('SELECT * FROM links').all(),

  // Node position
  saveNodePosition: (id, x, y) => db.prepare('UPDATE topics SET pos_x = ?, pos_y = ? WHERE id = ?').run(x, y, id),

  // Clusters
  getClusters: () => db.prepare('SELECT * FROM clusters ORDER BY created_at ASC').all(),
  createCluster: (name, color) => db.prepare('INSERT INTO clusters (name, color) VALUES (?, ?)').run(name, color),
  updateCluster: (id, name, color) => db.prepare('UPDATE clusters SET name = ?, color = ? WHERE id = ?').run(name, color, id),
  deleteCluster: (id) => {
    db.prepare('UPDATE topics SET cluster_id = NULL WHERE cluster_id = ?').run(id)
    db.prepare('DELETE FROM clusters WHERE id = ?').run(id)
  },
  setTopicCluster: (topicId, clusterId) => db.prepare('UPDATE topics SET cluster_id = ? WHERE id = ?').run(clusterId, topicId),
}