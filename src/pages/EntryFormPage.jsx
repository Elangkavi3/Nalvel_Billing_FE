import { SummaryBox } from '../components/common/SummaryBox.jsx';
import { AutocompleteField } from '../components/forms/AutocompleteField.jsx';
import { Field } from '../components/forms/Field.jsx';
import { ReadOnlyField } from '../components/forms/ReadOnlyField.jsx';
import { SelectField } from '../components/forms/SelectField.jsx';
import { paymentModeOptions, paymentStatusOptions, truckTypeOptions } from '../constants/consignment.js';
import { money } from '../utils/numbers.js';

export function EntryFormPage({ calculated, editingId, form, suggestions, onBack, onSubmit, onUpdateField }) {
  return (
    <form id="consignment-form" className="entry-panel" onSubmit={onSubmit}>
      <div className="form-header">
        <span>{editingId ? `Editing #${form.serialNo || editingId}` : 'New Entry'}</span>
        <button type="button" className="header-back" onClick={onBack}>
          Back to Home
        </button>
      </div>

      <div className="grid3">
        <section className="form-section">
          <h2>Basic Info</h2>
          <div className="field-row">
            <ReadOnlyField label="S.No" value={form.serialNo || 'Auto'} />
            <Field
              label="Ledger Date"
              type="date"
              value={form.ledgerDate}
              onChange={(value) => onUpdateField('ledgerDate', value)}
            />
          </div>
          <AutocompleteField
            label="Customer Name"
            value={form.customerName}
            suggestions={suggestions.customer}
            onChange={(value) => onUpdateField('customerName', value)}
            required
          />
          <Field
            label="Movement / Loading Date"
            type="date"
            value={form.loadingDate}
            onChange={(value) => onUpdateField('loadingDate', value)}
          />
          <AutocompleteField
            label="Bill To / Delivery Customer"
            value={form.billTo}
            suggestions={suggestions.billTo}
            onChange={(value) => onUpdateField('billTo', value)}
          />

          <h2>Vehicle Info</h2>
          <div className="field-row">
            <AutocompleteField
              label="Truck No"
              value={form.truckNo}
              suggestions={suggestions.truck}
              onChange={(value) => onUpdateField('truckNo', value)}
            />
            <SelectField
              label="Truck Type"
              value={form.truckType}
              options={truckTypeOptions}
              onChange={(value) => onUpdateField('truckType', value)}
            />
          </div>
          <AutocompleteField
            label="Owner / Transporter"
            value={form.ownerName}
            suggestions={suggestions.owner}
            onChange={(value) => onUpdateField('ownerName', value)}
          />
          <Field label="Owner Contact" value={form.ownerContact} onChange={(value) => onUpdateField('ownerContact', value)} />
        </section>

        <section className="form-section">
          <h2>Driver & Route</h2>
          <AutocompleteField
            label="Driver Name"
            value={form.driverName}
            suggestions={suggestions.driver}
            onChange={(value) => onUpdateField('driverName', value)}
          />
          <Field label="Driver Contact" value={form.driverContact} onChange={(value) => onUpdateField('driverContact', value)} />
          <div className="field-row">
            <AutocompleteField
              label="From Location"
              value={form.fromLocation}
              suggestions={suggestions.from}
              onChange={(value) => onUpdateField('fromLocation', value)}
            />
            <AutocompleteField
              label="To Location"
              value={form.toLocation}
              suggestions={suggestions.to}
              onChange={(value) => onUpdateField('toLocation', value)}
            />
          </div>
          <Field label="Weight (MT)" type="number" value={form.weight} onChange={(value) => onUpdateField('weight', value)} />

          <h2>Supplier Billing</h2>
          <Field
            label="Billing Amount to Supplier"
            type="number"
            value={form.supplierAmount}
            onChange={(value) => onUpdateField('supplierAmount', value)}
          />
          <div className="field-row">
            <Field
              label="Advance to Supplier"
              type="number"
              value={form.advance}
              onChange={(value) => onUpdateField('advance', value)}
            />
            <ReadOnlyField label="Balance to Supplier" value={money(calculated.balance)} />
          </div>
          <ReadOnlyField label="Ledger Amount" value={money(calculated.ledgerAmount)} />
        </section>

        <section className="form-section">
          <h2>Our Rate & Profit</h2>
          <Field
            label="Billing to Customer"
            type="number"
            value={form.customerRate}
            onChange={(value) => onUpdateField('customerRate', value)}
          />
          <SelectField
            label="Supplier Payment Status"
            value={form.paymentStatus}
            options={paymentStatusOptions}
            onChange={(value) => onUpdateField('paymentStatus', value)}
          />
          <Field
            label="Additional Expenses"
            type="number"
            value={form.expenses}
            onChange={(value) => onUpdateField('expenses', value)}
          />
          <ReadOnlyField label="Net Profit" value={money(calculated.profit)} highlight />

          <h2>Extra</h2>
          <SelectField
            label="Payment Mode"
            value={form.paymentMode}
            options={paymentModeOptions}
            onChange={(value) => onUpdateField('paymentMode', value)}
          />
          <label className="field">
            <span>Remarks / Notes</span>
            <textarea value={form.remarks} onChange={(event) => onUpdateField('remarks', event.target.value)} />
          </label>
        </section>
      </div>

      <section className="calc-bar">
        <h2>Auto-calculated summary</h2>
        <div className="summary-grid">
          <SummaryBox label="Billing to Supplier" value={money(form.supplierAmount)} />
          <SummaryBox label="Advance Paid" value={money(form.advance)} />
          <SummaryBox label="Balance Due" value={money(calculated.balance)} />
          <SummaryBox label="Net Profit" value={money(calculated.profit)} highlight />
        </div>
      </section>
    </form>
  );
}
