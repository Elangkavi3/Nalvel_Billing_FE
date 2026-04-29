import { Pagination } from '../components/common/Pagination.jsx';
import { money } from '../utils/numbers.js';

function billingLabel(item) {
  if (item.viewMode === 'IMS' || item.imsNo) return 'IMS No';
  return 'GST Invoice';
}

function billingValue(item) {
  if (item.viewMode === 'IMS' || item.imsNo) return item.imsNo || '-';
  return item.gstNo || '-';
}

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
  const hasItems = items.length > 0;

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
            <button type="button" className={filter.mode === 'all' ? 'filter-pill active' : 'filter-pill'} onClick={() => setMode('all')}>
              All
            </button>
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
              <th>Customer</th>
              <th>Billing</th>
              <th>Route</th>
              <th>Truck</th>
              <th>Payable</th>
              <th>Customer Bill</th>
              <th>Profit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {hasItems ? (
              pagedItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.serialNo || item.id}</td>
                  <td>
                    <strong>{item.customerName || '-'}</strong>
                    <span>{item.billTo || '-'}</span>
                  </td>
                  <td>
                    <strong>{billingLabel(item)}</strong>
                    <span>{billingValue(item)}</span>
                  </td>
                  <td>
                    <strong>{item.fromLocation || '-'}</strong>
                    <span>to {item.toLocation || '-'}</span>
                  </td>
                  <td>
                    <strong>{item.truckNo || '-'}</strong>
                    <span>{item.truckType || '-'}</span>
                  </td>
                  <td>
                    <strong>{money(item.ledgerAmount)}</strong>
                    <span>Bal: {money(item.balance)}</span>
                  </td>
                  <td>
                    <strong>{money(item.customerRate)}</strong>
                    <span>{item.customerPaymentMode || '-'}</span>
                  </td>
                  <td className="profit-text">{money(item.profit)}</td>
                  <td className="action-cell">
                    <button type="button" className="icon-action" onClick={() => onView(item)} aria-label={`View entry ${item.serialNo || item.id}`}>
                      <EyeIcon />
                    </button>
                    <button type="button" className="icon-action" onClick={() => onEdit(item)} aria-label={`Edit entry ${item.serialNo || item.id}`}>
                      <EditIcon />
                    </button>
                    <button type="button" className="icon-action danger" onClick={() => onDelete(item.id)} aria-label={`Delete entry ${item.serialNo || item.id}`}>
                      <TrashIcon />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="empty-cell">
                  No records from backend for the current filter/search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onSetPage={onSetPage} />
    </section>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 20h4.5L19 9.5 14.5 5 4 15.5V20Z" />
      <path d="m13.5 6 4.5 4.5" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 7h16" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M6 7l1 14h10l1-14" />
      <path d="M9 7V4h6v3" />
    </svg>
  );
}
