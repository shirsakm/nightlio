import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const BurnerContext = createContext({
  isBurnerMode: false,
  setIsBurnerMode: () => {},
  toggleBurnerMode: () => {},
});

export const BurnerProvider = ({ children }) => {
  const [isBurnerMode, setIsBurnerMode] = useState(() => {
    try {
      return localStorage.getItem('nightlio:burner-mode') === 'on';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('nightlio:burner-mode', isBurnerMode ? 'on' : 'off');
    } catch {
      // Ignore storage write failures.
    }
  }, [isBurnerMode]);

  const value = useMemo(
    () => ({
      isBurnerMode,
      setIsBurnerMode,
      toggleBurnerMode: () => setIsBurnerMode((current) => !current),
    }),
    [isBurnerMode]
  );

  return <BurnerContext.Provider value={value}>{children}</BurnerContext.Provider>;
};

export const useBurner = () => useContext(BurnerContext);
