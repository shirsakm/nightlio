import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext({ theme: 'system', setTheme: () => {}, cycle: () => {} });

const getSystemTheme = () => (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('nightlio:theme') || 'system';
    } catch {
      return 'system';
    }
  });

  useEffect(() => {
    const effective = theme === 'system' ? getSystemTheme() : theme;
    document.documentElement.setAttribute('data-theme', effective);
    try { localStorage.setItem('nightlio:theme', theme); } catch {}
    if (theme === 'system') {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => document.documentElement.setAttribute('data-theme', getSystemTheme());
      mql.addEventListener?.('change', listener);
      return () => mql.removeEventListener?.('change', listener);
    }
  }, [theme]);

  const value = useMemo(() => ({
    theme,
    setTheme,
    cycle: () => setTheme((t) => (t === 'light' ? 'dark' : t === 'dark' ? 'system' : 'light')),
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
