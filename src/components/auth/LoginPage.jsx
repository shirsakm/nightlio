import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useConfig } from '../../contexts/ConfigContext';
import './LoginPage.css';

// Prefer runtime config-provided client ID to avoid build-time mismatch.
// Falls back to Vite env only if present; otherwise null to block incorrect init.
const FALLBACK_GOOGLE_CLIENT_ID =
  (import.meta.env && import.meta.env.VITE_GOOGLE_CLIENT_ID) || null;

const LoadingSpinner = () => (
  <svg className="login-page__spinner" viewBox="0 0 24 24" aria-hidden="true">
    <circle className="login-page__spinner-circle" cx="12" cy="12" r="10" />
  </svg>
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path
      d="M17.64 9.20454C17.64 8.56636 17.5827 7.95272 17.4764 7.36363H9V10.845H13.8436C13.635 11.97 13.0009 12.9231 12.0477 13.5613V15.8195H14.9564C16.6582 14.2527 17.64 11.9454 17.64 9.20454Z"
      fill="#4285F4"
    />
    <path
      d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z"
      fill="#34A853"
    />
    <path
      d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54772 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z"
      fill="#FBBC05"
    />
    <path
      d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z"
      fill="#EA4335"
    />
  </svg>
);

const LoginPage = () => {
  const { login } = useAuth();
  const { config } = useConfig();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const googleClientId = useMemo(
    () => config.google_client_id || FALLBACK_GOOGLE_CLIENT_ID,
    [config.google_client_id],
  );

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const rootElement = document.getElementById('root');
    if (!rootElement) return undefined;

    const previousStyles = {
      background: rootElement.style.background,
      padding: rootElement.style.padding,
      margin: rootElement.style.margin,
      boxShadow: rootElement.style.boxShadow,
      border: rootElement.style.border,
      borderRadius: rootElement.style.borderRadius,
    };

    Object.assign(rootElement.style, {
      background: 'transparent',
      padding: '0',
      margin: '0',
      boxShadow: 'none',
      border: 'none',
      borderRadius: '0',
    });

    return () => {
      Object.assign(rootElement.style, previousStyles);
    };
  }, []);

  const handleGoogleResponse = useCallback(
    async (response) => {
      if (!response?.credential) {
        setMessage('Google response was empty. Please try again.');
        return;
      }

      setIsLoading(true);
      setMessage('');

      try {
        const result = await login(response.credential);
        if (!result.success) {
          setMessage(result.error || 'Login failed. Please try again.');
        } else {
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error('Login with Google failed.', error);
        setMessage('Login failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [login],
  );

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);


  const initializeGoogle = useCallback(() => {
    if (typeof window === 'undefined' || !googleClientId) {
      return undefined;
    }

    const scriptSrc = 'https://accounts.google.com/gsi/client';

    const initialize = () => {
      if (!window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleResponse,
      });
    };

    if (window.google?.accounts?.id) {
      initialize();
      return undefined;
    }

    const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);

    if (existingScript) {
      existingScript.addEventListener('load', initialize);
      return () => existingScript.removeEventListener('load', initialize);
    }

    const script = document.createElement('script');
    script.src = scriptSrc;
    script.async = true;
    script.defer = true;

    const handleLoad = () => {
      initialize();
    };

    const handleError = () => {
      setMessage('Failed to load Google services. Please check your internet connection.');
    };

    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);
    document.body.appendChild(script);

    return () => {
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
    };
  }, [googleClientId, handleGoogleResponse]);

  useEffect(() => {
    if (!config.enable_google_oauth) return undefined;
    if (!googleClientId) {
      setMessage('Google OAuth is enabled but GOOGLE_CLIENT_ID is not configured.');
      return undefined;
    }

    return initializeGoogle();
  }, [config.enable_google_oauth, googleClientId, initializeGoogle]);

  const handleGoogleLogin = useCallback(() => {
    if (!config.enable_google_oauth) return;

    if (typeof window === 'undefined') {
      setMessage('Google services not loaded. Please refresh the page.');
      return;
    }

    if (!window.google?.accounts?.id) {
      setMessage('Google services not loaded. Please refresh the page.');
      return;
    }

    try {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          const tempDiv = document.createElement('div');
          tempDiv.style.position = 'absolute';
          tempDiv.style.left = '-9999px';
          document.body.appendChild(tempDiv);

          window.google.accounts.id.renderButton(tempDiv, {
            theme: 'outline',
            size: 'large',
          });

          setTimeout(() => {
            const googleBtn = tempDiv.querySelector('div[role="button"]');
            if (googleBtn) {
              googleBtn.click();
            }
            document.body.removeChild(tempDiv);
          }, 100);
        }
      });
    } catch (error) {
      console.error('Google sign-in prompt failed.', error);
      setMessage('Sign-in failed. Please try refreshing the page.');
    }
  }, [config.enable_google_oauth]);

  const handleSelfHostContinue = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.location.reload();
  }, []);

  const isSelfHost = !config.enable_google_oauth;

  return (
    <div className="login-page">
      <div className="login-page__card" style={{ maxWidth: '420px', padding: '3rem 2rem' }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <h1 className="login-page__brand-title" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '0.5rem',
            marginBottom: '0.75rem'
          }}>
            <img 
              src="/logo.png" 
              alt="Nightlio logo"
              style={{ 
                width: '1em', 
                height: '1em', 
                objectFit: 'contain',
                display: 'block'
              }} 
            />
            Nightlio
          </h1>
          <p className="login-page__brand-subtitle" style={{ marginBottom: 0 }}>Your daily mood companion.</p>
        </div>

        <div style={{ marginTop: '0.5rem' }}>
          <p className="login-page__description" style={{ marginBottom: '1.5rem', fontSize: '0.925rem' }}>
            {isSelfHost
              ? 'Click continue to start using Nightlio locally.'
              : 'Sign in to continue tracking your mood journey.'}
          </p>

          {message && <p className="login-page__message" style={{ marginBottom: '1rem' }}>{message}</p>}

          {isSelfHost ? (
            <button
              type="button"
              className="login-page__button"
              onClick={handleSelfHostContinue}
              disabled={isLoading}
            >
              {isLoading ? 'Loading…' : 'Continue'}
            </button>
          ) : (
            <button
              type="button"
              className="login-page__button login-page__button--google"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              style={{
                background: 'white',
                color: '#3c4043',
                border: '1px solid #dadce0',
                fontWeight: '500',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '10px 24px',
                transition: 'background-color 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                  e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center' }}>
                {isLoading ? <LoadingSpinner /> : <GoogleIcon />}
              </span>
              <span>{isLoading ? 'Signing in…' : 'Sign in with Google'}</span>
            </button>
          )}

          <div className="login-page__footer" style={{ 
            marginTop: '1.75rem', 
            fontSize: '0.8rem', 
            opacity: 0.6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <Lock size={12} aria-hidden="true" style={{ flexShrink: 0 }} />
            <span>
              {isSelfHost
                ? 'No external authentication required.'
                : 'We only use your Google account for authentication.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
