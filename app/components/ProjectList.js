import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ipcRenderer as ipc } from 'electron'
import { observer, inject } from 'mobx-react'
import { observable, action } from 'mobx'
import Project from './Project'
import styles from './ProjectList.css'

@inject('projects')
@observer
export default class ProjectList extends Component {
  render() {
    return (
        <div className={styles.projectList}>
          { this.props.projects.list.map(project => <Project project={project} key={project.id} />) }
        </div>
    );
  }
}
