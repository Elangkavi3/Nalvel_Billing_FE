export function Header({ activePage, editingId, loading, onBack, onClear }) {
  return (
    <section className="topbar">
      <div className="topbar-brand">
        {/* <span className="brand-text">NALVEL LOGISTICS</span> */}
          <img className="brand-logo" src="src\assets\Logo.png" alt="Nalvel Logistics Logo"  style={{
    height: "60px",
    width: "auto",
    objectFit: "contain",
    display: "block"}} />
        <span className="brand-divider">•</span>
        <span className="brand-text">Freight Data Entry</span>
        <span className="brand-divider">•</span>
        <span className="brand-text">Movement and billing register</span>
        <div className="nl-avatar">NL</div>
      </div>
      <div className="top-actions">
        {activePage !== 'home' && activePage !== 'view' && activePage !== 'lr' && (
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
