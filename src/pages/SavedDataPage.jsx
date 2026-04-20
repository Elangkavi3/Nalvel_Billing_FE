import { Pagination } from '../components/common/Pagination.jsx';
import { money } from '../utils/numbers.js';

export function SavedDataPage({
  currentPage,
  items,
  loading,
  pagedItems,
  searchName,
  totalPages,
  onBack,
  onDelete,
  onEdit,
  onLoadAll,
  onSearch,
  onSearchNameChange,
  onSetPage,
}) {
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

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Customer</th>
              <th>Route</th>
              <th>Truck</th>
              <th>Supplier</th>
              <th>Customer Bill</th>
              <th>Profit</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={9} className="empty-cell">
                  No consignments found
                </td>
              </tr>
            ) : (
              pagedItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.serialNo || item.id}</td>
                  <td>
                    <strong>{item.customerName}</strong>
                    <span>{item.billTo}</span>
                  </td>
                  <td>
                    {item.fromLocation} to {item.toLocation}
                  </td>
                  <td>{item.truckNo}</td>
                  <td>{money(item.supplierAmount)}</td>
                  <td>{money(item.customerRate)}</td>
                  <td className="profit-text">{money(item.profit)}</td>
                  <td>{item.paymentStatus}</td>
                  <td className="action-cell">
                    <button type="button" className="link-button" onClick={() => onEdit(item)}>
                      Edit
                    </button>
                    <button type="button" className="link-button danger" onClick={() => onDelete(item.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onSetPage={onSetPage} />
    </section>
  );
}
