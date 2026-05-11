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
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatInvoiceDate(value) {
  const formatted = formatDateOnly(value);
  return formatted && formatted !== "-" ? formatted.replaceAll("/", ".") : "-";
}

function numberOrFallback(value, fallback = 0) {
  if (value === "" || value === null || value === undefined) {
    return Number(fallback || 0);
  }
  return Number(value || 0);
}

function formatWeight(value) {
  if (value === "" || value === null || value === undefined) return "0.000";
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue.toFixed(3) : value;
}

function buildPrintDraft(item) {
  const totals = calculateConsignmentValues(item);
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
    customerRate: item.customerRate ?? totals.customerRate ?? "",
    additionalCharges: item.additionalCharges ?? "",
    grossWeight: item.grossWeight ?? item.weight ?? "",
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
  onFilterChange,
  onView,
  onLoadAll,
  onSearch,
  onSearchNameChange,
  onSetPage,
}) {
  const [printData, setPrintData] = useState(null);
  const hasItems = items.length > 0;

  function handlePrintAction(item) {
    setPrintData(buildPrintDraft(item));
  }

  function handlePrintFieldChange(field, value) {
    setPrintData((current) => (current ? { ...current, [field]: value } : current));
  }

  function handlePrintNow() {
    window.print();
  }

  function handleClosePrintEditor() {
    setPrintData(null);
  }

  function setMode(mode) {
    onFilterChange((current) => ({ ...current, mode }));
  }

  function setRangeValue(key, value) {
    onFilterChange((current) => ({ ...current, mode: "range", [key]: value }));
  }

  return (
    <div className={printData ? "saved-data-print-root print-ready" : "saved-data-print-root"}>
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
                        aria-label={`Print invoice ${item.serialNo || item.id}`}
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
        <>
          <InvoicePrintEditor
            printData={printData}
            onChange={handlePrintFieldChange}
            onClose={handleClosePrintEditor}
            onPrint={handlePrintNow}
          />
          <InvoicePrintView printData={printData} />
        </>
      )}
    </div>
  );
}

function InvoicePrintEditor({ printData, onChange, onClose, onPrint }) {
  return (
    <section className="invoice-edit-panel" aria-label="Invoice print editor">
      <div className="invoice-edit-head">
        <div>
          <h3>Edit Invoice Before Print</h3>
          <p>Update the invoice values, then print the A4 invoice.</p>
        </div>
        <div className="invoice-edit-actions">
          <button type="button" className="btn ghost" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn dark" onClick={onPrint}>
            Print Invoice
          </button>
        </div>
      </div>

      <div className="invoice-edit-grid">
        <PrintField label="Invoice No" value={printData.printInvoiceNo || ""} onChange={(value) => onChange("printInvoiceNo", value)} />
        <PrintField label="Invoice Date" type="date" value={printData.printInvoiceDate || ""} onChange={(value) => onChange("printInvoiceDate", value)} />
        <PrintField label="Customer Name" value={printData.customerName || ""} onChange={(value) => onChange("customerName", value)} />
        <PrintField label="Customer Address" value={printData.billTo || ""} onChange={(value) => onChange("billTo", value)} />
        <PrintField label="Customer GST No" value={printData.gstNo || ""} onChange={(value) => onChange("gstNo", value)} />
        <PrintField label="No of Pkgs" value={printData.printNoOfPkgs || ""} onChange={(value) => onChange("printNoOfPkgs", value)} />
        <PrintField label="Description" value={printData.printDescription || ""} onChange={(value) => onChange("printDescription", value)} />
        <PrintField label="Customer Invoice No" value={printData.invoiceNo || ""} onChange={(value) => onChange("invoiceNo", value)} />
        <PrintField label="Gross Weight (MT)" value={printData.grossWeight || ""} onChange={(value) => onChange("grossWeight", value)} />
        <PrintField label="Truck Details" value={printData.truckNo || ""} onChange={(value) => onChange("truckNo", value)} />
        <PrintField label="From" value={printData.fromLocation || ""} onChange={(value) => onChange("fromLocation", value)} />
        <PrintField label="To" value={printData.toLocation || ""} onChange={(value) => onChange("toLocation", value)} />
        <PrintField label="Transportation Amount" type="number" value={printData.customerRate ?? ""} onChange={(value) => onChange("customerRate", value)} />
        <PrintField label="Miscellaneous Amount" type="number" value={printData.additionalCharges ?? ""} onChange={(value) => onChange("additionalCharges", value)} />
        <PrintField label="GST %" type="number" value={printData.gstType ?? ""} onChange={(value) => onChange("gstType", value)} />
        <PrintField label="Miscellaneous Text" value={printData.printMiscellaneous || ""} onChange={(value) => onChange("printMiscellaneous", value)} />
      </div>
    </section>
  );
}

function PrintField({ label, value, onChange, type = "text" }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type={type}
        step={type === "number" ? "0.01" : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function InvoicePrintView({ printData }) {
  const totals = calculateConsignmentValues(printData);
  const gstPercentage = numberOrFallback(printData.gstType);
  const transportationAmount = numberOrFallback(printData.customerRate, totals.customerRate);
  const miscellaneousAmount = numberOrFallback(printData.additionalCharges);
  const taxableAmount = transportationAmount + miscellaneousAmount;
  const gstAmount = (taxableAmount * gstPercentage) / 100;
  const netAmount = taxableAmount + gstAmount;
  const grossWeight = formatWeight(printData.grossWeight || printData.weight);
  const routeFrom = printData.fromLocation || "-";
  const routeTo = printData.toLocation || "-";
  const showMiscAmount = miscellaneousAmount !== 0;

  return (
    <div className="invoice-print-container">
      <div className="invoice-sheet">
        <div className="invoice-top-header">
          <div className="company-branding">
            <h1>NALVEL LOGISTICS SERVICES</h1>
            <p>New No: 12, Old No. 26, Nallappa Street, Nehru Nagar,</p>
            <p>Chromepet, Chennai - 600 044</p>
            <p>GST NO : 33ARXPK1573A2ZT</p>
            <p>nalvellogisticsservices@gmail.com</p>
          </div>
          <div className="invoice-title">TAX INVOICE</div>
        </div>

        <div className="invoice-info-box">
          <div className="invoice-to-block">
            <p>To</p>
            <p><strong>M/s. {printData.customerName || "-"}</strong></p>
            <p>{printData.billTo || "-"}</p>
            <p><strong>GST NO :</strong> {printData.gstNo || "-"}</p>
          </div>
          <div className="invoice-number-block">
            <p><strong>Invoice No:</strong> {printData.printInvoiceNo || "-"}</p>
            <p><strong>Date:</strong> {formatInvoiceDate(printData.printInvoiceDate)}</p>
          </div>
          <div className="invoice-desc-block">
            <p><strong>Description :</strong></p>
            <p>No of Pkgs&nbsp;&nbsp;&nbsp;&nbsp;: {printData.printNoOfPkgs || "-"}</p>
            <p>Description&nbsp;&nbsp;&nbsp;: {printData.printDescription || "-"}</p>
            <p>Invoice No&nbsp;&nbsp;&nbsp;&nbsp;: {printData.invoiceNo || "-"}</p>
            <p>Gross Weight: {grossWeight} MT</p>
          </div>
          <div className="invoice-truck-block">
            <p><strong>Truck Details :</strong> {printData.truckNo || "-"}</p>
            <p><strong>Miscellaneous:</strong> {printData.printMiscellaneous || "-"}</p>
          </div>
        </div>

        <table className="invoice-main-table">
          <thead>
            <tr>
              <th>SL. NO</th>
              <th>PARTICULARS</th>
              <th>HSN/SAC</th>
              <th>AS PER RECEIPT</th>
              <th>NON RECEIPT</th>
            </tr>
          </thead>
          <tbody>
            <tr className="invoice-service-row">
              <td>1</td>
              <td>Transportation Charges ({routeFrom} To {routeTo})</td>
              <td>996799</td>
              <td>-</td>
              <td className="text-right">{transportationAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td></td>
              <td>Miscellaneous Charges</td>
              <td></td>
              <td>-</td>
              <td className="text-right">{showMiscAmount ? miscellaneousAmount.toFixed(2) : ""}</td>
            </tr>
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
              <td colSpan="4" className="text-right"><strong>Net Amount</strong></td>
              <td className="text-right"><strong>{netAmount.toFixed(2)}</strong></td>
            </tr>
          </tfoot>
        </table>

        <div className="invoice-amount-row">
          <strong>Amount in Words:</strong> Rupees {numberToWords(Math.round(netAmount))}
        </div>

        <div className="invoice-bottom">
          <div className="terms-bank-block">
            <p><strong>Terms & Conditions</strong></p>
            <p>* Subject to Chennai Jurisdiction only</p>
            <p>* Cash Payment against receipt only</p>
            <p><strong>Note:</strong> Any discrepancies in the Invoice should be brought our notice within three days from the date of our Invoice.</p>
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
    </div>
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
      <path d="M6 9V2h12v7" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <path d="M6 14h12v8H6z" />
    </svg>
  );
}

function numberToWords(num) {
  const ones = [
    "",
    "One ",
    "Two ",
    "Three ",
    "Four ",
    "Five ",
    "Six ",
    "Seven ",
    "Eight ",
    "Nine ",
    "Ten ",
    "Eleven ",
    "Twelve ",
    "Thirteen ",
    "Fourteen ",
    "Fifteen ",
    "Sixteen ",
    "Seventeen ",
    "Eighteen ",
    "Nineteen ",
  ];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const text = String(num || 0);
  if (text.length > 9) return "Amount too large";

  const parts = (`000000000${text}`).slice(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!parts) return "";

  let words = "";
  words += Number(parts[1]) !== 0 ? `${ones[Number(parts[1])] || `${tens[parts[1][0]]} ${ones[parts[1][1]]}`}Crore ` : "";
  words += Number(parts[2]) !== 0 ? `${ones[Number(parts[2])] || `${tens[parts[2][0]]} ${ones[parts[2][1]]}`}Lakh ` : "";
  words += Number(parts[3]) !== 0 ? `${ones[Number(parts[3])] || `${tens[parts[3][0]]} ${ones[parts[3][1]]}`}Thousand ` : "";
  words += Number(parts[4]) !== 0 ? `${ones[Number(parts[4])] || `${tens[parts[4][0]]} ${ones[parts[4][1]]}`}Hundred ` : "";
  words += Number(parts[5]) !== 0
    ? `${words !== "" ? "and " : ""}${ones[Number(parts[5])] || `${tens[parts[5][0]]} ${ones[parts[5][1]]}`}Only`
    : "Only";
  return words;
}

