import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/theme.css';
import { isCloudConfigured } from './lib/supabaseClient';

// A production build without Supabase settings would silently run with no accounts. Refuse to start instead.
function NotConfigured() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, textAlign: 'center' }}>
      <div style={{ maxWidth: 420 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white' }}>FitLog Pro is not configured</h1>
        <p style={{ marginTop: 8, color: '#a1a1aa' }}>
          This deployment is missing its account settings. The site owner needs to set the Supabase environment variables and redeploy.
        </p>
      </div>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {import.meta.env.PROD && !isCloudConfigured ? <NotConfigured /> : <App />}
  </React.StrictMode>
);
