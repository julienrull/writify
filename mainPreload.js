const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  loadFolderFiles: () => ipcRenderer.invoke('loadFolderFiles'),
  saveFolderFiles: (fileName, textContent, path, type) => ipcRenderer.invoke('saveFolderFiles', fileName, textContent, path, type),
  renameFolderOrFile: (treeElementName, newTreeElementName, path) => ipcRenderer.invoke('renameFolderOrFile', treeElementName, newTreeElementName, path),
  deleteFolderOrFile: (treeElementName, type, path) => ipcRenderer.invoke('deleteFolderOrFile', treeElementName, type, path),
});