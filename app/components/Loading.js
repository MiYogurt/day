import React, { Component } from 'react';
import { inject, observer } from 'mobx-react'

const Loading = inject('ui')(observer(({ ui }) => {
  return(
  <div className="loading" style={{
    display: ui.loading ? 'flex': 'none'
  }}>
    <svg version="1.0" width="64px" height="64px" viewBox="0 0 128 128">
      <g transform="translate(0,128) scale(1,-1)">
        <path d="M75.4 126.63a11.43 11.43 0 0 1-2.1-22.65 40.9 40.9 0 0 0 30.5-30.6 11.4 11.4 0 1 1 22.27 4.87h.02a63.77 63.77 0 0 1-47.8 48.05v-.02a11.38 11.38 0 0 1-2.93.37z" fill="#e66196" fillOpacity="1"/>
        <animateTransform attributeName="transform" type="rotate" from="0 64 64" to="360 64 64" dur="1800ms" repeatCount="indefinite"></animateTransform>
      </g>
    </svg>
    <div>载入中...</div>
  </div>
)}))

Loading.displayName = 'Loading'

export default Loading
