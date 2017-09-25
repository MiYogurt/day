import { ipcMain as ipc, dialog, nativeImage, Notification, BrowserWindow } from 'electron'
import db from './db'
import { resolve } from 'path';
import fs from 'graceful-fs'
import crossSpawn from 'cross-spawn'
import globby from 'globby'
import { readJsonSync } from 'fs-extra'
import _ from 'lodash'


const show = (title, message) => {
  // const icon = nativeImage.createFromPath(
  //   resolve(__dirname + '/../../resources/message.png')
  // )
  if(Notification.isSupported()){
    new Notification({
      // icon,
      title,
      body: message
    }).show()
  } else {
    dialog.showMessageBox({
      title,
      message: title,
      detail: message,
      // icon
    })
  }

}

function first(arr){
  if(arr instanceof Array) return arr[0]
  return arr
}

function last(arr){
  return arr[ arr.length - 1 ]
}

const options = {
  properties:['openDirectory']
}

function needInitPackageJson(path, sender){
  fs.access(path + '/package.json', fs.constants.R_OK | fs.constants.W_OK, (err) => {
    if (!err) return;

    dialog.showMessageBox({
      title: '需要初始化',
      message: '你添加的项目下面没有 package.json 文件',
      buttons: ['确认', '取消'],
      type: 'question'
    }, (index) => {
      if(!index == 0) {
        return sender.send('reply-scan-project', '100') // 没有 package.json 文件
      };
      crossSpawn('npm', ['init', '-y'], {
        cwd: path,
        stdio: 'ignore'
      })
      return sender.send('reply-scan-project', {
        need: false,
        packages: [],
        scripts: {
          "test": "echo \"Error: no test specified\" && exit 1"
        },
        all: {
          dev: [],
          prod: []
        },
        pkg: readJsonSync(path + '/package.json')
      })
    })

  })
}

ipc.on('run-script', (event, {path, name }) => {
  console.log(path)
  console.log(name)

  let win = new BrowserWindow({width: 800, height: 600});
  let cmd ;

  win.on('close', () => {
    win = null
    if (cmd) {cmd.kill('SIGHUP')}
  })

  win.webContents.on('did-frame-finish-load', () => {
      let argsArr = name.split(' ')
      console.log(argsArr)
      if (!(argsArr.includes('i') || argsArr.includes('install'))) {
        argsArr.unshift('run')
      }
      console.log(argsArr)
      cmd = crossSpawn('npm', argsArr, {
        cwd: path
      });
      win.webContents.send('data', '正在安装，请耐心等待');

      cmd.stdout.on('data', (data) => {
        console.log(data.toString())
        win.webContents.send('data', data.toString())
      })

      cmd.stderr.on('data', (data) => {
        console.log(data.toString())
        win.webContents.send('data', data.toString())
      })

      cmd.on('close', (exitCode) => {
        console.log(event)
        if(exitCode){
          win.webContents.send('data', "错误退出")
        }else{
          win.webContents.send('data', "正常退出")
          // win.close()
        }
      })
  })

  win.once('ready-to-show', () => {
    win.show()
  })

  win.loadURL(`file://${__dirname}/cmd.html`)



})

ipc.on('scan-project', (event, filepath) => {
  // 确认是否存在 package.json
  needInitPackageJson(filepath, event.sender)
  let scanInfo = {}
  // 是否有未安装的依赖
  fs.access(filepath + '/node_modules', fs.constants.R_OK | fs.constants.W_OK, (err) => {
    console.log(err)
    const pkg = readJsonSync(filepath + '/package.json')
    const prod = Object.keys(pkg.dependencies)
    const dev = Object.keys(pkg.devDependencies)
    if (err) {
      scanInfo = {
        need: true,
        packages: ['all'],
        scripts: pkg.scripts,
        all: {
          dev,
          prod,
        },
        pkg: pkg,
      };
      event.sender.send('reply-scan-project', scanInfo)
    }else{

        const packages = prod.concat(dev)
        const packagePaths = packages.map(p => filepath + '/node_modules/' + p)
        globby(packagePaths).then(results => {
          const noInstall = _.differenceWith(packages, results, (one, two) => {
            return _.includes(two, one)
          })
          if (noInstall.length == 0) {
            event.sender.send('reply-scan-project', {
              need: false,
              packages: [],
              scripts: pkg.scripts,
              all: {
                dev,
                prod
              },
              pkg,
            })
          }else{
            event.sender.send('reply-scan-project', {
              need: true,
              packages: noInstall,
              scripts: pkg.scripts,
              all: {
                dev,
                prod
              },
              pkg
            })
          }
        })
    }
  })
})

ipc.on('add-project', (event, args) => {
  dialog.showOpenDialog(options, filepaths => {
    if(!filepaths) {
      event.returnValue = ''
      return;
    }

    const projectName = last(
      first(filepaths).split('/')
    );

    if(db.get('projects').value().some(proj => proj.path == first(filepaths))){
      event.returnValue = ''
      show("添加失败", `项目：${projectName} 已经存在不能重复添加`)
      return
    }
    event.returnValue = first(filepaths);
    show("添加成功", `项目：${projectName} 添加成功`)
  })
})

ipc.on('read-db', (event, args = null) => {
  const state = db.getState();
  const reply = data => event.sender.send('reply-read-db', data)

  if (!args) reply(state)
  if (state[args]) reply(state[args])
})

ipc.on('write-db', (event, state) => {
  console.log("== write ==");
  if(state) {
    db.setState(state).write()
  }
  console.log(state);
})
