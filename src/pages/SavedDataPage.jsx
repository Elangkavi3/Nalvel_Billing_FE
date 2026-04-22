import { Pagination } from '../components/common/Pagination.jsx';
import { money } from '../utils/numbers.js';

const sampleConsignment = {
  id: 'sample-consignment',
  serialNo: '1',
  subSerialNo: 'A',
  customerName: 'Nalvel Demo Customer',
  billTo: 'Nalvel Demo Billing',
  fromLocation: 'Chennai',
  toLocation: 'Delhi',
  truckNo: 'TN 01 AB 1234',
  driverName: 'Ravi Kumar',
  driverPrimaryContact: '9876543210',
  supplierAmount: 42000,
  customerRate: 48500,
  profit: 6500,
  paymentStatus: 'Pending',
};

export function SavedDataPage({
  currentPage,
  filter,
  items,
  loading,
  pagedItems,
  searchName,
  totalPages,
  onBack,
  onDelete,
  onEdit,
  onFilterChange,
  onView,
  onLoadAll,
  onSearch,
  onSearchNameChange,
  onSetPage,
}) {
  const displayItems = items.length === 0 ? [sampleConsignment] : pagedItems;
  const showingSample = items.length === 0;

  function setMode(mode) {
    onFilterChange((current) => ({ ...current, mode }));
  }

  function setRangeValue(key, value) {
    onFilterChange((current) => ({ ...current, mode: 'range', [key]: value }));
  }

  return (
    <section className="list-panel">
      <div className="list-head">
        <div>
          <p className="eyebrow">Register</p>
          <h2>Saved consignments</h2>
          <p className="subline">Showing maximum 10 records per page</p>
        </div>
        <div className="data-actions">
          <button type="button" className="btn dark" onClick={onBack}>
            Back to Home
          </button>
          <form className="search-row" onSubmit={onSearch}>
            <input
              placeholder="Search exact customer name"
              value={searchName}
              onChange={(event) => onSearchNameChange(event.target.value)}
            />
            <button className="btn secondary" type="submit" disabled={loading}>
              Search
            </button>
            <button className="btn ghost" type="button" onClick={onLoadAll} disabled={loading}>
              All
            </button>
          </form>
        </div>
      </div>

      <div className="saved-filter-section">
        <div className="filter-bar">
          <div className="filter-pills" role="group" aria-label="Saved data date filters">
            <button type="button" className={filter.mode === 'today' ? 'filter-pill active' : 'filter-pill'} onClick={() => setMode('today')}>
              Today
            </button>
            <button type="button" className={filter.mode === 'week' ? 'filter-pill active' : 'filter-pill'} onClick={() => setMode('week')}>
              This Week
            </button>
            <button type="button" className={filter.mode === 'month' ? 'filter-pill active' : 'filter-pill'} onClick={() => setMode('month')}>
              This Month
            </button>
            <button type="button" className={filter.mode === 'range' ? 'filter-pill active' : 'filter-pill'} onClick={() => setMode('range')}>
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

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Sub S.No</th>
              <th>Customer</th>
              <th>Route</th>
              <th>Truck</th>
              <th>Driver</th>
              <th>Supplier</th>
              <th>Customer Bill</th>
              <th>Profit</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayItems.map((item) => (
              <tr key={item.id}>
                <td>{item.serialNo || item.id}</td>
                <td>{item.subSerialNo || '-'}</td>
                <td>
                  <strong>{item.customerName}</strong>
                  <span>{item.billTo}</span>
                </td>
                <td>
                  {item.fromLocation} to {item.toLocation}
                </td>
                <td>{item.truckNo}</td>
                <td>
                  <strong>{item.driverName || '-'}</strong>
                  <span>{item.driverPrimaryContact || item.driverAlternateContact || '-'}</span>
                </td>
                <td>{money(item.supplierAmount)}</td>
                <td>{money(item.customerRate)}</td>
                <td className="profit-text">{money(item.profit)}</td>
                <td>{item.paymentStatus}</td>
                <td className="action-cell">
                  {showingSample ? (
                    <button type="button" className="link-button" onClick={() => onView(item)}>
                      View
                    </button>
                  ) : (
                    <>
                      <button type="button" className="link-button" onClick={() => onView(item)}>
                        View
                      </button>
                      <button type="button" className="link-button" onClick={() => onEdit(item)}>
                        Edit
                      </button>
                      <button type="button" className="link-button danger" onClick={() => onDelete(item.id)}>
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onSetPage={onSetPage} />
    </section>
  );
}
