import { observable, action, runInAction, autorun, createTransformer, toJS } from 'mobx';
import { createHashHistory } from 'history';
import { ipcRenderer as ipc } from 'electron';

import { Project, Projects } from '../model/projects';
import { UI } from '../model/ui';
import { Config } from '../model/config';

class RootStore {
    constructor() {
      this.projects = new Projects(this);
      this.ui = new UI(this);
      this.config = new Config(this);
    }
}

const rootStore = new RootStore();
const history = createHashHistory();

export { rootStore , history };
