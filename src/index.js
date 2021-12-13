const {app, BrowserWindow,ipcMain,Notification} = require('electron')
const path = require('path')


app.setAppUserModelId("Osu Beatmaps")

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    minHeight: 600,
    minWidth: 900,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname,'./main/index.html'))

  // Open the DevTools.
  // disabled menu
  mainWindow.setMenuBarVisibility(false)

  // mainWindow.webContents.openDevTools()
  if (Notification.isSupported() == true) {
    const notification = new Notification({
      title: 'App Started!',
      body: 'You Can Open The App Now',
      icon: path.join(__dirname, './public/favicon.ico')
    })

    notification.show()

    notification.on("click", () => {
      mainWindow.focus()
    })
  }
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
  
ipcMain.on("setpath", function(event){
  const { dialog } = require('electron')
  dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
    properties: ['openDirectory']
  }).then(result => {
      event.sender.send('pathdata', result);
  })
})

ipcMain.on("download", async function(event,args){
  let { stream, headers } = await downloadBeatmapset(args.id,args.token)
  let fileName = `${args.id} ${args.artist} - ${args.title}.osz`.replace(/[^0-9A-Za-z!@#$%^&()_+=[\]'. -]/g, "");
  let writeStream = createWriteStream(`${args.path}/${fileName}`);

  const totalLength = parseInt(headers['content-length']);
  let dlLength = 0;
  
  stream.on("data", (chunk) => {
      dlLength += chunk.length;
      event.sender.send('downloading', {progress:`${Math.round(dlLength / totalLength * 100)}%`,id:args.id});
  });

  stream.on("end", () => {
      sendNotification(`Downloader`,`${args.title} - ${args.artist} has been downloaded!`)
      event.sender.send('downloading', {progress:`100%`,id:args.id});
  });

  stream.pipe(writeStream);
})

const axios = require('axios');
const {createWriteStream} = require('fs');
async function downloadBeatmapset(mapsetId,accesstoken) {
  let api = axios.create({
      baseURL: "https://osu.ppy.sh/api/v2",
      headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Methods': '*'
      },
  });
  
  console.log(mapsetId)
  let { data, headers } = await api.get(`/beatmapsets/${mapsetId}/download`, {
      responseType: "stream",
      headers: {
          'Authorization': `Bearer ${accesstoken}`
      },
      timeout: 240e3
  });
  return {
      stream: data,
      headers
  };
}

function sendNotification(title,body){
  if (Notification.isSupported() == true) {
    const copied = {
      title,
      body,
      icon: path.join(__dirname, './favicon.ico')
    }

    new Notification(copied).show()
  }
}