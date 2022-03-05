// All of the Node.js APIs are available in the preload process.

const { contextBridge, ipcRenderer } = require("electron");
const randomName = require('./common/randomname').randomName;
const generateToken = require('./common/randomname').generateToken;


// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
});


contextBridge.exposeInMainWorld('video', {
  generateRoomToken: generateToken(randomName()),
  getScreenSourceId: () => ipcRenderer.invoke('get-screen-source')
});
