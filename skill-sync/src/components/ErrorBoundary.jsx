// src/components/ErrorBoundary.jsx
import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // still log to console for debugging
    console.error("ErrorBoundary caught:", error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, color: '#fff', fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial' }}>
          <div style={{ maxWidth: 900, margin: '40px auto', background: '#111827', borderRadius: 8, padding: 24, boxShadow: '0 8px 24px rgba(2,6,23,0.6)' }}>
            <h2 style={{ color: '#ffb4b4', margin: 0 }}>Something went wrong</h2>
            <p style={{ color: '#cbd5e1' }}>The app encountered an error during rendering. (This is a development-only diagnostic overlay.)</p>
            <pre style={{ whiteSpace: 'pre-wrap', color: '#ffc9c9', background: 'rgba(0,0,0,0.4)', padding: 12, borderRadius: 6 }}>
              {String(this.state.error?.message || this.state.error)}
            </pre>
            <details style={{ color: '#9ca3af', marginTop: 12 }}>
              <summary style={{ cursor: 'pointer' }}>View stack trace in console</summary>
              <div style={{ marginTop: 8 }}>
                Check your browser console for the full stack trace and source file links.
              </div>
            </details>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
