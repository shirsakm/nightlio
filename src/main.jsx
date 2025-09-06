import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { applyTransparentFavicon, generateTransparentIcon } from './utils/iconUtils.js'

// Try to remove the background from the favicon at runtime (non-destructive)
// No-op if it fails; keeps original favicon
applyTransparentFavicon({ src: '/logo.png', threshold: 24 }).catch(() => {});
// Also generate a transparent data URL for in-app usage
generateTransparentIcon('/logo.png', { threshold: 24 }).then((url) => {
  if (url) {
    try { window.__nightlioIconTransparent = url; } catch {}
  }
}).catch(() => {});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
