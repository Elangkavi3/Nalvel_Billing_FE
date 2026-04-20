export function MasterPage({ onNavigate }) {
  return (
    <section className="home-panel">
      <div className="home-intro">
        <p className="eyebrow">Home</p>
        <h2>Nalvel Billing Workspace</h2>
        <p>Manage freight entries, customer billing, supplier payments, and movement records from one place.</p>
        <div className="home-tags">
          <span>Consignment Entry</span>
          <span>Billing Register</span>
          <span>Quick Search</span>
        </div>
      </div>

      <div className="home-actions">
        <button type="button" className="home-action primary-action" onClick={() => onNavigate('form')}>
          <small>New work</small>
          <span>Entry Form</span>
          <strong>Create freight movement and billing data</strong>
        </button>

        <button type="button" className="home-action" onClick={() => onNavigate('data')}>
          <small>Register</small>
          <span>Saved Data</span>
          <strong>Search, edit, delete, and review consignments</strong>
        </button>
      </div>

      <div className="home-strip">
        <div>
          <span>01</span>
          <strong>Enter</strong>
          <p>Capture route, vehicle, supplier, and customer billing.</p>
        </div>
        <div>
          <span>02</span>
          <strong>Review</strong>
          <p>Use the saved data page with 10 records per page.</p>
        </div>
        <div>
          <span>03</span>
          <strong>Reuse</strong>
          <p>Customer and route suggestions appear after 3 letters.</p>
        </div>
      </div>
    </section>
  );
}
