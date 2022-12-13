const { app, BrowserWindow, ipcMain } = require('electron')
const fs = require('fs');
const path = require('path');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    icon: `${__dirname}/src/assets/favicon.ico`,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, 'mainPreload.js'),
    }
  })
  ipcMain.handle('loadFolderFiles', () => {
    try{
      console.log(fs);
      const filePath = 'C:\\Users\\julie\\Desktop\\writifyWorkspace\\testFS.txt';
      const data = fs.readFileSync(filePath, 'utf8');
      console.log(data);
      return {"name": path.basename(filePath), "content": data.toString()};
    }catch(err){
      console.error(err);
      return "ERROR";
    }
  });
  win.loadFile(`${__dirname}/dist/index.html`)
  win.webContents.openDevTools();
}


app.whenReady().then(() => {
  createWindow()
})