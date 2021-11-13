import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import Swissmap from './components/Swissmap';
import Contact from './components/Contact';

import 'ol/ol.css';
import './style.css';

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/contact" component={Contact} />
        <Route path="/" component={Swissmap} />
      </Switch>
    </BrowserRouter>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
);

serviceWorkerRegistration.register();
