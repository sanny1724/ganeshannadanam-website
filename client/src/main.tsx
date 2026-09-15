import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Automatically clear legacy seed cache
try {
  localStorage.removeItem('local_annadanams');
  localStorage.removeItem('annadanams_cache');
} catch (e) {}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
