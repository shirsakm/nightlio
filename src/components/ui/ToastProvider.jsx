import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext({
  show: (_msg, _type) => {},
});

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const show = useCallback((message, type = 'info', duration = 3000) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    if (duration > 0) setTimeout(() => remove(id), duration);
  }, [remove]);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.type}`} onClick={() => remove(t.id)}>
            {t.message}
          </div>
        ))}
      </div>
      <style>
        {`
        .toast-container {
          position: fixed;
          left: 50%;
          transform: translateX(-50%);
          bottom: 90px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 1000;
        }
        .toast {
          padding: 10px 14px;
          border-radius: 10px;
          background: var(--bg-card);
          box-shadow: var(--shadow-2);
          border: 1px solid var(--border);
          color: var(--fg-strong);
          cursor: pointer;
          min-width: 220px;
          text-align: center;
        }
  .toast--success { border-color: color-mix(in oklab, var(--success), transparent 60%); }
  .toast--error { border-color: color-mix(in oklab, var(--danger), transparent 60%); }
  .toast--info { border-color: color-mix(in oklab, var(--accent-600), transparent 60%); }
        `}
      </style>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
