const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('nexus', {
  getTopics: () => ipcRenderer.invoke('get-topics'),
  createTopic: (title) => ipcRenderer.invoke('create-topic', title),
  getTopic: (id) => ipcRenderer.invoke('get-topic', id),
  updateTopic: (id, content, tags, title) => ipcRenderer.invoke('update-topic', id, content, tags, title),
  deleteTopic: (id) => ipcRenderer.invoke('delete-topic', id),
  createLink: (fromId, toId, relationship) => ipcRenderer.invoke('create-link', fromId, toId, relationship),
  getLinks: (topicId) => ipcRenderer.invoke('get-links', topicId),
  deleteLink: (id) => ipcRenderer.invoke('delete-link', id),
  getAllLinks: () => ipcRenderer.invoke('get-all-links'),
  updateLink: (id, relationship) => ipcRenderer.invoke('update-link', id, relationship),
})