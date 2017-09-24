import { observable, action } from 'mobx';

class Config {
  @observable packageType = 'npm'
  constructor(root){
    this.root = root
  }
}

export {
  Config
}
