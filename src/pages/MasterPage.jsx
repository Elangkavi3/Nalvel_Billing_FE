import { money } from '../utils/numbers.js';

function getFilterButtonClass(currentMode, mode) {
  return currentMode === mode ? 'filter-pill active' : 'filter-pill';
}

function getItemDate(item) {
  return item.ledgerDateTime || item.loadingDateTime || item.deliveryDateTime || item.ledgerDate || item.loadingDate || '';
}

export function MasterPage({ items = [], filter, onFilterChange, onNavigate }) {
  const totalEntries = items.length;
  const billedAmount = items.reduce((sum, item) => sum + (Number(item.customerRate) || 0), 0);
  const recentItems = [...items]
    .sort((left, right) => new Date(getItemDate(right) || 0) - new Date(getItemDate(left) || 0))
    .slice(0, 5);

  function setMode(mode) {
    onFilterChange((current) => ({ ...current, mode }));
  }

  function setRangeValue(key, value) {
    onFilterChange((current) => ({ ...current, mode: 'range', [key]: value }));
  }

  return (
    <section className="home-panel">
      <div className="home-intro">
      <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "20px"
  }}
>
 <div>
    <h2 style={{ margin: "0 0 8px 0" , color: "#d1d0ce",}}>
      Nalvel Billing Workspace
    </h2>

    <p style={{ margin: "0", lineHeight: "1.5" , color: "#d1d0ce",}}>
      Manage freight entries, customer billing, supplier payments, and movement
      records from one place.
    </p>
    
  </div>

</div>
    
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

        <button type="button" className="home-action" onClick={() => onNavigate('lr')}>
          <small>Logistics</small>
          <span>LR Generation</span>
          <strong>Create loading receipt from saved data</strong>
        </button>
      </div>

      <div className="home-filter-section">
        <div>
          <p className="eyebrow">Quick Filters</p>
          <h3>Filter consignments by date</h3>
        </div>

        <div className="filter-bar">
          <div className="filter-pills" role="group" aria-label="Home date filters">
            <button type="button" className={getFilterButtonClass(filter.mode, 'all')} onClick={() => setMode('all')}>
              All
            </button>
            <button type="button" className={getFilterButtonClass(filter.mode, 'today')} onClick={() => setMode('today')}>
              Today
            </button>
            <button type="button" className={getFilterButtonClass(filter.mode, 'week')} onClick={() => setMode('week')}>
              This Week
            </button>
            <button type="button" className={getFilterButtonClass(filter.mode, 'month')} onClick={() => setMode('month')}>
              This Month
            </button>
            <button type="button" className={getFilterButtonClass(filter.mode, 'range')} onClick={() => setMode('range')}>
              Date Range
            </button>
          </div>

          <div className="filter-range">
            <label className="filter-date-field">
              <span>From</span>
              <input type="date" value={filter.from} onChange={(event) => setRangeValue('from', event.target.value)} />
            </label>
            <label className="filter-date-field">
              <span>To</span>
              <input type="date" value={filter.to} onChange={(event) => setRangeValue('to', event.target.value)} />
            </label>
          </div>
        </div>
      </div>

      <div className="home-stats">
        <div className="stat-card">
          <span>{totalEntries}</span>
          <p>Entries in selected filter</p>
        </div>
        <div className="stat-card">
          <span>{money(billedAmount)}</span>
          <p>Customer bill total</p>
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
            {recentItems.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty-cell">
                  No consignments found for the selected filter.
                </td>
              </tr>
            ) : (
              recentItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.serialNo || item.id}</td>
                  <td>
                    {item.fromLocation || '-'} to {item.toLocation || '-'}
                  </td>
                  <td>
                    <span className={`status-pill ${(item.paymentStatus || 'Pending').toLowerCase()}`}>
                      {item.paymentStatus || 'Pending'}
                    </span>
                  </td>
                  <td>{money(item.customerRate)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
