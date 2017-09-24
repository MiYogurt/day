import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ipcRenderer as ipc } from 'electron'
import { observer, inject } from 'mobx-react'
import { observable, action, computed } from 'mobx'
import styles from './Project.css'

@inject('projects') @observer
export default class Project extends Component {
  @observable show = false

  @computed
  get projectName(){
    return this.props.project.path.split('/').reverse()[0]
  }
  @action.bound
  showHandle(){
    this.show = !this.show
  }
  @action.bound
  del(){
    this.props.projects.remove(this.props.project) // it's work
  }
  render() {
    return (
        <div className={styles.project}>
          <h5 className={styles.name}>{this.projectName}</h5>
          <p className={ styles.path }>Path: {this.props.project.path}</p>
          <button className={ styles.btn } onClick={this.showHandle}>
            · · ·
            <menu className={ styles.menu } style={{ display: this.show ? 'block': 'none' }}>
              <ul>
                <li><Link to={"/proj/" + this.props.project.id} >进入详情</Link></li>
                <li><a href="javascript:void(0);">重新扫描</a></li>
                <li><a href="javascript:void(0);" onClick={this.del}>删除项目</a></li>
              </ul>
            </menu>
          </button>
        </div>
    );
  }
}
