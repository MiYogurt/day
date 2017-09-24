import { rootStore } from './store';
import { ipcRenderer as ipc } from 'electron';
import { action, runInAction, autorun, createTransformer, toJS } from 'mobx';
import { Project } from './model/projects'

rootStore.ui.toggleLoad()

ipc.send('read-db');
ipc.on('reply-read-db', (event, state) => {
  console.log(state)
  runInAction(() => {
    state.projects.forEach((project) => {   // yes
      rootStore.projects.list.push(new Project(
        rootStore.projects,
        project.id,
        project.path,
        project.created_at
      ));
    });
    Object.keys(state.config).forEach(key => {
      if (key in rootStore.config) {
        rootStore.config[key] = state.config[key]
      }
    })
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
