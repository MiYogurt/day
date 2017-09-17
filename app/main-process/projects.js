import { ipcMain as ipc, dialog, nativeImage, Notification } from 'electron'
import db from './db'
import { resolve } from 'path';

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
