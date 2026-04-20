export function StatusLine({ loading, message, error }) {
  return (
    <section className="status-line" aria-live="polite">
      <span>{loading ? 'Working...' : message}</span>
      {error && <strong>{error}</strong>}
    </section>
  );
}
