import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext({ theme: 'system', setTheme: () => {}, cycle: () => {} });

// System theme detection handled implicitly; storage persists last choice

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('nightlio:theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    const effective = theme;
    document.documentElement.setAttribute('data-theme', effective);
  try { localStorage.setItem('nightlio:theme', theme); } catch { /* ignore */ }
  }, [theme]);

  const value = useMemo(() => ({
    theme,
    setTheme,
    cycle: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')),
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
