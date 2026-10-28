import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Fonts are served from our own domain (latin subset only): no render-blocking third-party stylesheet.
import '@fontsource-variable/inter/wght.css';
import '@fontsource-variable/jetbrains-mono/wght.css';
import '@fontsource-variable/outfit/wght.css';
import './styles/theme.css';
import { isCloudConfigured } from './lib/neonClient';

// A production build without its backend settings would silently run with no accounts. Refuse to start instead.
function NotConfigured() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, textAlign: 'center' }}>
      <div style={{ maxWidth: 420 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white' }}>FitLog Pro is not configured</h1>
        <p style={{ marginTop: 8, color: '#a1a1aa' }}>
          This deployment is missing its account settings. The site owner needs to set NEON_AUTH_BASE_URL and NEON_FUNCTION_API_BASE_URL and redeploy.
        </p>
      </div>
    </main>
  );
}

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {import.meta.env.PROD && !isCloudConfigured ? <NotConfigured /> : <App />}
  </React.StrictMode>
);
