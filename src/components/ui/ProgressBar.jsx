const ProgressBar = ({ value = 0, max = 100, label }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div style={{ width: '100%' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, color: 'var(--fg-muted)' }}>
          <span>{label}</span>
          <span>{Math.round(pct)}%</span>
        </div>
      )}
      <div style={{ height: 8, background: 'var(--border-soft)', borderRadius: 999 }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 999, background: 'var(--accent-600)' }} />
      </div>
    </div>
  );
};

export default ProgressBar;
