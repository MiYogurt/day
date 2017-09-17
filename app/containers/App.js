// @flow
import React, { Component } from 'react';
import type { Children } from 'react';
import DevTools from 'mobx-react-devtools';
import Loading from '../components/Loading'

export default class App extends Component {
  props: {
    children: Children
  };

  render() {
    return (
      <div>
        <Loading />
        <DevTools position={{
          bottom: 0,
          right: 20
        }} />
        <div>{this.props.children}</div>
      </div>
    );
  }
}
