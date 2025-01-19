import React from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from './auth/Auth0Provider';
import Monkey from './monkey';
import Notes from './notes';

console.log('content script loaded');


// Create container for Monkey
const containerMonkey = document.createElement('div');
document.body.appendChild(containerMonkey);

// Create container for Notes
const containerNotes = document.createElement('div');
document.body.appendChild(containerNotes);

// Create React roots and render components
const rootMonkey = createRoot(containerMonkey);
rootMonkey.render(
  React.createElement(Auth0Provider, null, 
    React.createElement(Monkey)
  )
);

const rootNotes = createRoot(containerNotes);
rootNotes.render(
  React.createElement(Auth0Provider, null,
    React.createElement(Notes)
  )
);