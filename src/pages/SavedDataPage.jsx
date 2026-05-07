import React, { useState } from "react";
import { Pagination } from "../components/common/Pagination.jsx";
import { money } from "../utils/numbers.js";
import { calculateConsignmentValues, formatDateOnly } from "../utils/consignment.js";

function billingLabel(item) {
  if (item.viewMode === "IMS" || item.imsNo) return "IMS No";
  return "GST Invoice";
}

function billingValue(item) {
  if (item.viewMode === "IMS" || item.imsNo) return item.imsNo || "-";
  return item.gstNo || "-";
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
  onPrint,
  onFilterChange,
  onView,
  onLoadAll,
  onSearch,
  onSearchNameChange,
  onSetPage,
}) {
  const [printData, setPrintData] = useState(null);

  const handlePrintAction = (item) => {
    setPrintData(item);
    setTimeout(() => {
      window.print();
      // Do NOT call setPrintData(null) here yet
    }, 50);
  };

  const hasItems = items.length > 0;

  function setMode(mode) {
    onFilterChange((current) => ({ ...current, mode }));
  }

  function setRangeValue(key, value) {
    onFilterChange((current) => ({ ...current, mode: "range", [key]: value }));
  }

  return (
    <>
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
              <button
                className="btn secondary"
                type="submit"
                disabled={loading}
              >
                Search
              </button>
              <button
                className="btn ghost"
                type="button"
                onClick={onLoadAll}
                disabled={loading}
              >
                All
              </button>
            </form>
          </div>
        </div>

        <div className="saved-filter-section">
          <div className="filter-bar">
            <div
              className="filter-pills"
              role="group"
              aria-label="Saved data date filters"
            >
              <button
                type="button"
                className={
                  filter.mode === "all" ? "filter-pill active" : "filter-pill"
                }
                onClick={() => setMode("all")}
              >
                All
              </button>
              <button
                type="button"
                className={
                  filter.mode === "today" ? "filter-pill active" : "filter-pill"
                }
                onClick={() => setMode("today")}
              >
                Today
              </button>
              <button
                type="button"
                className={
                  filter.mode === "week" ? "filter-pill active" : "filter-pill"
                }
                onClick={() => setMode("week")}
              >
                This Week
              </button>
              <button
                type="button"
                className={
                  filter.mode === "month" ? "filter-pill active" : "filter-pill"
                }
                onClick={() => setMode("month")}
              >
                This Month
              </button>
              <button
                type="button"
                className={
                  filter.mode === "year" ? "filter-pill active" : "filter-pill"
                }
                onClick={() => setMode("year")}
              >
                This Year
              </button>
              <button
                type="button"
                className={
                  filter.mode === "range" ? "filter-pill active" : "filter-pill"
                }
                onClick={() => setMode("range")}
              >
                Date Range
              </button>
            </div>

            <div className="filter-range">
              <label className="filter-date-field">
                <span>From</span>
                <input
                  type="date"
                  value={filter.from}
                  onChange={(event) =>
                    setRangeValue("from", event.target.value)
                  }
                />
              </label>
              <label className="filter-date-field">
                <span>To</span>
                <input
                  type="date"
                  value={filter.to}
                  onChange={(event) => setRangeValue("to", event.target.value)}
                />
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
                      <strong>{item.customerName || "-"}</strong>
                      <span>{item.billTo || "-"}</span>
                    </td>
                    <td>
                      <strong>{billingLabel(item)}</strong>
                      <span>{billingValue(item)}</span>
                    </td>
                    <td>
                      <strong>{item.fromLocation || "-"}</strong>
                      <span>to {item.toLocation || "-"}</span>
                    </td>
                    <td>
                      <strong>{item.truckNo || "-"}</strong>
                      <span>{item.truckType || "-"}</span>
                    </td>
                <td>
                      <strong>{money(calculateConsignmentValues(item).ledgerAmount)}</strong>
                      <span>Bal: {money(calculateConsignmentValues(item).balance)}</span>
                    </td>
                    <td>
                      <strong>{money(calculateConsignmentValues(item).customerRate)}</strong>
                      <span>{item.customerPaymentMode || "-"}</span>
                    </td>
                    <td className="profit-text">{money(calculateConsignmentValues(item).profit)}</td>
                    <td className="action-cell">
                      <button
                        type="button"
                        className="icon-action"
                        onClick={() => onView(item)}
                        aria-label={`View entry ${item.serialNo || item.id}`}
                      >
                        <EyeIcon />
                      </button>
                      <button
                        type="button"
                        className="icon-action"
                        onClick={() => onEdit(item)}
                        aria-label={`Edit entry ${item.serialNo || item.id}`}
                      >
                        <EditIcon />
                      </button>
                      <button
                        type="button"
                        className="icon-action"
                        onClick={() => handlePrintAction(item)}
                      >
                        <PrintIcon />
                      </button>
                      <button
                        type="button"
                        className="icon-action danger"
                        onClick={() => onDelete(item.id)}
                        aria-label={`Delete entry ${item.serialNo || item.id}`}
                      >
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

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onSetPage={onSetPage}
        />
      </section>

      {printData && (
        <div className="invoice-print-container">
          {(() => {
            const totals = calculateConsignmentValues(printData);
            const gstPercentage = Number(printData.gstType || 0);
            const gstAmount = (totals.expenses * gstPercentage) / 100;
            return (
          <>
          <div className="invoice-top-header">
            <div className="company-branding">
              <h1>NALVEL LOGISTICS SERVICES</h1>
              <p>New No: 12, Old No. 26, Nallappa Street, Nehru Nagar,</p>
              <p>Chromepet, Chennai - 600 044</p>
              <p>GST NO: 33ARXPK1573A2ZT</p>
              <p>nalvellogisticsservices@gmail.com</p>
            </div>
            <div className="invoice-title">
              <h2>TAX INVOICE</h2>
            </div>
          </div>

          <div className="invoice-meta-grid">
            <div className="meta-col billing">
              <strong>To</strong>
              <p>M/s. {printData.customerName || "-"}</p>
              <p>{printData.billTo || "-"}</p>
              <p>GST NO: {printData.gstNo || "-"}</p>
            </div>
            <div className="meta-col details">
              <p>
                <strong>Invoice No:</strong> NALVEL-25/26-
                {printData.serialNo || printData.id}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {formatDateOnly(printData.invoiceDateTime || printData.customerInvoiceDate || printData.invoiceDate || printData.date) || new Date().toLocaleDateString("en-GB")}
              </p>
              <p>
                <strong>Truck Details:</strong> {printData.truckNo || "-"}
              </p>
              <p>
                <strong>Gross Weight:</strong> {printData.grossWeight || printData.weight || "0.000"} MT
              </p>
            </div>
          </div>

          <table className="invoice-main-table">
            <thead>
              <tr>
                <th>SI. No</th>
                <th>Particulars</th>
                <th>HSN/SAC</th>
                <th>As Per Receipt</th>
                <th>Non Receipt</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>
                  Transportation Charges ({printData.fromLocation} To{" "}
                  {printData.toLocation})
                </td>
                <td>996799</td>
                <td>-</td>
                <td className="text-right">
                  {Number(totals.customerRate).toFixed(2)}
                </td>
              </tr>
              <tr>
                <td></td>
                <td>Additional Charge</td>
                <td></td>
                <td>-</td>
                <td className="text-right">{Number(printData.additionalCharges || 0).toFixed(2)}</td>
              </tr>
              <tr>
                <td></td>
                <td>Loading/Unloading mamool</td>
                <td></td>
                <td>-</td>
                <td className="text-right">0.00</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="4" className="text-right">
                  GST @ {gstPercentage}%
                </td>
                <td className="text-right">
                  {gstAmount.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td colSpan="4" className="text-right">
                  Round off
                </td>
                <td className="text-right">.00</td>
              </tr>
              <tr>
                <td colSpan="4" className="text-right">
                  <strong>Net Amount</strong>
                </td>
                <td className="text-right">
                  <strong>{Number(totals.netFreight).toFixed(2)}</strong>
                </td>
              </tr>
            </tfoot>
          </table>

          <p className="amount-words">
            {/* This uses the function we created above */}
            <strong>Amount in Words:</strong> Rupees{" "}
            {numberToWords(Math.round(totals.netFreight))}
          </p>

          <div className="invoice-bottom">
            <div className="bank-details">
              <p>
                <strong>BENIFICIARY NAME:</strong> NALVEL LOGISTICS SERVICES
              </p>
              <p>
                <strong>BANK NAME:</strong> HDFC BANK LTD
              </p>
              <p>
                <strong>BRANCH ADDRESS:</strong> CHITLAPAKKAM
              </p>
              <p>
                <strong>CURRENT ACCOUNT NUMBER:</strong> 50200095254790
              </p>
              <p>
                <strong>IFSC:</strong> HDFC0000260
              </p>
            </div>
            <div className="signature-area">
              <p>For NALVEL LOGISTICS SERVICES</p>
              <div className="sig-space" style={{ height: "50px" }}></div>
              <p>Authorised Signatory</p>
            </div>
          </div>

          <div
            className="terms"
            style={{ marginTop: "15px", fontSize: "10px" }}
          >
            <strong>Terms & Conditions</strong>
            <p>* Subject to Chennai Jurisdiction only</p>
            <p>* Cash Payment against receipt only</p>
            <p>
              <strong>Note:</strong> Any discrepancies in the Invoice should be
              brought our notice within three days from the date of our Invoice.
            </p>
          </div>
          </>
            );
          })()}
        </div>
      )}
    </>
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

function PrintIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <path d="M6 14h12v8H6z" />
    </svg>
  );
}

function numberToWords(num) {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if ((num = num.toString()).length > 9) return 'Amount too large';
  let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return ''; 
  let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Only' : 'Only';
  return str;
}
