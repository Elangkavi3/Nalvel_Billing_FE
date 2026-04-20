export function Header({ activePage, editingId, loading, onBack, onClear }) {
  return (
    <section className="topbar">
      <div>
        <p className="eyebrow">Nalvel Logistics</p>
        <h1>Freight Data Entry</h1>
        <p className="subline">Movement and billing register</p>
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
