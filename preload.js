const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('nexus', {
  getTopics: () => ipcRenderer.invoke('get-topics'),
  createTopic: (title) => ipcRenderer.invoke('create-topic', title),
  getTopic: (id) => ipcRenderer.invoke('get-topic', id),
  updateTopic: (id, content, tags, title) => ipcRenderer.invoke('update-topic', id, content, tags, title),
  deleteTopic: (id) => ipcRenderer.invoke('delete-topic', id),
  createLink: (fromId, toId, relationship) => ipcRenderer.invoke('create-link', fromId, toId, relationship),
  getLinks: (topicId) => ipcRenderer.invoke('get-links', topicId),
  getBacklinks: (topicId) => ipcRenderer.invoke('get-backlinks', topicId),
  deleteLink: (id) => ipcRenderer.invoke('delete-link', id),
  getAllLinks: () => ipcRenderer.invoke('get-all-links'),
  updateLink: (id, relationship) => ipcRenderer.invoke('update-link', id, relationship),
  saveNodePosition: (id, x, y) => ipcRenderer.invoke('save-node-position', id, x, y),
  getClusters: () => ipcRenderer.invoke('get-clusters'),
  createCluster: (name, color) => ipcRenderer.invoke('create-cluster', name, color),
  updateCluster: (id, name, color) => ipcRenderer.invoke('update-cluster', id, name, color),
  deleteCluster: (id) => ipcRenderer.invoke('delete-cluster', id),
  setTopicCluster: (topicId, clusterId) => ipcRenderer.invoke('set-topic-cluster', topicId, clusterId),
})