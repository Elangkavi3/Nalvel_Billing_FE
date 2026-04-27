import { money } from '../utils/numbers.js';

function formatDateTime(value) {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(parsed);
}

function statusClass(status) {
  const value = String(status || 'pending').toLowerCase();
  if (value === 'paid') return 'paid';
  if (value === 'partial') return 'partial';
  return 'pending';
}

function paymentModeLabel(value) {
  return value || '-';
}

function entryView(item) {
  return item?.gstNo ? 'GST View' : item?.imsNo ? 'IMS View' : 'Entry View';
}

export function BillingViewPage({ item, onBack, onEdit, onHome }) {
  if (!item) return null;

  const additionalCharges = item.additionalCharges ?? 0;
  const expenses = item.expenses ?? 0;
  const netWeight = item.netWeight ?? item.weight ?? '-';
  const tareWeight = item.tareWeight ?? '-';
  const actualWeight = item.actualWeight ?? '-';
  const crossVehicleWeight = item.crossVehicleWeight ?? '-';

  return (
    <section className="bill-view-shell">
      <div className="bill-view-top-actions">
        <button type="button" className="bill-nav-btn" onClick={onBack}>
          <span aria-hidden="true">&larr;</span>
          <span>Back</span>
        </button>
        <button type="button" className="bill-nav-btn secondary" onClick={() => onEdit(item)}>
          <span>Edit</span>
        </button>
        <button type="button" className="bill-nav-btn secondary" onClick={onHome}>
          <span>Home</span>
        </button>
      </div>

      <div className="bill-view-page">
        <div className="bill-view-header">
          <div className="bill-view-header-left">
            <h1>Freight Bill</h1>
            <p>Transport Management System</p>
          </div>
          <div className="bill-view-header-right">
            <div className="bill-view-number">
              <span>#</span>
              {item.serialNo || item.id}
            </div>
            <div className="bill-view-badge">
              {entryView(item)}
            </div>
          </div>
        </div>

        <div className="bill-view-meta-strip">
          <div className="bill-view-meta-item">
            <span className="lbl">Ledger</span>
            <span className="val">{formatDateTime(item.ledgerDateTime)}</span>
          </div>
          <div className="bill-view-meta-item">
            <span className="lbl">Loading</span>
            <span className="val">{formatDateTime(item.loadingDateTime)}</span>
          </div>
          <div className="bill-view-meta-item">
            <span className="lbl">Delivery</span>
            <span className="val">{formatDateTime(item.deliveryDateTime)}</span>
          </div>
          <div className="bill-view-meta-item">
            <span className="lbl">LR No.</span>
            <span className="val">{item.lrNo || '-'}</span>
          </div>
          <div className="bill-view-meta-item">
            <span className="lbl">Invoice No.</span>
            <span className="val">{item.invoiceNo || '-'}</span>
          </div>
        </div>

        <div className="bill-view-body">
          <div className="bill-view-grid">
            <article className="bill-card bill-card-wide">
              <SectionTitle icon="I" title="Basic Info" />
              <div className="bill-field-row bill-field-row-3">
                <Field label="Customer Name" value={item.customerName} />
                <Field label="Bill To / Delivery Customer" value={item.billTo} />
                <Field label={item.gstNo ? 'GST No.' : 'IMS No.'} value={item.gstNo || item.imsNo || '-'} mono />
              </div>
              <div className="bill-field-row bill-field-row-4">
                <Field label="Net Weight" value={netWeight} />
                <Field label="Tare Weight" value={tareWeight} />
                <Field label="Actual Weight" value={actualWeight} />
                <Field label="Cross Vehicle Weight" value={crossVehicleWeight} />
              </div>
              <div className="bill-field-row">
                <Field label="LR Date" value={formatDateTime(item.lrDateTime)} mono />
                <Field label="Invoice Date" value={formatDateTime(item.invoiceDateTime)} mono />
              </div>
            </article>

            <article className="bill-card bill-card-half">
              <SectionTitle icon="V" title="Vehicle Info" />
              <div className="bill-field-row">
                <Field label="Truck No." value={item.truckNo} mono />
                <Field label="Truck Type" value={item.truckType} />
              </div>
              <Field label="Owner / Transporter" value={item.ownerName} />
              <Field label="Owner Primary Contact" value={item.ownerPrimaryContact || '-'} mono />
              <Field label="Owner Alternate Contact" value={item.ownerAlternateContact || '-'} mono />
            </article>

            <article className="bill-card bill-card-half">
              <SectionTitle icon="R" title="Driver" />
              <div className="bill-route-pill">
                <span>{item.fromLocation || '-'}</span>
                <span className="arrow">&rarr;</span>
                <span>{item.toLocation || '-'}</span>
              </div>
              <Field label="Driver Name" value={item.driverName} />
              <div className="bill-field-row">
                <Field label="Primary Contact" value={item.driverPrimaryContact || '-'} mono />
                <Field label="Alternate Contact" value={item.driverAlternateContact || '-'} mono />
              </div>
            </article>

            <article className="bill-card">
              <SectionTitle icon="S" title="Supplier Billing" />
              <Field label="Freight to Truck Owner / Supplier" value={money(item.supplierAmount)} amount />
              <Field label="Advance to Supplier" value={money(item.advance)} amount />
              <Field
                label="Supplier Payment Status"
                value={<span className={`bill-badge ${statusClass(item.paymentStatus)}`}>{item.paymentStatus || 'Pending'}</span>}
              />
            </article>

            <article className="bill-card">
              <SectionTitle icon="P" title="Our Rate & Profit" />
              <Field label="Billing to Customer" value={money(item.customerRate)} amount />
              <div className="bill-field-row">
                <Field label="Additional Charge" value={money(additionalCharges)} amount />
                <Field label="Additional Expense" value={money(expenses)} amount />
              </div>
              {item.gstType && <Field label="GST Type" value={<span className="bill-badge gst">{item.gstType}%</span>} />}
            </article>

            <article className="bill-card">
              <SectionTitle icon="E" title="Extra" />
              <Field label="Payment Mode" value={<span className="bill-badge payment">{paymentModeLabel(item.paymentMode)}</span>} />
              <Field label="Remarks / Notes" value={item.remarks || '-'} muted />
            </article>
          </div>

          <div className="bill-finance-bar">
            <FinanceItem label="Billed to Customer" value={money(item.customerRate)} />
            <FinanceItem label="Freight (Supplier)" value={money(item.supplierAmount)} />
            <FinanceItem label="Advance Paid" value={money(item.advance)} accent="advance" />
            <FinanceItem label="Net Freight" value={money(item.netFreight)} accent="netFreight" />
            <FinanceItem label="Gross Margin" value={money(item.profit)} accent="profit" />
          </div>
        </div>

        <div className="bill-view-footer">
          <span>
            Generated from Saved Data · Entry: <strong>{entryView(item).replace(' View', '')}</strong> · S.No{' '}
            <strong>{item.serialNo || item.id}</strong>
          </span>
          <div className="bill-view-footer-actions">
            <button type="button" className="btn dark" onClick={() => window.print()}>
              Print / Save PDF
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <div className="bill-section-title">
      <div className="icon">{icon}</div>
      <h2>{title}</h2>
    </div>
  );
}

function Field({ label, value, mono = false, amount = false, muted = false }) {
  const className = ['bill-field-value', mono ? 'mono' : '', amount ? 'amount' : '', muted ? 'muted' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className="bill-field">
      <div className="bill-field-label">{label}</div>
      <div className={className}>{value || '-'}</div>
    </div>
  );
}

function FinanceItem({ label, value, accent = '' }) {
  return (
    <div className={`bill-fin-item ${accent}`.trim()}>
      <div className="bill-fin-label">{label}</div>
      <div className="bill-fin-value">{value}</div>
    </div>
  );
}
