export function Header({ activePage, editingId, loading, onBack, onClear }) {
  return (
    <section className="topbar">
      <div className="topbar-brand">
        <span className="brand-text">NALVEL LOGISTICS</span>
        <span className="brand-divider">•</span>
        <span className="brand-text">Freight Data Entry</span>
        <span className="brand-divider">•</span>
        <span className="brand-text">Movement and billing register</span>
        <div className="nl-avatar">NL</div>
      </div>
      <div className="top-actions">
        {activePage !== 'home' && (
          <>
            <button type="button" className="btn secondary" onClick={onClear}>
              Clear
            </button>
            <button type="button" className="btn dark" onClick={onBack}>
              Back
            </button>
          </>
        )}
        {activePage === 'form' && (
          <>
            <button type="button" className="btn dark" onClick={() => window.print()}>
              Print
            </button>
            <button type="submit" className="btn primary" form="consignment-form" disabled={loading}>
              {editingId ? 'Update Entry' : 'Save Entry'}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
