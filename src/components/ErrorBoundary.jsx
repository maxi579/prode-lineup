import { Component } from 'react';
import { Zap, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#0D0D0D',
          color: '#fff',
          fontFamily: 'Inter, sans-serif',
          padding: '24px',
          textAlign: 'center',
          gap: '16px',
        }}>
          <div style={{
            width: 64,
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#FFD24C',
            color: '#0D0D0D',
            borderRadius: 16,
            marginBottom: 8,
          }}>
            <Zap size={32} />
          </div>
          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '1.5rem',
            fontWeight: 800,
            letterSpacing: '0.05em',
          }}>
            Algo salió mal
          </h1>
          <p style={{
            color: '#A0A0A0',
            fontSize: '0.9rem',
            maxWidth: 400,
            lineHeight: 1.6,
          }}>
            Ocurrió un error inesperado. Podés volver al inicio para seguir usando la app.
          </p>
          <button
            onClick={this.handleReset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 24px',
              background: '#FFD24C',
              color: '#0D0D0D',
              border: 'none',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              marginTop: 8,
            }}
          >
            <RefreshCw size={16} />
            Volver al inicio
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
