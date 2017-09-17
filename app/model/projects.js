import { observable, action } from 'mobx';
import shortid from 'shortid';

class Project {
  @observable id
  @observable path
  @observable created_at

  constructor(projects, id, path, created_at){
    this.projects = projects
    this.id = id
    this.path = path
    this.created_at = created_at
  }

  @action
  remove(){
    this.projects.remove(this)
  }
}

class Projects {
  @observable list = []

  constructor(root){
    this.root = root
  }
  @action
  add(filepath){
    if (this.list.some(proj => proj.path == filepath)) {
      return;
    }
    this.list.push(
      new Project(this, shortid.generate(), filepath, new Date())
    )
  }
  @action
  remove(project){
      this.list.splice(this.list.indexOf(project), 1);
  }
}


let proj = new Project({}, '123', '123', new Date())
console.log(proj.remove) // have function

export {
  Project,
  Projects
}
