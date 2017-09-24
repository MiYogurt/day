/* eslint flowtype-errors/show-errors: 0 */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import App from './containers/App';
import HomePage from './containers/HomePage';
import Project from './containers/Project';
import CounterPage from './containers/CounterPage';

export default () => (
  <App>
    <Switch>
      <Route path="/counter" component={CounterPage} />
      <Route path="/proj/:id" component={Project} />
      <Route exact path="/" component={HomePage} />
    </Switch>
  </App>
);
