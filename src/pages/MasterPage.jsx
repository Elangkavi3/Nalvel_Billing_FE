import { money } from '../utils/numbers.js';
import { DateBillingFilters } from '../components/common/DateBillingFilters.jsx';

function getItemDate(item) {
  return (
    item.ledgerDateTime ||
    item.bookingDate ||
    item.loadingDateTime ||
    item.loadingDate ||
    item.deliveryDateTime ||
    item.deliveryDate ||
    item.ledgerDate ||
    ''
  );
}

export function MasterPage({ items = [], filter, onFilterChange, onNavigate }) {
  const totalEntries = items.length;
  const billedAmount = items.reduce((sum, item) => sum + (Number(item.customerRate) || 0), 0);
  const recentItems = [...items]
    .sort((left, right) => new Date(getItemDate(right) || 0) - new Date(getItemDate(left) || 0))
    .slice(0, 5);

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
        {/* coloum incremented to 3 from 5 */}
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

        {/* <button type="button" className="home-action" onClick={() => onNavigate('user')}>
          <small>Access</small>
          <span>Register User</span>
          <strong>Add a new user login for this billing workspace</strong>
        </button>

        <button type="button" className="home-action" onClick={() => onNavigate('resetPassword')}>
          <small>Access</small>
          <span>Reset Password</span>
          <strong>Set a new password for an existing user</strong>
        </button> */}
      </div>

      <div className="home-filter-section">
        <div>
          <p className="eyebrow">Quick Filters</p>
          <h3>Filter consignments by date</h3>
        </div>

        <div style={{marginTop: '10px'}}>
          <DateBillingFilters
            filter={filter}
            onFilterChange={onFilterChange}
            dateGroupLabel="Home date filters"
          />
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
