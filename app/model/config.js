import { observable, action } from 'mobx';

class Config {
  @observable packageType
  constructor(root){
    this.root = root
    this.packageType = 'npm'
  }
}

export {
  Config
}
