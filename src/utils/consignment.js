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
  return value === 'IMS' ? 'IMS No' : 'GST Invoice';
}

function paymentTypeValue(value) {
  const normalized = String(value || '').toLowerCase().replaceAll(' ', '_');
  if (normalized === 'truck_owner' || normalized === 'owner_payment') return 'Truck_Owner';
  if (normalized === 'driver_payment') return 'Driver_Payment';
  return value ?? '';
}

function paymentTypeLabel(value) {
  return paymentTypeValue(value) === 'Truck_Owner' ? 'Truck Owner' : paymentTypeValue(value) === 'Driver_Payment' ? 'Driver Payment' : value ?? '';
}

function dateOrNull(value) {
  return value || null;
}

function numberField(form, key) {
  return numericConsignmentFields.has(key) ? toNumber(form[key]) : form[key];
}

export function buildConsignmentPayload(form) {
  const supplierRateType = normalizeRateType(form.supplierRateType);
  const supplierAmount = numberField(form, 'supplierAmount');

  return {
    serialNo: form.serialNo ?? '',
    billingType: billingTypeLabel(form.viewMode),
    gstNo: form.gstNo ?? '',
    imsNo: form.imsNo ?? '',
    bookingCustomerName: form.customerName ?? '',
    bookingDateTime: dateOrNull(form.ledgerDate),
    loadingDateTime: dateOrNull(form.loadingDate),
    loadingLocation: form.fromLocation ?? '',
    deliveryLocation: form.toLocation ?? '',
    customerToBill: form.billTo ?? '',
    deliveryDateTime: dateOrNull(form.deliveryDateTime),
    grossWeight: numberField(form, 'grossWeight'),
    tareWeight: numberField(form, 'tareWeight'),
    netWeight: numberField(form, 'netWeight'),
    materialDescription: form.material ?? '',
    truckNo: form.truckNo ?? '',
    truckType: form.truckType ?? '',
    truckOwnerName: form.ownerName ?? '',
    ownerPrimaryContact: form.ownerPrimaryContact ?? '',
    ownerAlternateContact: form.ownerAlternateContact ?? '',
    driverName: form.driverName ?? '',
    dlNo: form.dlNo ?? '',
    driverPrimaryContact: form.driverPrimaryContact ?? '',
    driverAlternateContact: form.driverAlternateContact ?? '',
    freightAmountType: rateTypeLabel(supplierRateType),
    fixedCost: supplierRateType === 'fixed_cost' ? supplierAmount : 0,
    costPerMT: supplierRateType === 'cost_per_mt' ? supplierAmount : 0,
    chargebleWeight: numberField(form, 'chargebleWeight'),
    payableAmount: numberField(form, 'ledgerAmount'),
    haltingCharge: numberField(form, 'haltingCharge'),
    commission: numberField(form, 'commission'),
    netpaymentBalance: numberField(form, 'netBalance'),
    totalAdvance: numberField(form, 'totalAdvance'),
    balance: numberField(form, 'balance'),
    supplierPaymentMode: paymentTypeLabel(form.paymentType),
    truckpaymentMode: form.truckpaymentMode ?? '',
    gstType: form.gstType ? toNumber(form.gstType) : null,
    freightBookingCost: numberField(form, 'customerRate'),
    additionalCharges: numberField(form, 'additionalCharges'),
    totalExpenses: numberField(form, 'expenses'),
    netFreight: numberField(form, 'netFreight'),
    profit: numberField(form, 'profit'),
    lrNo: form.lrNo ?? '',
    lrDateTime: dateOrNull(form.lrDate),
    customerInvoiceNo: form.invoiceNo ?? '',
    customerInvoiceDateTime: dateOrNull(form.invoiceDate),
    customerPaymentMode: form.customerPaymentMode ?? '',
    remarks: form.remarks ?? '',
  };
}

export function normalizeConsignment(item) {
  if (!item || typeof item !== 'object') return item;

  const supplierRateType = normalizeRateType(item.freightAmountType ?? item.supplierRateType);
  const supplierAmount = supplierRateType === 'cost_per_mt' ? item.costPerMT : item.fixedCost;
  const billingType = String(item.billingType || '');

  return {
    ...item,
    viewMode: item.gstNo || billingType.toLowerCase().includes('gst') ? 'GST' : 'IMS',
    customerName: item.bookingCustomerName ?? item.customerName ?? '',
    billTo: item.customerToBill ?? item.billTo ?? '',
    ownerName: item.truckOwnerName ?? item.ownerName ?? '',
    fromLocation: item.loadingLocation ?? item.fromLocation ?? '',
    toLocation: item.deliveryLocation ?? item.toLocation ?? '',
    material: item.materialDescription ?? item.material ?? '',
    ledgerDateTime: item.bookingDateTime ?? item.ledgerDateTime ?? '',
    supplierRateType,
    supplierAmount: supplierAmount ?? item.supplierAmount ?? '',
    ledgerAmount: item.payableAmount ?? item.ledgerAmount ?? '',
    customerRate: item.freightBookingCost ?? item.customerRate ?? '',
    expenses: item.totalExpenses ?? item.expenses ?? '',
    paymentMode: item.customerPaymentMode ?? item.paymentMode ?? '',
    truckpaymentMode: item.truckpaymentMode ?? '',
    customerPaymentMode: item.customerPaymentMode ?? '',
    paymentType: paymentTypeValue(item.supplierPaymentMode ?? item.paymentType),
    paymentStatus: item.paymentStatus ?? '',
    netBalance: item.netpaymentBalance ?? item.netBalance ?? '',
    commission: item.commission ?? '',
    totalAdvance: item.totalAdvance ?? '',
    invoiceNo: item.customerInvoiceNo ?? item.invoiceNo ?? '',
    invoiceDateTime: item.customerInvoiceDateTime ?? item.invoiceDateTime ?? '',
  };
}

export function normalizeConsignments(items) {
  return Array.isArray(items) ? items.map(normalizeConsignment) : [];
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
    paymentType: paymentTypeLabel(form.paymentType),
  };
}

export function getUniqueValues(items, field) {
  return [...new Set(items.map((item) => item[field]).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}
