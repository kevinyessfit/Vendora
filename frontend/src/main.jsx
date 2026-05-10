import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Google Analytics 4 — activate by setting VITE_GA_ID in Vercel env vars
if (import.meta.env.VITE_GA_ID) {
  const s = document.createElement('script');
  s.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_ID}`;
  s.async = true;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', import.meta.env.VITE_GA_ID, { anonymize_ip: true });
}

// Sentry error tracking — activate by setting VITE_SENTRY_DSN in Vercel env vars
if (import.meta.env.VITE_SENTRY_DSN) {
  import('https://browser.sentry-cdn.com/7.120.3/bundle.min.js').catch(() => {
    const s = document.createElement('script');
    s.src = 'https://browser.sentry-cdn.com/7.120.3/bundle.min.js';
    s.crossOrigin = 'anonymous';
    s.onload = () => {
      window.Sentry?.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        environment: import.meta.env.MODE,
        tracesSampleRate: 0.1,
      });
    };
    document.head.appendChild(s);
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
