import React from 'react';
import { createRoot } from 'react-dom/client';
// import Notes from './notes';
import AllMonkeys from './AllMonkeys';

console.log('content script loaded');

// Create container for Monkey
const containerMonkey = document.createElement('div');
document.body.appendChild(containerMonkey);

// Create container for Notes
const containerNotes = document.createElement('div');
document.body.appendChild(containerNotes);

// Create React roots and render components
const rootMonkey = createRoot(containerMonkey);
rootMonkey.render(React.createElement(AllMonkeys));

// const rootNotes = createRoot(containerNotes);
// rootNotes.render(React.createElement(Notes));
