const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

function createWindow() {
  const win = new BrowserWindow({
    icon: path.join(__dirname, 'assets/nexus.icns'),
    width: 1200,
    height: 800,
    backgroundColor: '#0a0a0f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
    titleBarStyle: 'hiddenInset',
    show: false,
  })

  win.loadURL('http://localhost:5173')

  win.once('ready-to-show', () => {
    win.setFullScreen(true)
    win.show()
  })
}

app.whenReady().then(() => {
  const db = require('./database/db')

  ipcMain.handle('get-topics', () => db.getTopics())
  ipcMain.handle('create-topic', (_, title) => db.createTopic(title))
  ipcMain.handle('get-topic', (_, id) => db.getTopic(id))
  ipcMain.handle('update-topic', (_, id, content, tags, title) => db.updateTopic(id, content, tags, title))
  ipcMain.handle('delete-topic', (_, id) => db.deleteTopic(id))
  ipcMain.handle('create-link', (_, fromId, toId, relationship) => db.createLink(fromId, toId, relationship))
  ipcMain.handle('get-links', (_, topicId) => db.getLinks(topicId))
  ipcMain.handle('delete-link', (_, id) => db.deleteLink(id))
  ipcMain.handle('get-all-links', () => db.getAllLinks())
  ipcMain.handle('update-link', (_, id, relationship) => db.updateLink(id, relationship))
  ipcMain.handle('get-backlinks', (_, topicId) => db.getBacklinks(topicId))

  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})