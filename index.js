import React from 'react';
import ReactDOM from 'react-dom/client';
import MCMAudioPlayer from './MCMAudioPlayer';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MCMAudioPlayer />
  </React.StrictMode>
);

serviceWorkerRegistration.register();