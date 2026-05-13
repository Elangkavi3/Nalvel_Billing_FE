import { AutocompleteField } from "../components/forms/AutocompleteField.jsx";
import { Field } from "../components/forms/Field.jsx";
import { SelectField } from "../components/forms/SelectField.jsx";
import {
  paymentModeOptions,
  supplierRateTypeOptions,
  PaymentTypeOptions,
} from "../constants/consignment.js";

const mobileProps = {
  inputMode: "numeric",
  maxLength: 10,
  pattern: "[0-9]{10}",
  title: "Enter exactly 10 digits",
};

const decimalNumberProps = {
  type: "text",
  inputMode: "decimal",
  onWheel: (e) => e.currentTarget.blur(),

  onInput: (e) => {
    e.target.value = e.target.value
      .replace(/[^0-9.]/g, "")
      .replace(/(\..*?)\..*/g, "$1");
  },
};

export function EntryFormPage({
  editingId,
  form,
  suggestions,
  onBack,
  onSubmit,
  onUpdateField,
}) {
  const customerBaseAmount =
    form.supplierRateType === "cost_per_mt"
      ? Number(form.customerAmount || 0) *
        Number(form.customerChargeableWeight || 0)
      : Number(form.customerAmount || 0);

  const additionalCharge = Number(form.additionalCharges || 0);

  const gstPercent = Number(form.gstType || 0);

  const totalExpense = Number(form.ledgerAmount || 0);

  const totalFreightBeforeGST = customerBaseAmount + additionalCharge;

  const totalFreight =
    totalFreightBeforeGST + (totalFreightBeforeGST * gstPercent) / 100;

  const profit = totalFreight - totalExpense;

  return (
    <form
      id="consignment-form"
      className="entry-panel"
      onSubmit={onSubmit}
      autoComplete="off"
    >
      <div className="form-header">
        <span>
          {editingId ? `Editing #${form.serialNo || editingId}` : "New Entry"}
        </span>
        <button type="button" className="header-back" onClick={onBack}>
          Back to Home
        </button>
      </div>

      <div className="entry-layout">
        <fieldset className="form-section form-section-wide">
          <legend>Basic Info</legend>
          <div className="field-row field-row-3">
            <Field
              label="S.No"
              value={form.serialNo}
              onChange={(value) => onUpdateField("serialNo", value)}
            />
            <SelectField
              label="Billing Type"
              value={form.viewMode}
              options={[
                { label: "GST Invoice", value: "GST" },
                { label: "IMS No", value: "IMS" },
              ]}
              onChange={(value) => onUpdateField("viewMode", value)}
              required
            />

            {form.viewMode === "GST" ? (
              <GstNumberField
                value={form.gstNo}
                onChange={(value) => onUpdateField("gstNo", value)}
              />
            ) : (
              <Field
                label="IMS No"
                value={form.imsNo}
                onChange={(value) => onUpdateField("imsNo", value)}
              />
            )}
          </div>
          <div className="field-row field-row-3">
            <AutocompleteField
              label="Booking Customer Name"
              value={form.customerName}
              suggestions={suggestions.customer}
              onChange={(value) => onUpdateField("customerName", value)}
              required
            />
            <Field
              label="Booking Date"
              type="date"
              value={form.ledgerDate}
              onChange={(value) => onUpdateField("ledgerDate", value)}
            />
            <Field
              label="Loading Date"
              type="date"
              value={form.loadingDate}
              onChange={(value) => onUpdateField("loadingDate", value)}
            />
          </div>
          <div className="field-row">
            <label className="field">
              <span>Loading Location</span>
              <textarea
                rows={4}
                autoComplete="off"
                value={form.fromLocation}
                onChange={(event) =>
                  onUpdateField("fromLocation", event.target.value)
                }
              />
            </label>
            <label className="field">
              <span>Delivery Location</span>
              <textarea
                rows={4}
                autoComplete="off"
                value={form.toLocation}
                onChange={(event) =>
                  onUpdateField("toLocation", event.target.value)
                }
              />
            </label>
          </div>

          <div className="field-row">
            <AutocompleteField
              label="Customer to be billed"
              value={form.billTo}
              suggestions={suggestions.billTo}
              onChange={(value) => onUpdateField("billTo", value)}
            />
            <Field
              label="Delivery Date"
              type="date"
              value={form.deliveryDateTime}
              onChange={(value) => onUpdateField("deliveryDateTime", value)}
            />
          </div>

          <div className="field-row">
            <div>
              <div className="field-row">
                <Field
                  label="Gross Weight"
                  value={form.grossWeight}
                  onChange={(value) => onUpdateField("grossWeight", value)}
                  {...decimalNumberProps}
                />
                <Field
                  label="Tare Weight"
                  value={form.tareWeight}
                  onChange={(value) => onUpdateField("tareWeight", value)}
                  {...decimalNumberProps}
                />
              </div>
              <Field
                label="Net Weight"
                value={form.netWeight}
                onChange={(value) => onUpdateField("netWeight", value)}
                {...decimalNumberProps}
              />
            </div>
            <label className="field">
              <span>Material Description</span>
              <textarea
                rows={5}
                autoComplete="off"
                value={form.material}
                onChange={(event) =>
                  onUpdateField("material", event.target.value)
                }
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="form-section form-section-half">
          <legend>Vehicle Info</legend>
          <div className="field-row">
            <AutocompleteField
              label="Truck No"
              value={form.truckNo}
              suggestions={suggestions.truck}
              onChange={(value) => onUpdateField("truckNo", value)}
            />
            <AutocompleteField
              label="Truck Type"
              value={form.truckType}
              suggestions={suggestions.truckType}
              onChange={(value) => onUpdateField("truckType", value)}
            />
          </div>
          <AutocompleteField
            label="Owner / Transporter (Name)"
            value={form.ownerName}
            suggestions={suggestions.owner}
            onChange={(value) => onUpdateField("ownerName", value)}
          />
          <div className="field-row">
            <AutocompleteField
              label="Owner Primary Contact"
              value={form.ownerPrimaryContact}
              suggestions={suggestions.ownerPrimaryContact}
              onChange={(value) => onUpdateField("ownerPrimaryContact", value)}
              {...mobileProps}
            />
            <AutocompleteField
              label="Owner Alternate Contact"
              value={form.ownerAlternateContact}
              suggestions={suggestions.ownerAlternateContact}
              onChange={(value) =>
                onUpdateField("ownerAlternateContact", value)
              }
              {...mobileProps}
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
              onChange={(value) => onUpdateField("driverName", value)}
            />
            <Field
              label="DL No."
              value={form.dlNo}
              onChange={(value) => onUpdateField("dlNo", value)}
            />
          </div>
          <div className="field-row">
            <AutocompleteField
              label="Driver Primary Contact"
              value={form.driverPrimaryContact}
              suggestions={suggestions.driverPrimaryContact}
              onChange={(value) => onUpdateField("driverPrimaryContact", value)}
              {...mobileProps}
            />
            <AutocompleteField
              label="Driver Alternate Contact"
              value={form.driverAlternateContact}
              suggestions={suggestions.driverAlternateContact}
              onChange={(value) =>
                onUpdateField("driverAlternateContact", value)
              }
              {...mobileProps}
            />
          </div>
        </fieldset>

        <fieldset className="form-section form-section-half">
          <legend>Supplier Billing</legend>
          <div className="field-row">
            <SelectField
              label="Freight Amount Type"
              value={form.supplierRateType}
              options={supplierRateTypeOptions}
              onChange={(value) => onUpdateField("supplierRateType", value)}
            />

            <Field
              label={
                form.supplierRateType === "cost_per_mt"
                  ? "Cost Per MT"
                  : "Fixed Cost"
              }
              value={form.supplierAmount}
              onChange={(value) => onUpdateField("supplierAmount", value)}
              {...decimalNumberProps}
            />
            <Field
              label="Chargeable Weight"
              value={form.chargeableWeight}
              onChange={(value) => onUpdateField("chargeableWeight", value)}
              {...decimalNumberProps}
            />

            <Field
              label="Halting Charge"
              value={form.haltingCharge}
              onChange={(value) => onUpdateField("haltingCharge", value)}
              {...decimalNumberProps}
            />
          </div>
          <div className="field-row">
            <Field
              label="Parking Charge"
              value={form.parkingCharge}
              onChange={(value) => onUpdateField("parkingCharge", value)}
              {...decimalNumberProps}
            />
            <Field
              label="Payable Amount"
              value={Math.floor(Number(form.ledgerAmount || 0))}
              onChange={(value) => onUpdateField("ledgerAmount", value)}
              {...decimalNumberProps}
            />
          </div>
          <div className="field-row">
            <Field
              label="Commission"
              value={form.commission}
              onChange={(value) => onUpdateField("commission", value)}
              {...decimalNumberProps}
            />
            {/* <Field label="Net Payment Balance" value={form.netBalance} onChange={(value) => onUpdateField('netBalance', value)} {...decimalNumberProps} /> */}
            {/* <label className="field">
              <span>Balance</span>

              <div className="status-input-wrapper">
                <input
                  value={form.balance || ""}
                  readOnly
                  {...decimalNumberProps}
                />

                
              </div>
            </label> */}
          </div>
          <AdvanceEntriesField
            entries={form.advanceEntries}
            formBalance={form.balance}
            onChange={(nextEntries) =>
              onUpdateField("advanceEntries", nextEntries)
            }
          />
          <div className="field-row">
            <Field
              label="Total Amount Paid"
              value={Math.floor(Number(form.totalAdvance || 0))}
              onChange={(value) => onUpdateField("totalAdvance", value)}
              {...decimalNumberProps}
            />
            <label className="field">
              <span>Balance</span>

              <div className="status-input-wrapper">
                <input
                  value={
  Number(form.balance || 0) > 0
    ? Math.floor(Number(form.balance || 0))
    : 0
}
                  readOnly
                  {...decimalNumberProps}
                />

                <span
                  className={`inline-payment-status ${
                    Number(form.balance || 0) <= 0 ? "paid" : "pending"
                  }`}
                >
                  {Number(form.balance || 0) <= 0 ? "PAID" : "PENDING"}
                </span>
              </div>
            </label>
            {Number(form.balance || 0) < 0 && (
              <Field
                label="Excess"
                value={Math.floor(Math.abs(Number(form.balance || 0)))}
                readOnly
                {...decimalNumberProps}
              />
            )}{" "}
          </div>
          <div className="field-row">
            <SelectField
              label="Payment Type Options"
              value={form.paymentType}
              options={PaymentTypeOptions}
              onChange={(value) => onUpdateField("paymentType", value)}
            />
            <SelectField
              label="Truck Pay Mode"
              value={form.truckpaymentMode}
              options={paymentModeOptions}
              required
              onChange={(value) => onUpdateField("truckpaymentMode", value)}
            />
          </div>
        </fieldset>

        <fieldset className="form-section form-section-half">
          <legend>Our Rate & Profit</legend>
          <div className="field-row">
            <Field
              label={
                form.supplierRateType === "cost_per_mt"
                  ? "Our Cost Per MT"
                  : "Fixed Cost"
              }
              value={form.customerAmount}
              onChange={(value) => onUpdateField("customerAmount", value)}
              {...decimalNumberProps}
            />

            <Field
              label="Our Chargeable Weight"
              value={form.customerChargeableWeight}
              onChange={(value) =>
                onUpdateField("customerChargeableWeight", value)
              }
              {...decimalNumberProps}
            />
          </div>

          <div className="field-row">
            {form.viewMode === "GST" && (
              <div className="inline-option-block">
                <RadioGroup
                  label="GST Type"
                  name="gstType"
                  value={form.gstType}
                  required={Boolean(form.gstNo && form.gstNo.trim())}
                  options={[
                    { label: "18%", value: "18" },
                    { label: "5%", value: "5" },
                  ]}
                  onChange={(value) => onUpdateField("gstType", value)}
                />
              </div>
            )}

            <Field
              label="Freight Booking Cost"
              value={Math.ceil(customerBaseAmount)}
              readOnly
              onChange={(value) => onUpdateField("customerRate", value)}
              {...decimalNumberProps}
            />
          </div>
          <div className="field-row">
            <Field
              label="Additional Charge"
              value={form.additionalCharges}
              onChange={(value) => onUpdateField("additionalCharges", value)}
              {...decimalNumberProps}
            />
            <Field
              label="Total Expense"
              value={Math.ceil(totalExpense)}
              readOnly
              onChange={(value) => onUpdateField("expenses", value)}
              {...decimalNumberProps}
            />
          </div>
          <div className="field-row">
            <Field
              label="Total Freight Amount(incl. GST)"
              value={Math.ceil(totalFreight)}
              readOnly
              onChange={(value) => onUpdateField("netFreight", value)}
              {...decimalNumberProps}
            />
            <Field
              label="Profit"
              value={Math.ceil(profit)}
              readOnly
              onChange={(value) => onUpdateField("profit", value)}
              {...decimalNumberProps}
            />
          </div>
          <div className="field-row">
            <Field
              label="LR No."
              value={form.lrNo}
              onChange={(value) => onUpdateField("lrNo", value)}
            />
            <Field
              label="LR Date"
              type="date"
              value={form.lrDate}
              onChange={(value) => onUpdateField("lrDate", value)}
            />
          </div>
          <div className="field-row">
            <Field
              label="Customer Invoice No."
              value={form.invoiceNo}
              onChange={(value) => onUpdateField("invoiceNo", value)}
            />
            <Field
              label="Invoice Date"
              type="date"
              value={form.invoiceDate}
              onChange={(value) => onUpdateField("invoiceDate", value)}
            />
          </div>

          <legend>Extra</legend>
          <SelectField
            label="Customer Payment Mode"
            value={form.customerPaymentMode}
            options={paymentModeOptions}
            required
            onChange={(value) => onUpdateField("customerPaymentMode", value)}
          />
          <label className="field">
            <span>Remarks / Notes</span>
            <textarea
              autoComplete="off"
              value={form.remarks}
              onChange={(event) => onUpdateField("remarks", event.target.value)}
            />
          </label>
        </fieldset>
      </div>
    </form>
  );
}

function RadioGroup({
  label,
  name,
  value,
  options,
  onChange,
  required = false,
}) {
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

function AdvanceEntriesField({ entries, onChange, formBalance }) {
  const rows =
    Array.isArray(entries) && entries.length > 0
      ? entries
      : [{ id: 1, amount: "", refNo: "" }];

  function updateEntry(index, key, value) {
    const nextEntries = rows.map((entry, entryIndex) =>
      entryIndex === index ? { ...entry, [key]: value } : entry,
    );
    onChange(nextEntries);
  }

  function addEntry() {
    const nextEntries = [
      ...rows,
      { id: `new-${Date.now()}`, amount: "", refNo: "" },
    ];
    onChange(nextEntries);
  }

  return (
    <div className="advance-list">
      {rows.map((entry, index) => (
        <div key={entry.id ?? index} className="advance-row">
          <label className="field advance-entry-field">
            <span>
              {index === rows.length - 1 && Number(formBalance || 0) <= 0
                ? "Final Amount"
                : `Advance ${index + 1}`}
            </span>
            <input
              min="0"
              value={entry.amount ?? ""}
              onChange={(event) =>
                updateEntry(index, "amount", event.target.value)
              }
              {...decimalNumberProps}
            />
          </label>
          <label className="field advance-entry-field">
            <span>Ref No {index + 1}</span>
            <div className="advance-ref-control">
              <input
                type="text"
                value={entry.refNo ?? ""}
                onChange={(event) =>
                  updateEntry(index, "refNo", event.target.value)
                }
              />
              {index === rows.length - 1 && (
                <button
                  type="button"
                  className="advance-add-btn"
                  onClick={addEntry}
                  aria-label="Add advance row"
                >
                  +
                </button>
              )}
            </div>
          </label>
        </div>
      ))}
    </div>
  );
}

function GstNumberField({ value, onChange }) {
  const prefix = "Nalvel-";
  const textValue = String(value || "").startsWith(prefix)
    ? String(value).slice(prefix.length)
    : String(value || "");

  function handleChange(nextValue) {
    const nextText = String(nextValue || "");
    onChange(nextText ? `${prefix}${nextText}` : "");
  }

  return (
    <label className="field gst-no-field">
      <span>GST Invoice</span>
      <div className="gst-no-control">
        <span className="gst-no-prefix">{prefix}</span>
        <input
          type="text"
          value={textValue}
          onChange={(event) => handleChange(event.target.value)}
        />
      </div>
    </label>
  );
}