import React from 'react';

/** Last-resort screen so a failed screen never leaves a blank page. */
export default class ErrorBoundary extends React.Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(err) {
    console.error('Screen failed to load:', err?.message);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, textAlign: 'center' }}>
        <div style={{ maxWidth: 420 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white' }}>Something went wrong</h1>
          <p style={{ marginTop: 8, color: '#a1a1aa' }}>The app could not load this screen. Your saved workouts are safe on this device.</p>
          <button type="button" onClick={() => window.location.reload()} style={{ marginTop: 16, minHeight: 44, padding: '0 20px', borderRadius: 12, background: '#10b981', color: '#09090b', fontWeight: 700 }}>
            Reload
          </button>
        </div>
      </main>
    );
  }
}
