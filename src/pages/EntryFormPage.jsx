import { AutocompleteField } from '../components/forms/AutocompleteField.jsx';
import { Field } from '../components/forms/Field.jsx';
import { ReadOnlyField } from '../components/forms/ReadOnlyField.jsx';
import { SelectField } from '../components/forms/SelectField.jsx';
import { paymentModeOptions, paymentStatusOptions } from '../constants/consignment.js';

export function EntryFormPage({ editingId, form, suggestions, onBack, onSubmit, onUpdateField }) {
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
          <div className="option-stack">
            <RadioGroup
              label="Entry View"
              name="viewMode"
              value={form.viewMode}
              options={[
                { label: 'GST', value: 'GST' },
                { label: 'IMS', value: 'IMS' },
              ]}
              onChange={(value) => onUpdateField('viewMode', value)}
            />
          </div>
          <div className="field-row">
            <ReadOnlyField label="S.No" value={form.serialNo || 'Auto'} />
            <Field
              label="Sub S.No"
              value={form.subSerialNo}
              onChange={(value) => onUpdateField('subSerialNo', value)}
            />
          </div>
          {form.viewMode === 'GST' && (
            <Field label="GST No" value={form.gstNo} onChange={(value) => onUpdateField('gstNo', value)} />
          )}
          {form.viewMode === 'IMS' && (
            <Field label="IMS No" value={form.imsNo} onChange={(value) => onUpdateField('imsNo', value)} />
          )}
          <div className="field-row">
            <Field
              label="Ledger Date & Time"
              type="datetime-local"
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
            label="Loading Date & Time"
            type="datetime-local"
            value={form.loadingDate}
            onChange={(value) => onUpdateField('loadingDate', value)}
          />
          <Field
            label="Delivery Date & Time"
            type="datetime-local"
            value={form.deliveryDateTime}
            onChange={(value) => onUpdateField('deliveryDateTime', value)}
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
            <AutocompleteField
              label="Truck Type"
              value={form.truckType}
              suggestions={suggestions.truckType}
              onChange={(value) => onUpdateField('truckType', value)}
            />
          </div>
          <AutocompleteField
            label="Owner / Transporter"
            value={form.ownerName}
            suggestions={suggestions.owner}
            onChange={(value) => onUpdateField('ownerName', value)}
          />
          <div className="field-row">
            <div>
              <AutocompleteField
                label="Owner Primary Contact"
                value={form.ownerPrimaryContact}
                suggestions={suggestions.ownerPrimaryContact}
                onChange={(value) => onUpdateField('ownerPrimaryContact', value)}
              />
              <WhatsappCheck
                checked={form.ownerPrimaryWhatsappAvailable}
                onChange={(checked) => onUpdateField('ownerPrimaryWhatsappAvailable', checked)}
              />
            </div>
            <div>
              <AutocompleteField
                label="Owner Alternate Contact"
                value={form.ownerAlternateContact}
                suggestions={suggestions.ownerAlternateContact}
                onChange={(value) => onUpdateField('ownerAlternateContact', value)}
              />
              <WhatsappCheck
                checked={form.ownerAlternateWhatsappAvailable}
                onChange={(checked) => onUpdateField('ownerAlternateWhatsappAvailable', checked)}
              />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2>Driver & Route</h2>
          <AutocompleteField
            label="Driver Name"
            value={form.driverName}
            suggestions={suggestions.driver}
            onChange={(value) => onUpdateField('driverName', value)}
          />
          <div className="field-row">
            <div>
              <AutocompleteField
                label="Driver Primary Contact"
                value={form.driverPrimaryContact}
                suggestions={suggestions.driverPrimaryContact}
                onChange={(value) => onUpdateField('driverPrimaryContact', value)}
              />
              <WhatsappCheck
                checked={form.driverPrimaryWhatsappAvailable}
                onChange={(checked) => onUpdateField('driverPrimaryWhatsappAvailable', checked)}
              />
            </div>
            <div>
              <AutocompleteField
                label="Driver Alternate Contact"
                value={form.driverAlternateContact}
                suggestions={suggestions.driverAlternateContact}
                onChange={(value) => onUpdateField('driverAlternateContact', value)}
              />
              <WhatsappCheck
                checked={form.driverAlternateWhatsappAvailable}
                onChange={(checked) => onUpdateField('driverAlternateWhatsappAvailable', checked)}
              />
            </div>
          </div>
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
            label="Freight Amount to Truck Owner / Supplier"
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
          </div>
        </section>

        <section className="form-section">
          <h2>Our Rate & Profit</h2>
          {form.viewMode === 'GST' && (
            <div className="inline-option-block">
              <RadioGroup
                label="GST Type"
                name="gstType"
                value={form.gstType}
                options={[
                  { label: '18%', value: '18' },
                  { label: '5%', value: '5' },
                ]}
                onChange={(value) => onUpdateField('gstType', value)}
              />
            </div>
          )}
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
            label="Additional Charge Type"
            type="number"
            value={form.additionalChargeType}
            onChange={(value) => onUpdateField('additionalChargeType', value)}
          />
          <Field
            label="Additional Expense Type"
            type="number"
            value={form.additionalExpenseType}
            onChange={(value) => onUpdateField('additionalExpenseType', value)}
          />
          <div className="field-row">
            <Field label="LR No." value={form.lrNo} onChange={(value) => onUpdateField('lrNo', value)} />
            <Field
              label="LR Date & Time"
              type="datetime-local"
              value={form.lrDate}
              onChange={(value) => onUpdateField('lrDate', value)}
            />
          </div>
          <div className="field-row">
            <Field label="Invoice No." value={form.invoiceNo} onChange={(value) => onUpdateField('invoiceNo', value)} />
            <Field
              label="Invoice Date & Time"
              type="datetime-local"
              value={form.invoiceDate}
              onChange={(value) => onUpdateField('invoiceDate', value)}
            />
          </div>

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
    </form>
  );
}

function WhatsappCheck({ checked, onChange }) {
  return (
    <label className="whatsapp-check">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>WhatsApp available</span>
    </label>
  );
}

function RadioGroup({ label, name, value, options, onChange }) {
  return (
    <fieldset className="radio-group">
      <legend>{label}</legend>
      <div className="radio-options">
        {options.map((option) => (
          <label key={option.value} className="radio-option">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(event) => onChange(event.target.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
