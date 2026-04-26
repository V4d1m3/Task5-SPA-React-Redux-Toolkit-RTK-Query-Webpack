import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './app/App';
import { store } from './app/store';
import './styles/global.css';

const routerBasename =
  process.env.NODE_ENV === 'production'
    ? '/Task5-SPA-React-Redux-Toolkit-RTK-Query-Webpack'
    : '/';

const rootEl = document.getElementById('root');
const root = createRoot(rootEl);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter basename={routerBasename}>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
