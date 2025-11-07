import { useCallback, useEffect, useMemo, useState } from 'react';
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
  <svg className="login-page__button-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="white"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="white"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12 1 13.78 1.43 15.45 2.18 16.93l2.85-2.22.81-.62z"
      fill="white"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="white"
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
        }
      } catch (error) {
        console.error('Login with Google failed', error);
        setMessage('Login failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [login],
  );

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
      console.error('Google sign-in prompt failed', error);
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
      <div className="login-page__card">
        <div>
          <h1 className="login-page__brand-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
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
          <p className="login-page__brand-subtitle">Your daily mood companion</p>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <p className="login-page__description" style={{ marginBottom: '1.25rem' }}>
            {isSelfHost
              ? 'Click continue to start using Nightlio locally.'
              : 'Sign in to continue tracking your mood journey.'}
          </p>

          {message && <p className="login-page__message">{message}</p>}

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
              className="login-page__button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <span aria-hidden="true">
                {isLoading ? <LoadingSpinner /> : <GoogleIcon />}
              </span>
              <span>{isLoading ? 'Signing in…' : 'Continue with Google'}</span>
            </button>
          )}

          <div className="login-page__footer" style={{ marginTop: '1.5rem', fontSize: '0.85rem', opacity: 0.7 }}>
            <Lock size={12} aria-hidden="true" />
            <span>
              {isSelfHost
                ? 'No external authentication required'
                : 'We only use your Google account for authentication.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
