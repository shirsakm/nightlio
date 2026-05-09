import { useConfig } from '../contexts/ConfigContext';

const SettingsView = () => {
  const { config, loading } = useConfig();

  const featureFlags = [
    {
      key: 'enable_google_oauth',
      label: 'Google Login',
      description: 'Enable Google OAuth-based authentication.',
    },
    {
      key: 'enable_mood_music',
      label: 'Mood Music',
      description: 'Play mood-based music suggestions from the mood picker.',
    },
  ];

  return (
    <div style={{ textAlign: 'left' }}>
      <h2 style={{ marginTop: 0, color: 'var(--text)' }}>Settings</h2>

      <section
        style={{
          marginTop: '1rem',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '1rem',
          background: 'var(--surface)',
        }}
        aria-label="Feature flags"
      >
        <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: 'var(--text)' }}>Feature flags</h3>
        <p style={{ marginTop: 0, marginBottom: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          These are currently server-managed. Editable toggles can be added here later.
        </p>

        {featureFlags.map((flag) => {
          const isEnabled = Boolean(config[flag.key]);
          return (
            <label
              key={flag.key}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.5rem 0',
                borderTop: '1px solid var(--border)',
              }}
            >
              <input
                type="checkbox"
                checked={isEnabled}
                readOnly
                disabled
                aria-label={flag.label}
                style={{ marginTop: '0.15rem' }}
              />
              <span>
                <strong style={{ color: 'var(--text)' }}>{flag.label}</strong>
                <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
                  {flag.description}
                  {loading ? ' (loading...)' : isEnabled ? ' (enabled)' : ' (disabled)'}
                </span>
              </span>
            </label>
          );
        })}
      </section>
    </div>
  );
};

export default SettingsView;
