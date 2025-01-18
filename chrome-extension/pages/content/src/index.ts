import { toggleTheme } from '@src/toggleTheme';
import React from 'react';
import { createRoot } from 'react-dom/client';
import Monkey from './monkey';

console.log('content script loaded');

void toggleTheme();

// Create container for React
const container = document.createElement('div');
document.body.appendChild(container);

// Create React root and render Monkey
const root = createRoot(container);
root.render(React.createElement(Monkey));
