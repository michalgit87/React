/* eslint no-undef:0 import/imports-first:0 */

import 'babel-polyfill';
import './index.html';
import './scss/app.scss';
import './styl/app.styl';
import 'font-awesome-webpack';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { browserHistory, Router } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import routes from './config/routes';
import configureStore from './store/configureStore';
import config from './config/config';
import { scrollToTopOfDiv } from './utils/navigationUtils';
import { scrollableContentDivClassName } from './config/properties';

window.fisecalAppConfig = config;

const store = configureStore();
const history = syncHistoryWithStore(browserHistory, store);

const rootEl = document.getElementById('app');

fisecalAppConfig.setItem('fisecalApiUrl', 'https://api.fisecal.com/api/');

render(
  <Provider store={store}>
    <Router history={history}
            routes={routes}
            onUpdate={() => {
              scrollToTopOfDiv(scrollableContentDivClassName);
            }} />
  </Provider>, rootEl);
