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

function toDateInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildPrintDraft(item) {
  const invoiceDate =
    toDateInputValue(
      item.invoiceDateTime ||
        item.customerInvoiceDate ||
        item.invoiceDate ||
        item.date
    ) || toDateInputValue(new Date());

  return {
    ...item,
    printInvoiceNo: `NALVEL-25/26-${item.serialNo || item.id || ""}`,
    printInvoiceDate: invoiceDate,
    printNoOfPkgs: item.printNoOfPkgs || "",
    printDescription: item.printDescription || item.material || "",
    printMiscellaneous: item.printMiscellaneous || "",
  };
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
    setPrintData(buildPrintDraft(item));
  };

  const handlePrintFieldChange = (field, value) => {
    setPrintData((current) => (current ? { ...current, [field]: value } : current));
  };

  const handlePrintNow = () => {
    if (typeof onPrint === "function" && printData) {
      onPrint(printData);
    }
    window.print();
  };

  const handleClosePrintEditor = () => {
    setPrintData(null);
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
                  <tr key={item.id ?? item.serialNo}>
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
                        onClick={() => onDelete(item)}
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
        <section className="invoice-edit-panel" aria-label="Invoice print editor">
          <div className="invoice-edit-head">
            <div>
              <h3>Edit Invoice Before Print</h3>
              <p>Update values here, then click Print Invoice.</p>
            </div>
            <div className="invoice-edit-actions">
              <button
                type="button"
                className="btn ghost"
                onClick={handleClosePrintEditor}
              >
                Close
              </button>
              <button
                type="button"
                className="btn dark"
                onClick={handlePrintNow}
              >
                Print Invoice
              </button>
            </div>
          </div>

          <div className="invoice-edit-grid">
            <label className="field">
              <span>Invoice No</span>
              <input
                value={printData.printInvoiceNo || ""}
                onChange={(event) =>
                  handlePrintFieldChange("printInvoiceNo", event.target.value)
                }
              />
            </label>
            <label className="field">
              <span>Invoice Date</span>
              <input
                type="date"
                value={printData.printInvoiceDate || ""}
                onChange={(event) =>
                  handlePrintFieldChange("printInvoiceDate", event.target.value)
                }
              />
            </label>
            <label className="field">
              <span>Customer Name</span>
              <input
                value={printData.customerName || ""}
                onChange={(event) =>
                  handlePrintFieldChange("customerName", event.target.value)
                }
              />
            </label>
            <label className="field">
              <span>Bill To</span>
              <input
                value={printData.billTo || ""}
                onChange={(event) =>
                  handlePrintFieldChange("billTo", event.target.value)
                }
              />
            </label>
            <label className="field">
              <span>Customer GST No</span>
              <input
                value={printData.gstNo || ""}
                onChange={(event) =>
                  handlePrintFieldChange("gstNo", event.target.value)
                }
              />
            </label>
            <label className="field">
              <span>No of Pkgs</span>
              <input
                value={printData.printNoOfPkgs || ""}
                onChange={(event) =>
                  handlePrintFieldChange("printNoOfPkgs", event.target.value)
                }
              />
            </label>
            <label className="field">
              <span>Description</span>
              <input
                value={printData.printDescription || ""}
                onChange={(event) =>
                  handlePrintFieldChange("printDescription", event.target.value)
                }
              />
            </label>
            <label className="field">
              <span>Truck No</span>
              <input
                value={printData.truckNo || ""}
                onChange={(event) =>
                  handlePrintFieldChange("truckNo", event.target.value)
                }
              />
            </label>
            <label className="field">
              <span>From</span>
              <input
                value={printData.fromLocation || ""}
                onChange={(event) =>
                  handlePrintFieldChange("fromLocation", event.target.value)
                }
              />
            </label>
            <label className="field">
              <span>To</span>
              <input
                value={printData.toLocation || ""}
                onChange={(event) =>
                  handlePrintFieldChange("toLocation", event.target.value)
                }
              />
            </label>
            <label className="field">
              <span>Gross Weight (MT)</span>
              <input
                value={printData.grossWeight || printData.weight || ""}
                onChange={(event) =>
                  handlePrintFieldChange("grossWeight", event.target.value)
                }
              />
            </label>
            <label className="field">
              <span>Customer Rate</span>
              <input
                type="number"
                step="0.01"
                value={printData.customerRate ?? ""}
                onChange={(event) =>
                  handlePrintFieldChange("customerRate", event.target.value)
                }
              />
            </label>
            <label className="field">
              <span>Additional Charge</span>
              <input
                type="number"
                step="0.01"
                value={printData.additionalCharges ?? ""}
                onChange={(event) =>
                  handlePrintFieldChange("additionalCharges", event.target.value)
                }
              />
            </label>
            <label className="field">
              <span>GST %</span>
              <input
                type="number"
                step="0.01"
                value={printData.gstType ?? ""}
                onChange={(event) =>
                  handlePrintFieldChange("gstType", event.target.value)
                }
              />
            </label>
            <label className="field">
              <span>Miscellaneous</span>
              <input
                value={printData.printMiscellaneous || ""}
                onChange={(event) =>
                  handlePrintFieldChange("printMiscellaneous", event.target.value)
                }
              />
            </label>
          </div>
        </section>
      )}

      {printData && (
        <div className="invoice-print-container">
          {(() => {
            const totals = calculateConsignmentValues(printData);
            const gstPercentage = Number(printData.gstType || 0);
            const gstAmount = (totals.expenses * gstPercentage) / 100;
            const grossWeight = printData.grossWeight || printData.weight || "0.000";
            const routeFrom = printData.fromLocation || "-";
            const routeTo = printData.toLocation || "-";
            const showMiscCharge = Number(printData.additionalCharges || 0) !== 0;
            const customerInvoiceNumber = printData.invoiceNo || "-";
            return (
          <>
          <div className="invoice-sheet">
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

            <div className="invoice-party-header">
              <div className="invoice-party-left">
                <p><strong>To</strong></p>
                <p><strong>M/s. {printData.customerName || "-"}</strong></p>
                <p>{printData.billTo || "-"}</p>
                <p><strong>GST NO:</strong> {printData.gstNo || "-"}</p>
                <p><strong>Description:</strong> {printData.printDescription || "-"}</p>
                <p><strong>No of Pkgs:</strong> {printData.printNoOfPkgs || "-"}</p>
                <p><strong>Invoice No:</strong> {customerInvoiceNumber}</p>
                <p><strong>Gross Weight:</strong> {grossWeight} M/T</p>
              </div>
              <div className="invoice-party-right">
                <p><strong>Invoice No:</strong> {printData.printInvoiceNo || "-"}</p>
                <p>
                  <strong>Date:</strong>{" "}
                  {formatDateOnly(
                    printData.printInvoiceDate ||
                      printData.invoiceDateTime ||
                      printData.customerInvoiceDate ||
                      printData.invoiceDate ||
                      printData.date
                  ) || new Date().toLocaleDateString("en-GB")}
                </p>
                <p><strong>Truck Details:</strong> {printData.truckNo || "-"}</p>
                <p><strong>Miscellaneous:</strong> {printData.printMiscellaneous || "-"}</p>
              </div>
            </div>

            <table className="invoice-main-table">
              <thead>
                <tr>
                  <th>Sl. No</th>
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
                    Transportation Charges ({routeFrom} To {routeTo})
                  </td>
                  <td>996799</td>
                  <td>-</td>
                  <td className="text-right">
                    {Number(totals.customerRate).toFixed(2)}
                  </td>
                </tr>
                {showMiscCharge && (
                  <tr>
                    <td></td>
                    <td>Miscellaneous Charges</td>
                    <td></td>
                    <td>-</td>
                    <td className="text-right">
                      {Number(printData.additionalCharges || 0).toFixed(2)}
                    </td>
                  </tr>
                )}
                <tr>
                  <td></td>
                  <td>Loading/Unloading mamool</td>
                  <td></td>
                  <td>-</td>
                  <td className="text-right">0.00</td>
                </tr>
                <tr>
                  <td></td>
                  <td>GST @ {gstPercentage}%</td>
                  <td></td>
                  <td>-</td>
                  <td className="text-right">{gstAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td></td>
                  <td>Round off</td>
                  <td></td>
                  <td>-</td>
                  <td className="text-right">.00</td>
                </tr>
              </tbody>
              <tfoot>
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

            <div className="invoice-amount-row">
              <p>
                <strong>Amount in Words:</strong> Rupees{" "}
                {numberToWords(Math.round(totals.netFreight))}
              </p>
            </div>

            <div className="invoice-bottom">
              <div className="terms-bank-block">
                <p><strong>Terms & Conditions</strong></p>
                <p>* Subject to Chennai Jurisdiction only</p>
                <p>* Cash Payment against receipt only</p>
                <p>
                  <strong>Note:</strong> Any discrepancies in the Invoice should
                  be brought our notice within three days from the date of our
                  Invoice.
                </p>
                <div className="bank-details">
                  <p><strong>BENIFICIARY NAME:</strong> NALVEL LOGISTICS SERVICES</p>
                  <p><strong>BANK NAME:</strong> HDFC BANK LTD</p>
                  <p><strong>BRANCH ADDRESS:</strong> CHITLAPAKKAM</p>
                  <p><strong>CURRENT ACCOUNT NUMBER:</strong> 50200095254790</p>
                  <p><strong>IFSC:</strong> HDFC0000260</p>
                </div>
              </div>
              <div className="signature-area">
                <p>For NALVEL LOGISTICS SERVICES</p>
                <div className="sig-space" />
                <p>Authorised Signatory</p>
              </div>
            </div>
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
