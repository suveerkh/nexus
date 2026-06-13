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
`)

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
    SELECT l.id, l.from_id, l.to_id, l.relationship,
      CASE WHEN l.from_id = ? THEN t2.title ELSE t1.title END as to_title
    FROM links l 
    JOIN topics t1 ON l.from_id = t1.id
    JOIN topics t2 ON l.to_id = t2.id
    WHERE l.from_id = ? OR l.to_id = ?
  `).all(topicId, topicId, topicId),
  deleteLink: (id) => db.prepare('DELETE FROM links WHERE id = ?').run(id),
  getAllLinks: () => db.prepare('SELECT * FROM links').all(),
}