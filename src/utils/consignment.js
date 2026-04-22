import { numericConsignmentFields } from '../constants/consignment.js';
import { toNumber } from './numbers.js';

export function buildConsignmentPayload(form) {
  const payload = Object.fromEntries(
    Object.entries(form)
      .filter(([key]) => !['id', 'serialNo', 'balance', 'ledgerAmount', 'profit', 'viewMode'].includes(key))
      .map(([key, value]) => [key, numericConsignmentFields.has(key) ? toNumber(value) : value]),
  );

  const {
    ledgerDate,
    loadingDate,
    lrDate,
    invoiceDate,
    ownerPrimaryWhatsappAvailable,
    ownerAlternateWhatsappAvailable,
    driverPrimaryWhatsappAvailable,
    driverAlternateWhatsappAvailable,
    additionalChargeType,
    additionalExpenseType,
    ...rest
  } = payload;

  return {
    ...rest,
    ledgerDateTime: ledgerDate || null,
    loadingDateTime: loadingDate || null,
    lrDateTime: lrDate || null,
    invoiceDateTime: invoiceDate || null,
    ownerPrimaryWhatsapp: ownerPrimaryWhatsappAvailable,
    ownerAlternateWhatsapp: ownerAlternateWhatsappAvailable,
    driverPrimaryWhatsapp: driverPrimaryWhatsappAvailable,
    driverAlternateWhatsapp: driverAlternateWhatsappAvailable,
    additionalCharges: additionalChargeType,
    expenses: additionalExpenseType,
  };
}

export function getUniqueValues(items, field) {
  return [...new Set(items.map((item) => item[field]).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}
