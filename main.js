// Modules to control application life and create native browser window
const { app, BrowserWindow } = require("electron");
const path = require("path");
const wsServer = require("ws").Server;
const getPort = require("./socket/port");
const { ipcMain } = require("electron");
const ip = require("./socket/ip");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 450,
    height: 250,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile("index.html");

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on("closed", function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  // 创建服务器
  createServer();
}

function createServer() {
  const PORT = 9090;

  getPort(PORT).then(port => {
    //通信
    ipcMain.on("asynchronous-message", (event, arg) => {
      const data = { port, ip };
      if (arg === "ok") {
        event.sender.send("asynchronous-reply", JSON.stringify(data));
      }
    });

    //创建服务
    const ws = new wsServer({
      port: port
    });

    //线程池
    let arr = [];
    //connection
    ws.on("connection", socket => {
      arr.push(socket);
      //message
      socket.on("message", msg => {
        //对其余客户端广播消息
        arr.forEach(el => {
          if (el !== socket && el.readyState === 1) {
            el.send(msg);
          }
        });
      });

      socket.on("close", function(msg) {
        // 连接关闭时，将其移出连接池
        arr = arr.filter(function(el) {
          return el !== socket;
        });
      });
    });
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function() {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", function() {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
