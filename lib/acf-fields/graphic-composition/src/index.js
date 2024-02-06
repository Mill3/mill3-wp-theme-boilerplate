import { Provider } from 'react-redux'
import { createRoot } from '@wordpress/element';

import App from './js/App';
import store from './js/store'

// Import the stylesheet for the plugin.
import './css/App.scss';

var container, root;

const callback = { state: null, resolve: null, reject: null };
const onCancel = () => { container.close(); }
const onDone = (state) => {
  callback.state = state;
  container.close();
}

window.OpenGraphicCompositionEditor = function(layers, settings) {
  if( !container ) {
    container = document.getElementById('GraphicComposition');
    container.addEventListener('close', function() {
      // trigger Promise
      if( callback.state ) callback.resolve(callback.state);
      else callback.reject();

      // delete previous state
      callback.state = null;
      callback.resolve = null;
      callback.reject = null;
    });
  }

  if( !root ) root = createRoot(container);

  // transform JSON to React
  layers.forEach((layer, index) => layer.id = index);

  // render Application
  root.render(
    <Provider store={ store }>
      <App layers={ layers } settings={ settings } onDone={ onDone } onCancel={ onCancel } />
    </Provider>
  );
  
  // show modal
  container.showModal();

  // return Promise
  return new Promise(function(resolve, reject) {
    callback.resolve = resolve;
    callback.reject = reject;
  });;
}
