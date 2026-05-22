import { useEffect, useState } from "react";
import { AutocompleteField } from "../components/forms/AutocompleteField.jsx";
import { Field } from "../components/forms/Field.jsx";
import { SelectField } from "../components/forms/SelectField.jsx";
import {
  paymentModeOptions,
  supplierRateTypeOptions,
  PaymentTypeOptions,
} from "../constants/consignment.js";
import {
  deleteAdditionalFile,
  previewAdditionalFile,
} from "../services/additionalFileApi.js";

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

const maxAdditionalFileSize = 50 * 1024 * 1024;
const allowedAdditionalFileMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);
const allowedAdditionalFileExtensions = new Set(["pdf", "jpeg", "jpg", "png"]);
const additionalFileAccept =
  ".pdf,.jpeg,.jpg,.png,application/pdf,image/jpeg,image/png";

const entryFormSteps = [
  { key: "basic", label: "Basic Info" },
  { key: "supplier", label: "Supplier Billing" },
  { key: "profit", label: "Our Rate & Profit" },
];

function hasValue(value) {
  return String(value ?? "").trim().length > 0;
}

function hasDecimalInput(value) {
  return String(value ?? "").includes(".");
}

function formatNetWeight(grossWeight, tareWeight) {
  const netWeight = Number(grossWeight || 0) - Number(tareWeight || 0);
  return hasDecimalInput(grossWeight) || hasDecimalInput(tareWeight)
    ? netWeight.toFixed(2)
    : String(netWeight);
}

function scrollToFormTop() {
  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function isAllowedAdditionalFile(file) {
  const extension = String(file?.name || "")
    .split(".")
    .pop()
    .toLowerCase();
  const type = String(file?.type || "").toLowerCase();

  return (
    allowedAdditionalFileMimeTypes.has(type) ||
    allowedAdditionalFileExtensions.has(extension)
  );
}

export function EntryFormPage({
  editingId,
  resetKey,
  form,
  suggestions,
  onBack,
  onSubmit,
  onUpdateField,
}) {
  const [activeStep, setActiveStep] = useState(0);
  const lastStepIndex = entryFormSteps.length - 1;

  useEffect(() => {
    setActiveStep(0);
  }, [editingId, resetKey]);

  const isCostPerMt = form.supplierRateType === "cost_per_mt";
  const ourRateAmount = isCostPerMt
    ? form.profitCostPerMT
    : form.profitFixedCost;
  const customerBaseAmount = isCostPerMt
    ? Number(form.profitCostPerMT || 0) *
      Number(form.profitChargeableWeight || 0)
    : Number(form.profitFixedCost || 0);

  const additionalCharge = Number(form.additionalCharges || 0);

  const isGSTBilling = form.viewMode === "GST";

  const gstPercent = isGSTBilling ? Number(form.gstType || 0) : 0;

  const totalExpense = Number(form.ledgerAmount || 0);

  const totalFreightBeforeGST = customerBaseAmount + additionalCharge;

  const gstAmount = (totalFreightBeforeGST * gstPercent) / 100;

  const totalFreight = totalFreightBeforeGST + gstAmount;

  const otherExpenses = Number(form.otherExpenses || 0);

  const profit = totalFreightBeforeGST - totalExpense - otherExpenses;

  const isFirstStep = activeStep === 0;
  const isLastStep = activeStep === lastStepIndex;
  const isBasicInfoComplete =
    hasValue(form.viewMode) && hasValue(form.customerName);
  const isSupplierBillingComplete =
    isBasicInfoComplete && hasValue(form.truckpaymentMode);

  function goToStep(nextStep) {
    setActiveStep(Math.min(Math.max(nextStep, 0), lastStepIndex));
    scrollToFormTop();
  }

  function handleNextStep(event) {
    event.preventDefault();
    goToStep(activeStep + 1);
  }

  function handleStepSelect(stepIndex) {
    goToStep(stepIndex);
  }

  function handleFormSubmit(event) {
    const formElement = event.currentTarget;

    if (!isLastStep) {
      event.preventDefault();
      goToStep(activeStep + 1);
      return;
    }

    if (!isBasicInfoComplete) {
      event.preventDefault();
      goToStep(0);
      window.setTimeout(() => formElement.reportValidity(), 0);
      return;
    }

    if (!isSupplierBillingComplete) {
      event.preventDefault();
      goToStep(1);
      window.setTimeout(() => formElement.reportValidity(), 0);
      return;
    }

    onSubmit(event);
  }

  return (
    <form
      id="consignment-form"
      className="entry-panel"
      onSubmit={handleFormSubmit}
      autoComplete="off"
    >
      <nav className="entry-stepper" aria-label="Entry Form Steps">
        {entryFormSteps.map((step, index) => {
          const isActive = activeStep === index;
          const isComplete = activeStep > index;

          return (
            <button
              key={step.key}
              type="button"
              className={`entry-step${
                isActive
                  ? " is-active"
                  : isComplete
                    ? " is-complete"
                    : " is-upcoming"
              }`}
              onClick={() => handleStepSelect(index)}
              aria-current={isActive ? "step" : undefined}
            >
              <span className="entry-step-index">{index + 1}</span>
              <span className="entry-step-label">{step.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="entry-layout">
        {activeStep === 0 && (
          <>
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
                  onChange={(value) => {
                    onUpdateField("viewMode", value);

                    if (value === "IMS") {
                      onUpdateField("gstType", "");
                    }
                  }}
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
                  {/* Row 1 */}
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

                  {/* Row 2 */}
                  <div className="field-row">
                    <Field
                      label="Net Weight"
                      value={
                        Number(form.grossWeight || 0) > 0 &&
                        Number(form.tareWeight || 0) > 0
                          ? formatNetWeight(form.grossWeight, form.tareWeight)
                          : form.netWeight || ""
                      }
                      readOnly={
                        Number(form.grossWeight || 0) > 0 &&
                        Number(form.tareWeight || 0) > 0
                      }
                      onChange={(value) => onUpdateField("netWeight", value)}
                      {...decimalNumberProps}
                    />

                    <RadioGroup
                      label="Net Weight Unit"
                      name="weightUnit"
                      value={form.weightUnit || "MT"}
                      options={[
                        { label: "MT", value: "MT" },
                        { label: "KG", value: "KG" },
                      ]}
                      onChange={(value) => onUpdateField("weightUnit", value)}
                    />
                  </div>
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
                  onChange={(value) =>
                    onUpdateField("truckNo", value.toUpperCase())
                  }
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
                  onChange={(value) =>
                    onUpdateField("ownerPrimaryContact", value)
                  }
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
                  onChange={(value) =>
                    onUpdateField("driverPrimaryContact", value)
                  }
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
          </>
        )}

        {activeStep === 1 && (
          <fieldset className="form-section form-section-wide">
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
                readOnly
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
                readOnly
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
              )}
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
        )}

        {activeStep === 2 && (
          <fieldset className="form-section form-section-wide">
            <legend>Our Rate & Profit</legend>
            <div className="field-row">
              <Field
                label={isCostPerMt ? "Our Cost Per MT" : "Our Fixed Cost"}
                value={ourRateAmount}
                onChange={(value) =>
                  onUpdateField(
                    isCostPerMt ? "profitCostPerMT" : "profitFixedCost",
                    value,
                  )
                }
                {...decimalNumberProps}
              />

              <Field
                label="Our Chargeable Weight"
                value={form.profitChargeableWeight}
                onChange={(value) =>
                  onUpdateField("profitChargeableWeight", value)
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
            {/* Row 1 */}
            <div className="field-row">
              <Field
                label="Additional Charge"
                value={form.additionalCharges}
                onChange={(value) => onUpdateField("additionalCharges", value)}
                {...decimalNumberProps}
              />

              <Field
                label="Other Expense"
                value={form.otherExpenses}
                onChange={(value) => onUpdateField("otherExpenses", value)}
                {...decimalNumberProps}
              />
            </div>

            {/* Row 2 */}
            <div className="field-row">
              <Field
                label="Total Expense"
                value={Math.ceil(totalExpense)}
                readOnly
                onChange={(value) => onUpdateField("expenses", value)}
                {...decimalNumberProps}
              />

              <Field
                label={
                  form.viewMode === "GST"
                    ? "Total Freight Amount (incl. GST)"
                    : "Total Freight Amount"
                }
                value={Math.ceil(totalFreight)}
                readOnly
                onChange={(value) => onUpdateField("netFreight", value)}
                {...decimalNumberProps}
              />
            </div>

            {/* Row 3 */}
            <div className="field-row">
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
            <div className="field-row">
              <fieldset>
                <legend>Extra</legend>
                <div className="extra-field-stack">
                  <SelectField
                    label="Customer Payment Mode"
                    value={form.customerPaymentMode}
                    options={paymentModeOptions}
                    required
                    onChange={(value) =>
                      onUpdateField("customerPaymentMode", value)
                    }
                  />
                  <label className="field">
                    <span>Remarks / Notes</span>
                    <textarea
                      autoComplete="off"
                      value={form.remarks}
                      onChange={(event) =>
                        onUpdateField("remarks", event.target.value)
                      }
                    />
                  </label>
                </div>
              </fieldset>

              <fieldset>
                <legend>Addtional Files</legend>
                <AdditionalFilesField
                  files={form.additionalFiles}
                  onChange={(files) => onUpdateField("additionalFiles", files)}
                />
              </fieldset>
            </div>
          </fieldset>
        )}
      </div>

      <div className="entry-step-actions">
        <button
          type="button"
          className="btn secondary"
          disabled={isFirstStep}
          onClick={() => goToStep(activeStep - 1)}
        >
          Previous
        </button>
        {isLastStep ? (
          <button type="submit" className="btn primary">
            {editingId ? "Update Entry" : "Save Entry"}
          </button>
        ) : (
          <button
            type="button"
            className="btn primary"
            onClick={handleNextStep}
          >
            Continue
          </button>
        )}
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
  disabled = false,
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
              disabled={disabled}
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

function AdvanceEntriesField({
  entries,
  onChange,
  formBalance,
  readOnly = false,
}) {
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
              readOnly={readOnly}
              className={readOnly ? "readonly" : undefined}
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
                readOnly={readOnly}
                className={readOnly ? "readonly" : undefined}
                onChange={(event) =>
                  updateEntry(index, "refNo", event.target.value)
                }
              />
              {index === rows.length - 1 && (
                <button
                  type="button"
                  className="advance-add-btn"
                  onClick={addEntry}
                  disabled={readOnly}
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

function AdditionalFilesField({ files = [], onChange }) {
  const rows =
    Array.isArray(files) && files.length > 0
      ? files
      : [
          {
            id: "file-empty-1",
            file: null,
            name: "",
            fileName: "",
            uploaded: false,
          },
        ];

  function updateRow(index, nextRow) {
    onChange(rows.map((row, rowIndex) => (rowIndex === index ? nextRow : row)));
  }

  function removeRow(index) {
    const nextRows = rows.filter((_, rowIndex) => rowIndex !== index);
    onChange(
      nextRows.length > 0
        ? nextRows
        : [
            {
              id: "file-empty-1",
              file: null,
              name: "",
              fileName: "",
              uploaded: false,
            },
          ],
    );
  }

  function handleFileSelect(index, file) {
    if (!file) return;

    if (!isAllowedAdditionalFile(file)) {
      window.alert("Only PNG, PDF, and JPEG files are allowed.");
      return;
    }

    if (file.size > maxAdditionalFileSize) {
      window.alert("Each file must be 50 MB or smaller.");
      return;
    }

    const currentRow = rows[index] ?? {};
    if (currentRow.previewUrl) {
      window.URL.revokeObjectURL(currentRow.previewUrl);
    }

    updateRow(index, {
      ...currentRow,
      id: currentRow.id || `file-${Date.now()}`,
      file,
      name: file.name,
      fileName: currentRow.fileName || "",
      size: file.size,
      contentType: file.type,
      previewUrl: window.URL.createObjectURL(file),
      uploaded: false,
    });
  }

  function addRow() {
    onChange([
      ...rows,
      {
        id: `file-${Date.now()}`,
        file: null,
        name: "",
        fileName: "",
        uploaded: false,
      },
    ]);
  }

  function handleFileNameChange(index, fileName) {
    updateRow(index, { ...rows[index], fileName });
  }

  async function handlePreview(file) {
    try {
      await previewAdditionalFile(file);
    } catch (error) {
      window.alert(error?.message || "Unable to preview file");
    }
  }

  async function handleDelete(file, index) {
    const hasSelectedFile = Boolean(
      file.file || file.url || file.previewUrl || file.uploaded,
    );
    if (!hasSelectedFile) {
      removeRow(index);
      return;
    }

    const shouldDelete = window.confirm(
      `Delete ${file.name || file.fileName || "this file"}?`,
    );
    if (!shouldDelete) return;

    try {
      if (file.uploaded && file.id) {
        await deleteAdditionalFile(file.id);
      }
      if (file.previewUrl) {
        window.URL.revokeObjectURL(file.previewUrl);
      }
      removeRow(index);
    } catch (error) {
      window.alert(error?.message || "Unable to delete file");
    }
  }

  return (
    <div className="additional-file-list">
      {rows.map((file, index) => {
        const inputId = `additional-file-${file.id || index}`;
        const hasFile = Boolean(
          file.file || file.url || file.previewUrl || file.uploaded,
        );
        const canDelete = hasFile || rows.length > 1;

        return (
          <div key={file.id || index} className="additional-file-row">
            <label className="additional-file-name field">
              <span>File Name</span>
              <input
                type="text"
                value={file.fileName ?? ""}
                readOnly={Boolean(file.uploaded)}
                placeholder={file.name || "Original file name"}
                onChange={(event) =>
                  handleFileNameChange(index, event.target.value)
                }
              />
            </label>
            <label className="additional-file-select" htmlFor={inputId}>
              <span className="additional-file-label">Select File</span>
              <span className="additional-file-value">
                {file.name || "Choose file"}
              </span>
              <input
                id={inputId}
                type="file"
                accept={additionalFileAccept}
                onChange={(event) =>
                  handleFileSelect(index, event.target.files?.[0])
                }
              />
            </label>
            <button
              type="button"
              className="additional-file-icon-btn"
              onClick={() => handlePreview(file)}
              disabled={!hasFile}
              aria-label={`Preview ${file.name || "selected file"}`}
              title="Preview"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
            <button
              type="button"
              className="additional-file-delete-btn"
              onClick={() => handleDelete(file, index)}
              disabled={!canDelete}
              aria-label={`Delete ${file.name || "selected file"}`}
              title="Delete"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M6 6l1 15h10l1-15" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
              </svg>
            </button>
            {index === rows.length - 1 && (
              <button
                type="button"
                className="additional-file-add-btn"
                onClick={addRow}
                aria-label="Add another file"
                title="Add another file"
              >
                +
              </button>
            )}
          </div>
        );
      })}
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
