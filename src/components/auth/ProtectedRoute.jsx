import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Override parent styling when loading
  useEffect(() => {
    if (loading) {
      const rootElement = document.getElementById("root");
      if (rootElement) {
        rootElement.style.background = "transparent";
        rootElement.style.padding = "0";
        rootElement.style.margin = "0";
        rootElement.style.boxShadow = "none";
        rootElement.style.border = "none";
        rootElement.style.borderRadius = "0";
        rootElement.style.maxWidth = "none";
        rootElement.style.minHeight = "0";
      }
      
      return () => {
        // Restore original styles when not loading
        if (rootElement) {
          rootElement.style.background = "";
          rootElement.style.padding = "";
          rootElement.style.margin = "";
          rootElement.style.boxShadow = "";
          rootElement.style.border = "";
          rootElement.style.borderRadius = "";
          rootElement.style.maxWidth = "";
          rootElement.style.minHeight = "";
        }
      };
    }
  }, [loading]);

  if (loading) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        margin: 0,
        boxSizing: 'border-box'
      }}>
        <div style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius)',
          padding: '2rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-md)',
          width: '300px'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            border: '3px solid var(--border-soft)',
            borderTop: '3px solid var(--accent-600)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem auto'
          }}></div>
          <p style={{ color: 'var(--text-muted)', margin: '0', fontSize: '0.9rem' }}>Logging in...</p>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;