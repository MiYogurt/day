/* eslint global-require: 1, flowtype-errors/show-errors: 0 */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import { app, BrowserWindow, globalShortcut, ipcMain as ipc } from 'electron';
import MenuBuilder from './menu';

import './main-process/projects'

let mainWindow = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
  require('electron-debug')();
  const path = require('path');
  const p = path.join(__dirname, '..', 'app', 'node_modules');
  require('module').globalPaths.push(p);
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = [
    'REACT_DEVELOPER_TOOLS',
    'REDUX_DEVTOOLS'
  ];

  return Promise
    .all(extensions.map(name => installer.default(installer[name], forceDownload)))
    .catch(console.log);
};


/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('ready', async () => {
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 380,
    height: 700,
    titleBarStyle: 'customButtonsOnHover',
    frame: false
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  let installPanel = null
  let first = true;
  // 进入项目主页
  globalShortcut.register('command+enter', () => {
    installPanel.webContents.send('select-current-enter-github-page')
  })

  // 选择当前包进行安装
  // globalShortcut.register('enter', () => {
  //   installPanel.webContents.send('select-current')
  // })

  const ret = globalShortcut.register('Command+`', () => {
    if (installPanel == null) {
      installPanel = new BrowserWindow({
        width: 800,
        height: 600,
        transparent: true,
        frame: false,
        show: true
      })
      installPanel.loadURL('file://' + __dirname + '/panel.html')
    }

    installPanel.flashFrame(false)
    installPanel.setKiosk(false)
    installPanel.setHasShadow(false)

    if (installPanel.isVisible() && !first) {
      installPanel.hide()
    }else{
      installPanel.show()
    }

    installPanel.webContents.on('did-finish-load', () => {
      first = false;
      installPanel.show()
      installPanel.webContents.openDevTools()
    });
})

  if (!ret) {
    console.log('注册失败')
  }

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
});
