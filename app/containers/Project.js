import React, { Component } from 'react';
import { ipcRenderer as ipc } from 'electron'
import { inject, observer } from 'mobx-react'
import { observable, runInAction, computed, action } from 'mobx'
import { Link } from 'react-router-dom'
import { Project } from '../model/projects'

const Error = (props) => {
  return <div className="error">
    <h3>发生了不可预知的错误...</h3>
  </div>
}

@inject('projects')
@observer
export default class ProjectPage extends Component {
  @observable index = 0;
  @observable error = false;
  constructor(props){
      super(props)
      this.state = {
        need: false,
        packages: [],
        scripts: {},
        all: {
          dev: [],
          prod: []
        },
        pkg: {}
      }
      this.sub()
  }
  componentDidMount(){
    const id = this.props.match.params.id;
    this.index = this.props.projects.list.findIndex(proj => proj.id == id);
    this.requestScan()
  }

  @computed get name(){
    try{
      return this.props.projects.list[this.index].path.split('/').reverse()[0]
    }catch(e){
      this.error = true;
      return ''
    }
  }
  componentWillUnmount(){
    ipc.removeListener('reply-scan-project', this.onReplay)
  }
  @action.bound
  onReplay(event, data) {
    const uiStore = this.props.projects.root.ui;
    console.log(data)
    if (data == '100') { // 没有 packages.json
      this.error = true
    }else{
      this.setState(data)
    }
    uiStore.loading = false;
  }
  sub(){
      ipc.on('reply-scan-project', this.onReplay)
  }

  runScript(name){
    ipc.send('run-script', { path: this.props.projects.list[this.index].path, name })
  }

  @action
  requestScan(){
    runInAction(() => {
      this.error = false;
      const uiStore = this.props.projects.root.ui;
      uiStore.loading = true;
      ipc.send('scan-project', this.props.projects.list[this.index].path)
    })
  }
  render() {
    let need = null;

    if (this.state.need) {
      need =
        <div className="needInstall">
          <div onClick={() => this.runScript('install')}><i className="fa fa-exclamation-circle" aria-hidden="true"></i> 点我安装以下缺失依赖</div>
          <ul>
            { this.state.packages.map((p, index) => {
              return <li key={index}>{p}</li>
            })}
          </ul>
        </div>
    }

    return (
      <div className="project-info">

        <h3><Link to="/" className="left"> 返回 </Link> { this.name } <a className="right" onClick={() => this.requestScan()}> 重新扫描 </a></h3>

        { this.error && <Error resan={this.resan} />}
        <div className="container">
            <div className="dev">
              <span className="label">开发依赖</span>
              { this.state.all.dev.length }
            </div>
            <div className="prod">
              <span className="label">生产依赖</span>
              { this.state.all.prod.length }
            </div>
        </div>

        { need }

        <div className="scripts">
          <h4>NPM 脚本列表</h4>
          <dl>
            {
              Object.keys(this.state.scripts).map(k => (
                <span key={k}>
                  <dt>{k} <span className="right" onClick={ () => this.runScript(k) }>运行</span></dt>
                  <dd><pre>{ this.state.scripts[k] }</pre></dd>
                </span>

              ))
            }
          </dl>
        </div>

      </div>
    );
  }
}
