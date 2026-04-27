import { AutocompleteField } from '../components/forms/AutocompleteField.jsx';
import { Field } from '../components/forms/Field.jsx';
import { SelectField } from '../components/forms/SelectField.jsx';
import { paymentModeOptions, paymentStatusOptions, supplierRateTypeOptions } from '../constants/consignment.js';

export function EntryFormPage({ editingId, form, suggestions, onBack, onSubmit, onUpdateField }) {
  return (
    <form id="consignment-form" className="entry-panel" onSubmit={onSubmit} autoComplete="off">
      <div className="form-header">
        <span>{editingId ? `Editing #${form.serialNo || editingId}` : 'New Entry'}</span>
        <button type="button" className="header-back" onClick={onBack}>
          Back to Home
        </button>
      </div>

      <div className="entry-layout">
        <fieldset className="form-section form-section-wide">
          <legend>Basic Info</legend>
          <div className="field-row">
            <Field label="S.No" value={form.serialNo} onChange={(value) => onUpdateField('serialNo', value)} />
            <SelectField
              label="Billing Type"
              value={form.viewMode}
              options={[
                { label: 'GST Invoice', value: 'GST' },
                { label: 'IMS No', value: 'IMS' },
              ]}
              onChange={(value) => onUpdateField('viewMode', value)}
              required
            />
          </div>
          <div className="field-row">
            {form.viewMode === 'GST' ? (
              <GstNumberField value={form.gstNo} onChange={(value) => onUpdateField('gstNo', value)} />
            ) : (
              <Field label="IMS No" value={form.imsNo} onChange={(value) => onUpdateField('imsNo', value)} />
            )}
          </div>
          <div className="field-row">
            <AutocompleteField
            label="Booking Customer Name"
            value={form.customerName}
            suggestions={suggestions.customer}
            onChange={(value) => onUpdateField('customerName', value)}
            required
          />
            <Field
              label="Booking Date & Time"
              type="datetime-local"
              value={form.ledgerDate}
              onChange={(value) => onUpdateField('ledgerDate', value)}
            />
            <Field
              label="Loading Date & Time"
              type="datetime-local"
              value={form.loadingDate}
              onChange={(value) => onUpdateField('loadingDate', value)}
            />
            <div className="field-row">
            <AutocompleteField
              label="Loading Location"
              value={form.fromLocation}
              suggestions={suggestions.from}
              onChange={(value) => onUpdateField('fromLocation', value)}
            />
            <AutocompleteField
              label="Delivery Location"
              value={form.toLocation}
              suggestions={suggestions.to}
              onChange={(value) => onUpdateField('toLocation', value)}
            />
          </div>
          </div>
          <div className="field-row">
             <AutocompleteField
              label="Customer to be billed"
              value={form.billTo}
              suggestions={suggestions.billTo}
              onChange={(value) => onUpdateField('billTo', value)}
            />
            <Field
              label="Delivery Date & Time"
              type="datetime-local"
              value={form.deliveryDateTime}
              onChange={(value) => onUpdateField('deliveryDateTime', value)}
            />
             
           
          </div>
         
          <div className="field-grid-4">
             <Field
              label="Gross Weight"
              type="number"
              value={form.grossWeight}
              onChange={(value) => onUpdateField('grossWeight', value)}
            />
               <Field
              label="Tare Weight"
              type="number"
              value={form.tareWeight}
              onChange={(value) => onUpdateField('tareWeight', value)}
            />

            <Field
              label="Net Weight"
              type="number"
              value={form.netWeight}
              onChange={(value) => onUpdateField('netWeight', value)}
            />
           
            <Field
              label="Material Description"
              type="text"
              value={form.material}
              onChange={(value) => onUpdateField('material', value)}
            />
           
           
          </div>
        </fieldset>

        <fieldset className="form-section form-section-half">
          <legend>Vehicle Info</legend>
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
            <AutocompleteField
              label="Owner Primary Contact"
              value={form.ownerPrimaryContact}
              suggestions={suggestions.ownerPrimaryContact}
              onChange={(value) => onUpdateField('ownerPrimaryContact', value)}
            />
            <AutocompleteField
              label="Owner Alternate Contact"
              value={form.ownerAlternateContact}
              suggestions={suggestions.ownerAlternateContact}
              onChange={(value) => onUpdateField('ownerAlternateContact', value)}
            />
          </div>
        </fieldset>

        <fieldset className="form-section form-section-half">
          <legend>Driver Info</legend>
          <div className="field-row">
            <AutocompleteField
              label="Driver Name"
              value={form.driverName}
              suggestions={suggestions.driver}
              onChange={(value) => onUpdateField('driverName', value)}
            />
            <Field label="DL No." value={form.dlNo} onChange={(value) => onUpdateField('dlNo', value)} />
          </div>
          <div className="field-row">
            <AutocompleteField
              label="Driver Primary Contact"
              value={form.driverPrimaryContact}
              suggestions={suggestions.driverPrimaryContact}
              onChange={(value) => onUpdateField('driverPrimaryContact', value)}
            />
            <AutocompleteField
              label="Driver Alternate Contact"
              value={form.driverAlternateContact}
              suggestions={suggestions.driverAlternateContact}
              onChange={(value) => onUpdateField('driverAlternateContact', value)}
            />
          </div>
          
        </fieldset>

        <fieldset className="form-section form-section-third">
          <legend>Supplier Billing</legend>
           <SelectField
              label="Freight Amount Type"
              value={form.supplierRateType}
              options={supplierRateTypeOptions}
              onChange={(value) => onUpdateField('supplierRateType', value)}
            />
          <div className="field-row">
           
            <Field
              label={form.supplierRateType === 'cost_per_mt' ? 'Cost per MT' : 'Fixed Cost'}
              type="number"
              value={form.supplierAmount}
              onChange={(value) => onUpdateField('supplierAmount', value)}
            />
            <Field
              label="Chargeble Weight"
              type="number"
              value={form.chargebleWeight}
              onChange={(value) => onUpdateField('chargebleWeight', value)}
            />
          </div>
             <div className="field-row">

             <Field
            label="Payable Amount"
            type="number"
            value={form.ledgerAmount}
            onChange={(value) => onUpdateField('ledgerAmount', value)}
          />
           <Field
            label="Halting Charge"
            type="number"
            value={form.haltingCharge}
            onChange={(value) => onUpdateField('haltingCharge', value)}
          />

        </div>
          <div className="field-row">
            
            <Field
              label="Commission"
              type="number"
              value={form.advance}
              onChange={(value) => onUpdateField('advance', value)}
            />
            <Field label="Net Payment Balance" type="number" value={form.balance} onChange={(value) => onUpdateField('balance', value)} />
          </div>
          <AdvanceEntriesField entries={form.advanceEntries} onChange={(nextEntries) => onUpdateField('advanceEntries', nextEntries)} />
         
          <SelectField
            label="Supplier Payment Status"
            value={form.paymentStatus}
            options={paymentStatusOptions}
            required
            onChange={(value) => onUpdateField('paymentStatus', value)}
          />
        </fieldset>

        <fieldset className="form-section form-section-third">
          <legend>Our Rate & Profit</legend>
          {form.viewMode === 'GST' && (
            <div className="inline-option-block">
              <RadioGroup
                label="GST Type"
                name="gstType"
                value={form.gstType}
                required={Boolean(form.gstNo && form.gstNo.trim())}
                options={[
                  { label: '18%', value: '18' },
                  { label: '5%', value: '5' },
                ]}
                onChange={(value) => onUpdateField('gstType', value)}
              />
            </div>
          )}
          <Field
            label="Booking to Customer"
            type="number"
            value={form.customerRate}
            onChange={(value) => onUpdateField('customerRate', value)}
          />
          <div className="field-row">
            <Field
              label="Additional Charge"
              type="number"
              value={form.additionalCharges}
              onChange={(value) => onUpdateField('additionalCharges', value)}
            />
            <Field
              label="Additional Expense"
              type="number"
              value={form.expenses}
              onChange={(value) => onUpdateField('expenses', value)}
            />
          </div>
          <div className="field-row">
            <Field
              label="Net Freight"
              type="number"
              value={form.netFreight}
              onChange={(value) => onUpdateField('netFreight', value)}
            />
            <Field label="Profit" type="number" value={form.profit} onChange={(value) => onUpdateField('profit', value)} />
          </div>
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
            <Field label="Customer Invoice No." value={form.invoiceNo} onChange={(value) => onUpdateField('invoiceNo', value)} />
            <Field
              label="Invoice Date & Time"
              type="datetime-local"
              value={form.invoiceDate}
              onChange={(value) => onUpdateField('invoiceDate', value)}
            />
          </div>
        </fieldset>

        <fieldset className="form-section form-section-third">
          <legend>Extra</legend>
          <SelectField
            label="Payment Mode"
            value={form.paymentMode}
            options={paymentModeOptions}
            required
            onChange={(value) => onUpdateField('paymentMode', value)}
          />
          <label className="field">
            <span>Remarks / Notes</span>
            <textarea autoComplete="off" value={form.remarks} onChange={(event) => onUpdateField('remarks', event.target.value)} />
          </label>
        </fieldset>
      </div>
    </form>
  );
}

function RadioGroup({ label, name, value, options, onChange, required = false }) {
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
              required={required}
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

function AdvanceEntriesField({ entries, onChange }) {
  const rows = Array.isArray(entries) && entries.length > 0 ? entries : [{ id: 1, amount: '' }];

  function updateEntry(index, amount) {
    const nextEntries = rows.map((entry, entryIndex) => (entryIndex === index ? { ...entry, amount } : entry));
    onChange(nextEntries);
  }

  function addEntry() {
    const nextEntries = [...rows, { id: rows.length + 1, amount: '' }];
    onChange(nextEntries);
  }

  return (
    <div className="advance-list">
      {rows.map((entry, index) => (
        <div key={entry.id ?? index} className="advance-row">
          <label className="field advance-entry-field">
            <span>Advance {index + 1}</span>
            <input
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              value={entry.amount}
              onChange={(event) => updateEntry(index, event.target.value)}
            />
          </label>
          {index === rows.length - 1 && (
            <button type="button" className="advance-add-btn" onClick={addEntry} aria-label="Add advance row">
              +
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function GstNumberField({ value, onChange }) {
  const prefix = 'Nalvel-';
  const digits = String(value || '').startsWith(prefix) ? String(value).slice(prefix.length) : String(value || '');

  function handleChange(nextValue) {
    const nextDigits = String(nextValue || '').replace(/\D/g, '');
    onChange(nextDigits ? `${prefix}${nextDigits}` : '');
  }

  return (
    <label className="field gst-no-field">
      <span>GST Invoice</span>
      <div className="gst-no-control">
        <span className="gst-no-prefix">{prefix}</span>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={digits}
          onChange={(event) => handleChange(event.target.value)}
        />
      </div>
    </label>
  );
}
