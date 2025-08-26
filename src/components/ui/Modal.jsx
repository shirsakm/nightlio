const Modal = ({ open, title, children, onClose, maxWidth = 520 }) => {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000 }} aria-modal="true" role="dialog">
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }}
      />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'var(--bg-card)',
          color: 'var(--fg-body)',
          width: 'calc(100% - 32px)',
          maxWidth,
          borderRadius: '16px',
          boxShadow: 'var(--shadow-3)',
          border: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{title}</h3>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
