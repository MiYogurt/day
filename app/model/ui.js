import { observable, action } from 'mobx';

class UI {
  @observable loading = false

  constructor(root){
    this.root = root
  }

  @action
  toggleLoad(){
    this.loading = !this.loading;
  }
}

export {
  UI
}
