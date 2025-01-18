import { createRoot } from 'react-dom/client';
import '@src/index.css';
import Popup from '@src/Popup';
import { Auth0Provider } from './auth/Auth0Provider';

function init() {
  const appContainer = document.querySelector('#app-container');
  if (!appContainer) {
    throw new Error('Can not find #app-container');
  }
  const root = createRoot(appContainer);

  root.render(
    <Auth0Provider>
      <Popup />
    </Auth0Provider>
  );
}

init();
