import { numericConsignmentFields } from '../constants/consignment.js';
import { toNumber } from './numbers.js';

const allowedPayloadFields = new Set([
  'serialNo',
  'customerName',
  'billTo',
  'gstNo',
  'imsNo',
  'gstType',
  'truckNo',
  'truckType',
  'ownerName',
  'ownerPrimaryContact',
  'ownerAlternateContact',
  'driverName',
  'dlNo',
  'driverPrimaryContact',
  'driverAlternateContact',
  'fromLocation',
  'toLocation',
  'netWeight',
  'tareWeight',
  'actualWeight',
  'grossWeight',
  'supplierRateType',
  'supplierAmount',
  'advance',
  'balance',
  'ledgerAmount',
  'customerRate',
  'additionalCharges',
  'netFreight',
  'expenses',
  'profit',
  'paymentStatus',
  'paymentMode',
  'remarks',
  'lrNo',
  'invoiceNo',
  'ledgerDate',
  'loadingDate',
  'deliveryDateTime',
  'lrDate',
  'invoiceDate',
]);

export function buildConsignmentPayload(form) {
  const payload = Object.fromEntries(
    Object.entries(form)
      .filter(([key]) => allowedPayloadFields.has(key))
      .map(([key, value]) => [key, numericConsignmentFields.has(key) ? toNumber(value) : value]),
  );

  const {
    ledgerDate,
    loadingDate,
    deliveryDateTime,
    lrDate,
    invoiceDate,
    gstNo,
    imsNo,
    ...rest
  } = payload;

  return {
    ...rest,
    gstNo: gstNo ?? '',
    imsNo: imsNo ?? '',
    ledgerDateTime: ledgerDate || null,
    loadingDateTime: loadingDate || null,
    deliveryDateTime: deliveryDateTime || null,
    lrDateTime: lrDate || null,
    invoiceDateTime: invoiceDate || null,
  };
}

export function getUniqueValues(items, field) {
  return [...new Set(items.map((item) => item[field]).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}
