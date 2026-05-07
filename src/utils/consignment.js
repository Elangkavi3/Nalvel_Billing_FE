import { numericConsignmentFields } from '../constants/consignment.js';
import { toNumber } from './numbers.js';

function normalizeRateType(value) {
  const normalized = String(value || '').toLowerCase();
  if (normalized === 'cost_per_mt' || normalized.includes('mt')) return 'cost_per_mt';
  return 'fixed_cost';
}

function rateTypeLabel(value) {
  return normalizeRateType(value) === 'cost_per_mt' ? 'Cost per MT' : 'Fixed Cost';
}

function billingTypeLabel(value) {
  return value === 'IMS' ? 'IMS' : 'GST Invoice';
}

function paymentTypeValue(value) {
  const normalized = String(value || '').toLowerCase().replaceAll(' ', '_');
  if (normalized === 'truck_owner' || normalized === 'owner_payment') return 'Truck_Owner';
  if (normalized === 'driver_payment') return 'Driver_Payment';
  return value ?? '';
}

function supplierPaymentModeValue(value) {
  const normalized = paymentTypeValue(value);
  if (normalized === 'Truck_Owner') return 'Owner Payment';
  if (normalized === 'Driver_Payment') return 'Driver Payment';
  return value ?? '';
}

function dateOrNull(value) {
  return normalizeDateOnly(value) || null;
}

function numberField(form, key) {
  return numericConsignmentFields.has(key) ? toNumber(form[key]) : form[key];
}

export function normalizeDateOnly(value) {
  if (!value) return '';
  const text = String(value);
  const isoDate = text.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoDate) return isoDate[1];

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return text;

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateOnly(value) {
  const date = normalizeDateOnly(value);
  if (!date) return '-';
  const [year, month, day] = date.split('-');
  if (!year || !month || !day) return date;
  return `${day}/${month}/${year}`;
}

export function calculateConsignmentValues(form = {}) {
  const supplierAmount = Number(form.supplierAmount || 0);
  const chargebleWeight = Number(form.chargebleWeight || 0);
  const haltingCharge = Number(form.haltingCharge || 0);
  const parkingCharge = Number(form.parkingCharge || 0);
  const commission = Number(form.commission || 0);
  const additionalCharges = Number(form.additionalCharges || 0);
  const totalAdvance = Array.isArray(form.advanceEntries)
    ? form.advanceEntries.reduce((sum, item) => sum + Number(item.amount || 0), 0)
    : Number(form.totalAdvance || 0);

  const payableAmount = supplierAmount * chargebleWeight + haltingCharge + parkingCharge;
  const netPaymentBalance = payableAmount - commission;
  const freightBookingCost = payableAmount;
  const totalExpense = freightBookingCost + additionalCharges;
  const gstPercentage = Number(form.gstType || 0);
  const netFreight = totalExpense + (totalExpense * gstPercentage) / 100;
  const profit = netFreight - payableAmount;

  return {
    ledgerAmount: payableAmount,
    netBalance: netPaymentBalance,
    customerRate: freightBookingCost,
    expenses: totalExpense,
    totalAdvance,
    balance: netPaymentBalance - totalAdvance,
    netFreight,
    profit,
  };
}

export function applyCalculatedConsignmentValues(form = {}) {
  return {
    ...form,
    ...calculateConsignmentValues(form),
  };
}

export function buildConsignmentPayload(form) {
  const supplierRateType = normalizeRateType(form.supplierRateType);
  const calculatedForm = applyCalculatedConsignmentValues(form);
  const supplierAmount = numberField(calculatedForm, 'supplierAmount');

  return {
    serialNo: calculatedForm.serialNo ?? '',
    billingType: billingTypeLabel(calculatedForm.viewMode),
    gstNo: calculatedForm.gstNo ?? '',
    imsNo: calculatedForm.imsNo ?? '',
    bookingCustomerName: calculatedForm.customerName ?? '',
    bookingDate: dateOrNull(calculatedForm.ledgerDate ?? calculatedForm.bookingDate),
    loadingDate: dateOrNull(calculatedForm.loadingDate),
    loadingLocation: calculatedForm.fromLocation ?? '',
    deliveryLocation: calculatedForm.toLocation ?? '',
    customerToBill: calculatedForm.billTo ?? '',
    deliveryDate: dateOrNull(calculatedForm.deliveryDateTime ?? calculatedForm.deliveryDate),
    grossWeight: numberField(calculatedForm, 'grossWeight'),
    tareWeight: numberField(calculatedForm, 'tareWeight'),
    netWeight: numberField(calculatedForm, 'netWeight'),
    materialDescription: calculatedForm.material ?? '',
    truckNo: calculatedForm.truckNo ?? '',
    truckType: calculatedForm.truckType ?? '',
    truckOwnerName: calculatedForm.ownerName ?? '',
    ownerPrimaryContact: calculatedForm.ownerPrimaryContact ?? '',
    ownerAlternateContact: calculatedForm.ownerAlternateContact ?? '',
    driverName: calculatedForm.driverName ?? '',
    dlNo: calculatedForm.dlNo ?? '',
    driverPrimaryContact: calculatedForm.driverPrimaryContact ?? '',
    driverAlternateContact: calculatedForm.driverAlternateContact ?? '',
    freightAmountType: rateTypeLabel(supplierRateType),
    fixedCost: supplierRateType === 'fixed_cost' ? supplierAmount : 0,
    costPerMT: supplierRateType === 'cost_per_mt' ? supplierAmount : 0,
    chargebleWeight: numberField(calculatedForm, 'chargebleWeight'),
    payableAmount: numberField(calculatedForm, 'ledgerAmount'),
    haltingCharge: numberField(calculatedForm, 'haltingCharge'),
    parkingCharge: numberField(calculatedForm, 'parkingCharge'),
    commission: numberField(calculatedForm, 'commission'),
    netpaymentBalance: numberField(calculatedForm, 'netBalance'),
    totalAdvance: numberField(calculatedForm, 'totalAdvance'),
    balance: numberField(calculatedForm, 'balance'),
    balancePaymentStatus: calculatedForm.paymentStatus ?? calculatedForm.balancePaymentStatus ?? '',
    supplierPaymentMode: supplierPaymentModeValue(calculatedForm.paymentType),
    truckpaymentMode: calculatedForm.truckpaymentMode ?? '',
    profitAmountType: calculatedForm.profitAmountType ?? '',
    gstType: calculatedForm.gstType ? toNumber(calculatedForm.gstType) : null,
    freightBookingCost: numberField(calculatedForm, 'customerRate'),
    additionalCharges: numberField(calculatedForm, 'additionalCharges'),
    totalExpenses: numberField(calculatedForm, 'expenses'),
    netFreight: numberField(calculatedForm, 'netFreight'),
    profit: numberField(calculatedForm, 'profit'),
    lrNo: calculatedForm.lrNo ?? '',
    lrDate: dateOrNull(calculatedForm.lrDate),
    customerInvoiceNo: calculatedForm.invoiceNo ?? '',
    customerInvoiceDate: dateOrNull(calculatedForm.invoiceDate),
    customerPaymentMode: calculatedForm.customerPaymentMode ?? '',
    remarks: calculatedForm.remarks ?? '',
  };
}

export function normalizeConsignment(item) {
  if (!item || typeof item !== 'object') return item;

  const supplierRateType = normalizeRateType(item.freightAmountType ?? item.supplierRateType);
  const supplierAmount = supplierRateType === 'cost_per_mt' ? item.costPerMT : item.fixedCost;
  const billingType = String(item.billingType || '');
  const normalizedBillingType = billingType.toLowerCase();
  const bookingDate = normalizeDateOnly(item.bookingDate ?? item.bookingDateTime ?? item.ledgerDateTime ?? item.ledgerDate);
  const loadingDate = normalizeDateOnly(item.loadingDate ?? item.loadingDateTime);
  const deliveryDate = normalizeDateOnly(item.deliveryDate ?? item.deliveryDateTime);
  const lrDate = normalizeDateOnly(item.lrDate ?? item.lrDateTime);
  const invoiceDate = normalizeDateOnly(
    item.customerInvoiceDate ?? item.customerInvoiceDateTime ?? item.invoiceDateTime ?? item.invoiceDate,
  );
  const paymentStatus = item.balancePaymentStatus ?? item.paymentStatus ?? '';
  const advanceEntriesSource = item.advancePayments ?? item.advanceEntries;
  const hasGstBilling = item.gstNo || normalizedBillingType.includes('gst');
  const hasImsBilling = item.imsNo || normalizedBillingType.includes('ims');
  const viewMode = !hasGstBilling && hasImsBilling ? 'IMS' : 'GST';

  return applyCalculatedConsignmentValues({
    ...item,
    viewMode,
    customerName: item.bookingCustomerName ?? item.customerName ?? '',
    billTo: item.customerToBill ?? item.billTo ?? '',
    ownerName: item.truckOwnerName ?? item.ownerName ?? '',
    fromLocation: item.loadingLocation ?? item.fromLocation ?? '',
    toLocation: item.deliveryLocation ?? item.toLocation ?? '',
    material: item.materialDescription ?? item.material ?? '',
    bookingDate,
    ledgerDate: bookingDate,
    ledgerDateTime: bookingDate,
    loadingDate,
    loadingDateTime: loadingDate,
    deliveryDate,
    deliveryDateTime: deliveryDate,
    supplierRateType,
    supplierAmount: supplierAmount ?? item.supplierAmount ?? '',
    ledgerAmount: item.payableAmount ?? item.ledgerAmount ?? '',
    parkingCharge: item.parkingCharge ?? '',
    customerRate: item.freightBookingCost ?? item.customerRate ?? '',
    expenses: item.totalExpenses ?? item.expenses ?? '',
    paymentMode: item.customerPaymentMode ?? item.paymentMode ?? '',
    truckpaymentMode: item.truckpaymentMode ?? '',
    customerPaymentMode: item.customerPaymentMode ?? '',
    paymentType: paymentTypeValue(item.supplierPaymentMode ?? item.paymentType),
    balancePaymentStatus: paymentStatus,
    paymentStatus,
    netBalance: item.netpaymentBalance ?? item.netBalance ?? '',
    commission: item.commission ?? '',
    totalAdvance: item.totalAdvance ?? '',
    lrNo: item.lrNo ?? item.lrNumber ?? '',
    lrDate,
    lrDateTime: lrDate,
    invoiceNo: item.customerInvoiceNo ?? item.invoiceNo ?? item.customerInvoiceNumber ?? '',
    customerInvoiceDate: invoiceDate,
    invoiceDate: invoiceDate,
    invoiceDateTime: invoiceDate,
    advanceEntries: Array.isArray(advanceEntriesSource) ? normalizeAdvanceEntries(advanceEntriesSource) : item.advanceEntries,
  });
}

export function normalizeConsignments(items) {
  const rows = Array.isArray(items) ? items : Array.isArray(items?.data) ? items.data : [];
  return rows.map(normalizeConsignment);
}

export function normalizeAdvanceEntries(entries) {
  const source = Array.isArray(entries) && entries.length > 0 ? entries : null;
  if (!source) return [{ id: 'new-1', amount: '', refNo: '' }];

  return source.map((entry, index) => ({
    id: entry.id ?? `new-${index + 1}`,
    amount: entry.amount ?? '',
    refNo: entry.refNo ?? '',
  }));
}

export function buildAdvancePaymentPayload(entry, index, form) {
  return {
    advanceLabel: `Advance ${index + 1}`,
    amount: toNumber(entry.amount),
    refNo: entry.refNo ?? '',
    paymentMode: form.truckpaymentMode ?? '',
    paymentType: supplierPaymentModeValue(form.paymentType),
  };
}

export function getUniqueValues(items, field) {
  return [...new Set(items.map((item) => item[field]).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}
