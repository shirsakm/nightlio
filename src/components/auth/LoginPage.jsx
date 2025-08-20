import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Lock } from "lucide-react";
import { useConfig } from "../../contexts/ConfigContext";

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID || "your-google-client-id";

const LoginPage = () => {
  const { login } = useAuth();
  const { config } = useConfig();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Override any parent styling
  useEffect(() => {
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.style.background = "transparent";
      rootElement.style.padding = "0";
      rootElement.style.margin = "0";
      rootElement.style.boxShadow = "none";
      rootElement.style.border = "none";
      rootElement.style.borderRadius = "0";
    }

    return () => {
      // Restore original styles when component unmounts
      if (rootElement) {
        rootElement.style.background = "";
        rootElement.style.padding = "";
        rootElement.style.margin = "";
        rootElement.style.boxShadow = "";
        rootElement.style.border = "";
        rootElement.style.borderRadius = "";
      }
    };
  }, []);

  useEffect(() => {
    if (!config.enable_google_oauth) return; // skip loading Google in self-host mode

    // Check if Google script is already loaded
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });
      return;
    }

    // Check if script is already in DOM
    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
    if (existingScript) {
      existingScript.onload = () => {
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
          });
        }
      };
      return;
    }

    // Load Google Identity Services
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        });
      }
    };

    script.onerror = () => {
      setError(
        "Failed to load Google services. Please check your internet connection."
      );
    };

    // Don't remove script on cleanup to avoid issues
    return () => {
      // Script stays in DOM for reuse
    };
  }, [config.enable_google_oauth]);

  const handleGoogleResponse = async (response) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await login(response.credential);
      if (!result.success) {
        setError(result.error || "Login failed. Please try again.");
      }
    } catch (error) {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (!config.enable_google_oauth) return; // disabled
    if (window.google) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            document.body.appendChild(tempDiv);
            
            window.google.accounts.id.renderButton(tempDiv, {
              theme: 'outline',
              size: 'large'
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
        setError("Sign-in failed. Please try refreshing the page.");
      }
    } else {
      setError("Google services not loaded. Please refresh the page.");
    }
  };

  const isSelfHost = !config.enable_google_oauth;

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)",
        padding: "1rem",
        margin: 0,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
          padding: "3rem",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          textAlign: "center",
          width: "500px",
          transform: "translateY(0)",
        }}
      >
        <div style={{ marginBottom: "2rem" }}>
          <h1
            style={{
              background: "linear-gradient(135deg, #ff6b6b, #4ecdc4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontSize: "3rem",
              fontWeight: "800",
              margin: "0 0 0.5rem 0",
              letterSpacing: "-0.02em",
            }}
          >
            🌙 Nightlio
          </h1>
          <p
            style={{
              color: "#666",
              fontSize: "1.1rem",
              margin: "0 0 0.5rem 0",
            }}
          >
            Your daily mood companion
          </p>
          <p
            style={{
              color: "#999",
              fontSize: "0.9rem",
              margin: "0",
            }}
          >
            Track your emotions, build healthy habits
          </p>
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              color: "#333",
              fontSize: "1.5rem",
              fontWeight: "600",
              margin: "0 0 1rem 0",
            }}
          >
            {isSelfHost ? 'Welcome' : 'Welcome Back'}
          </h2>
          <p
            style={{
              color: "#666",
              fontSize: "0.95rem",
              margin: "0 0 2rem 0",
            }}
          >
            {isSelfHost
              ? 'Self-host mode is enabled. Click continue to use Nightlio locally.'
              : 'Sign in with your Google account to continue your mood tracking journey'}
          </p>

          {error && (
            <div
              style={{
                background: "#fee",
                color: "#c33",
                padding: "0.75rem",
                borderRadius: "8px",
                marginBottom: "1rem",
                fontSize: "0.9rem",
              }}
            >
              {error}
            </div>
          )}

          {isSelfHost ? (
            <a
              href="/" // the app will auto local-login on mount via AuthProvider
              onClick={(e) => { e.preventDefault(); window.location.reload(); }}
              style={{
                width: "100%",
                display: 'inline-block',
                padding: "1rem",
                background: isLoading
                  ? "#ccc"
                  : "linear-gradient(135deg, #667eea, #764ba2)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: isLoading ? "not-allowed" : "pointer",
                textAlign: 'center',
                textDecoration: 'none',
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
              }}
            >
              Continue
            </a>
          ) : (
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "1rem",
                background: isLoading
                  ? "#ccc"
                  : "linear-gradient(135deg, #667eea, #764ba2)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: isLoading ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              {isLoading ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{
                    animation: "spin 1s linear infinite"
                  }}
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="white"
                    strokeWidth="2"
                    strokeDasharray="31.416"
                    strokeDashoffset="31.416"
                    style={{
                      animation: "dash 2s ease-in-out infinite"
                    }}
                  />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                >
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
              )}
              {isLoading ? "Signing in..." : "Continue with Google"}
              
              <style>
                {`
                  @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                  }
                  @keyframes dash {
                    0% {
                      stroke-dasharray: 1, 150;
                      stroke-dashoffset: 0;
                    }
                    50% {
                      stroke-dasharray: 90, 150;
                      stroke-dashoffset: -35;
                    }
                    100% {
                      stroke-dasharray: 90, 150;
                      stroke-dashoffset: -124;
                    }
                  }
                `}
              </style>
            </button>
          )}
        </div>

        <div
          style={{
            fontSize: "0.8rem",
            color: "#999",
            lineHeight: "1.4",
          }}
        >
          <p style={{ margin: "0", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            <Lock size={14} color="#999" />
            {isSelfHost
              ? 'Local-only mode. No external auth is used.'
              : 'Your data is private and secure. We only use your Google account for authentication.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
