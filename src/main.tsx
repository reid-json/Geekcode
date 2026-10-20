import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: string }> {
  state = { error: '' };
  static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Geekcode rendering error', error, info.componentStack);
  }
  render() {
    return this.state.error ? (
      <main>
        <h1>The lab hit a snag.</h1>
        <pre className="error">{this.state.error}</pre>
        <p>Your stored progress has not been reset. Reload to try again.</p>
        <button onClick={() => location.reload()}>Reload Geekcode</button>
      </main>
    ) : (
      this.props.children
    );
  }
}
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
