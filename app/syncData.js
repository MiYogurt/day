import { rootStore } from './store';
import { ipcRenderer as ipc } from 'electron';
import { action, runInAction, autorun, createTransformer, toJS } from 'mobx';

rootStore.ui.toggleLoad()

ipc.send('read-db');
ipc.on('reply-read-db', (event, state) => {
  console.log(state)
  runInAction(() => {
    rootStore.projects.list = state.projects
    rootStore.config = state.config
    rootStore.ui.toggleLoad()
  })
})

const sync = createTransformer(({
  config, projects
}) => ({
  config: configFormate(config),
  projects: projectsFormate(projects)
}))


const configFormate = createTransformer(config => ({
  packageType: config.packageType
}))

const projectsFormate = createTransformer(projects => projects.list.toJS().map(proj => {
  delete proj.projects;
  return proj;
}))

// createTransformer 缓存没有修改的

autorun('syncData', () => {
  ipc.send('write-db', sync({
    config: rootStore.config,
    projects: rootStore.projects
  }))
})
