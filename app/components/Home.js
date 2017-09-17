// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.css';
import { ipcRenderer as ipc } from 'electron'
import { observer } from 'mobx-react'
import { observable, action } from 'mobx'

@observer
export default class Home extends Component {
  @observable filepath = "None";
  @action.bound
  openFile(){
    console.log("open")
    const filePath = ipc.sendSync('add-project')
    this.filepath = filePath;
  }
  render() {
    return (
      <div>
        <div className={styles.container} data-tid="container">
          <h2>Home</h2>
          <h3>{ this.filepath }</h3>
          <button onClick={this.openFile}>打开文件窗口</button>
          <Link to="/counter">to Counter</Link>
        </div>
      </div>
    );
  }
}
