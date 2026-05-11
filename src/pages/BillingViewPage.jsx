import { money } from '../utils/numbers.js';
import { calculateConsignmentValues, formatDateOnly } from '../utils/consignment.js';

function paymentModeLabel(value) {
  return value || '-';
}

function paymentTypeLabel(value) {
  if (value === 'Truck_Owner') return 'Truck Owner';
  if (value === 'Driver_Payment') return 'Driver Payment';
  return value || '-';
}

function entryView(item) {
  if (item?.viewMode === 'IMS' || item?.imsNo) return 'IMS View';
  if (item?.viewMode === 'GST' || item?.gstNo) return 'GST View';
  return 'Entry View';
}

export function BillingViewPage({ item, onBack, onEdit, onHome }) {
  if (!item) return null;

  const additionalCharges = item.additionalCharges ?? 0;
  const totals = calculateConsignmentValues(item);
  const expenses = totals.expenses ?? 0;
  const netWeight = item.netWeight ?? item.weight ?? '-';
  const tareWeight = item.tareWeight ?? '-';
  const grossWeight = item.grossWeight ?? item.crossVehicleWeight ?? '-';
  const supplierRateLabel = item.supplierRateType === 'cost_per_mt' ? 'Cost Per MT' : 'Fixed Cost';
  const billingNumberLabel = item.viewMode === 'IMS' || item.imsNo ? 'IMS No' : 'GST Invoice';
  const billingNumber = item.viewMode === 'IMS' || item.imsNo ? item.imsNo : item.gstNo;

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
            <span className="lbl">Booking</span>
            <span className="val">{formatDateOnly(item.ledgerDateTime || item.bookingDate)}</span>
          </div>
          <div className="bill-view-meta-item">
            <span className="lbl">Loading</span>
            <span className="val">{formatDateOnly(item.loadingDateTime || item.loadingDate)}</span>
          </div>
          <div className="bill-view-meta-item">
            <span className="lbl">Delivery</span>
            <span className="val">{formatDateOnly(item.deliveryDateTime || item.deliveryDate)}</span>
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
              <SectionTitle title="Basic Info" />
              <div className="bill-field-row bill-field-row-3">
                <Field label="Booking Customer Name" value={item.customerName} />
                <Field label="Customer to be billed" value={item.billTo} />
                <Field label={billingNumberLabel} value={billingNumber || '-'} mono />
              </div>
              <div className="bill-field-row bill-field-row-4">
                <Field label="Gross Weight" value={grossWeight} />
                <Field label="Tare Weight" value={tareWeight} />
                <Field label="Net Weight" value={netWeight} />
                <Field label="Material Description" value={item.material || '-'} />
              </div>
              <div className="bill-field-row">
                <Field label="LR Date" value={formatDateOnly(item.lrDateTime || item.lrDate)} mono />
                <Field label="Invoice Date" value={formatDateOnly(item.invoiceDateTime || item.customerInvoiceDate || item.invoiceDate)} mono />
              </div>
            </article>

            <div className="bill-card-columns">
              <div className="bill-card-stack">
                <article className="bill-card">
                  <SectionTitle title="Vehicle Info" />
                  <div className="bill-field-row">
                    <Field label="Truck No." value={item.truckNo} mono />
                    <Field label="Truck Type" value={item.truckType} />
                  </div>
                  <Field label="Owner / Transporter" value={item.ownerName} />
                  <Field label="Owner Primary Contact" value={item.ownerPrimaryContact || '-'} mono />
                  <Field label="Owner Alternate Contact" value={item.ownerAlternateContact || '-'} mono />
                </article>

                <article className="bill-card">
                  <SectionTitle title="Our Rate & Profit" />
                  {item.gstType && <Field label="GST Percentage Used" value={<span className="bill-badge gst">{item.gstType}%</span>} />}
                  <Field label="Freight Booking Cost" value={money(totals.customerRate)} amount />
                  <div className="bill-field-row">
                    <Field label="Additional Charge" value={money(additionalCharges)} amount />
                    <Field label="Total Expense" value={money(expenses)} amount />
                  </div>
                  <div className="bill-field-row">
                    <Field label="Net Freight" value={money(totals.netFreight)} amount />
                    <Field label="Profit" value={money(totals.profit)} amount />
                  </div>
                </article>
              </div>

              <div className="bill-card-stack">
                <article className="bill-card">
                  <SectionTitle title="Driver Info" />
                  <div className="bill-route-pill">
                    <span>{item.fromLocation || '-'}</span>
                    <span className="arrow">&rarr;</span>
                    <span>{item.toLocation || '-'}</span>
                  </div>
                  <Field label="Driver Name" value={item.driverName} />
                  <Field label="DL No." value={item.dlNo || '-'} mono />
                  <div className="bill-field-row">
                    <Field label="Driver Primary Contact" value={item.driverPrimaryContact || '-'} mono />
                    <Field label="Driver Alternate Contact" value={item.driverAlternateContact || '-'} mono />
                  </div>
                </article>

                <article className="bill-card">
                  <SectionTitle title="Extra" />
                  <Field label="Customer Payment Mode" value={<span className="bill-badge payment">{paymentModeLabel(item.customerPaymentMode)}</span>} />
                  <Field label="Remarks / Notes" value={item.remarks || '-'} muted />
                  <Field label="Consignor" value={item.consignorName || item.customerName || '-'} />
                  <Field label="Consignee" value={item.consigneeName || item.billTo || '-'} />
                  <Field label="Book Copy" value={item.bookCopy || 'CONSIGNOR COPY'} />
                </article>
              </div>

              <div className="bill-card-stack">
                <article className="bill-card bill-card-emphasis">
                  <SectionTitle title="Supplier Billing" />
                  <Field label="Freight Amount Type" value={supplierRateLabel} />
                  <Field label={supplierRateLabel} value={money(item.supplierAmount)} amount />
                  <Field label="Chargeable Weight" value={item.chargeableWeight ?? item.chargebleWeight ?? '-'} />
                  <Field label="Payable Amount" value={money(totals.ledgerAmount)} amount />
                  <div className="bill-field-row">
                    <Field label="Halting Charge" value={money(item.haltingCharge)} amount />
                    <Field label="Parking Charge" value={money(item.parkingCharge)} amount />
                  </div>
                  <div className="bill-field-row">
                    <Field label="Commission" value={money(item.commission)} amount />
                    <Field label="Net Payment Balance" value={money(totals.netBalance)} amount />
                  </div>
                  <div className="bill-field-row">
                    <Field label="Total Advance" value={money(totals.totalAdvance)} amount />
                    <Field label="Total Expense" value={money(totals.expenses)} amount />
                  </div>
                  <Field label="Balance" value={money(totals.balance)} amount />
                  <Field label="Payment Type Options" value={paymentTypeLabel(item.paymentType)} />
                  <Field label="Truck Pay Mode" value={<span className="bill-badge payment">{paymentModeLabel(item.truckpaymentMode)}</span>} />
                </article>
              </div>
            </div>
          </div>

          <div className="bill-finance-bar">
            <FinanceItem label="Freight Booking Cost" value={money(totals.customerRate)} />
            <FinanceItem label="Payable Amount" value={money(totals.ledgerAmount)} />
            <FinanceItem label="Total Expense" value={money(totals.expenses)} />
            <FinanceItem label="Total Advance" value={money(totals.totalAdvance)} accent="advance" />
            <FinanceItem label="Net Freight" value={money(totals.netFreight)} accent="netFreight" />
            <FinanceItem label="Profit" value={money(totals.profit)} accent="profit" />
          </div>
        </div>

        <div className="bill-view-footer">
          <span>
            Generated from Saved Data - Entry: <strong>{entryView(item).replace(' View', '')}</strong> - S.No{' '}
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

function SectionTitle({ title }) {
  return (
    <div className="bill-section-title">
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
      <div className={className}>{value ?? '-'}</div>
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
