import 'webextension-polyfill';
import { setupWebSocket } from './websocket';
import { initializeRandomAppearances } from './randomAppearances';

// Initialize features
setupWebSocket();
initializeRandomAppearances();
