import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { applyTransparentFavicon } from './utils/iconUtils.js'

// Try to remove the background from the favicon at runtime (non-destructive)
// No-op if it fails; keeps original favicon
applyTransparentFavicon({ src: '/logo.png', threshold: 0 }).catch(() => {});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
