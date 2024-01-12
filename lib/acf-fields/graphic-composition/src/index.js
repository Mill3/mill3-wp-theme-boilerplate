import App from './js/App';
import { createRoot } from '@wordpress/element';

// Import the stylesheet for the plugin.
import './css/App.scss';

// make sure ACF Javascript API is available
if( typeof acf.add_action !== 'undefined' ) {
  var appInitialized = false;

  function initializeApp() {
    if( appInitialized ) return;
    appInitialized = true;

    // Render the App component into the DOM
    const container = document.getElementById('GraphicComposition');
    const root = createRoot(container);
          root.render(<App />);
  }

  acf.addAction('new_field/type=graphic_composition', initializeApp);
}
