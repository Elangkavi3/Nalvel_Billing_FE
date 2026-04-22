export function MasterPage({ onNavigate }) {
  return (
    <section className="home-panel">
      <div className="home-intro">
        <div>
          <h2>Nalvel Billing Workspace</h2>
          <p>Manage freight entries, customer billing, supplier payments, and movement records from one place.</p>
        </div>
        {/* <div className="home-intro-actions">
          <button type="button" className="home-intro-action" onClick={() => onNavigate('form')}>
            <small>Entry Form</small>
            <span>Create new entry</span>
          </button>
          <button type="button" className="home-intro-action" onClick={() => onNavigate('data')}>
            <small>Saved Data</small>
            <span>Browse records</span>
          </button>
          <button type="button" className="home-intro-action">
            <small>Invoice</small>
            <span>Generate invoice</span>
          </button>
        </div> */}
      </div>

      <div className="home-actions">
        <button type="button" className="home-action" onClick={() => onNavigate('form')}>
          <small>New Work</small>
          <span>Entry Form</span>
          <strong>Create freight movement and billing data</strong>
        </button>

        <button type="button" className="home-action" onClick={() => onNavigate('data')}>
          <small>Register</small>
          <span>Saved Data</span>
          <strong>Search, edit, delete, and review consignments</strong>
        </button>

        <button type="button" className="home-action">
          <small>Billing</small>
          <span>Invoice Generate</span>
          <strong>Create and export customer invoices</strong>
        </button>
      </div>

      <div className="home-stats">
        <div className="stat-card">
          <span>142</span>
          <p>Entries today</p>
        </div>
        <div className="stat-card">
          <span>₹84k</span>
          <p>Billed this week</p>
        </div>
      </div>

      <div className="home-table-section">
        <h3>Recent Consignments</h3>
        <table className="home-table">
          <thead>
            <tr>
              <th>Consignment</th>
              <th>Route</th>
              <th>Status</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>CNS-0041</td>
              <td>Chennai → Delhi</td>
              <td><span className="status-pill delivered">Paid</span></td>
              <td>₹4,200</td>
            </tr>
            <tr>
              <td>CNS-0040</td>
              <td>Mumbai → Pune</td>
              <td><span className="status-pill intransit">Pending</span></td>
              <td>₹1,800</td>
            </tr>
            <tr>
              <td>CNS-0039</td>
              <td>Bangalore → Hyderabad</td>
              <td><span className="status-pill pending">Partial</span></td>
              <td>₹2,600</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
