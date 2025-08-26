import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext({ theme: 'system', setTheme: () => {}, cycle: () => {} });

const getSystemTheme = () => (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('nightlio:theme') || 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    const effective = theme;
    document.documentElement.setAttribute('data-theme', effective);
    try { localStorage.setItem('nightlio:theme', theme); } catch {}
  }, [theme]);

  const value = useMemo(() => ({
    theme,
    setTheme,
    cycle: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')),
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
