import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
const isProd = process.env.NODE_ENV === 'production';
root.render(
  isProd ? (
    <App />
  ) : (
    // Disable StrictMode in development to avoid double effects and duplicate calls
    <App />
  )
);
