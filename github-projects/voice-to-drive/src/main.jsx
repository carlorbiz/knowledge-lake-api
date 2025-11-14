console.log('🔵 main.jsx is loading...');

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('🔵 React imported successfully');

// Load Google API script
const script = document.createElement('script');
script.src = 'https://apis.google.com/js/api.js';
script.async = true;
script.defer = true;
document.head.appendChild(script);

console.log('🔵 About to render React app...');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('🔵 React app rendered!');

// TEMPORARILY DISABLED - Service worker caching old version
// Register service worker for PWA
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker
//       .register('/sw.js')
//       .then(registration => {
//         console.log('Service Worker registered:', registration);
//       })
//       .catch(error => {
//         console.error('Service Worker registration failed:', error);
//       });
//   });
// }

// Unregister any existing service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('Unregistered service worker');
    }
  });
}
