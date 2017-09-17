// @flow
import React, { Component } from 'react';
import AddProjectButton from '../components/AddProject';
import ProjectList from '../components/ProjectList'

export default class HomePage extends Component {
  render() {
    return (
      <div>
        <AddProjectButton />
        <ProjectList />
      </div>
    );
  }
}
