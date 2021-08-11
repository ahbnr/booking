import React from 'react';
import ReactDOM from 'react-dom';
import './i18n';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { DateTime, Settings as LuxonSettings } from 'luxon';

const { DEBUG_TIME_NOW } = process.env;
if (DEBUG_TIME_NOW != null) {
  LuxonSettings.now = () => DateTime.fromISO(DEBUG_TIME_NOW).toMillis();
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
