import React from 'react';
import { createRoot } from 'react-dom/client';
import Monkey from './AllMonkeys';
// import Notes from './notes';

console.log('content script loaded');

// Create container for Monkey
const containerMonkey = document.createElement('div');
document.body.appendChild(containerMonkey);

// Create React root and render Monkey
const rootMonkey = createRoot(containerMonkey);
rootMonkey.render(React.createElement(Monkey));

// Create container for Notes
const containerNotes = document.createElement('div');
document.body.appendChild(containerNotes);

