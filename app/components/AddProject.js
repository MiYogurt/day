// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ipcRenderer as ipc } from 'electron'
import { observer, inject } from 'mobx-react'
import { observable, action } from 'mobx'
import styles from './AddProject.css'

@inject('projects') @observer
export default class AddProjectButton extends Component {
  @action.bound
  openFile(){
    const filePath = ipc.sendSync('add-project')
    if(filePath) this.props.projects.add(filePath)
  }
  render() {
    return (
        <div className={styles.wrap}>
          <button onClick={this.openFile}>添加项目</button>
        </div>
    );
  }
}
