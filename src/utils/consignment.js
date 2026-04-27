import { numericConsignmentFields } from '../constants/consignment.js';
import { toNumber } from './numbers.js';

export function buildConsignmentPayload(form) {
  const payload = Object.fromEntries(
    Object.entries(form)
      .filter(([key]) => !['id', 'viewMode'].includes(key))
      .map(([key, value]) => [key, numericConsignmentFields.has(key) ? toNumber(value) : value]),
  );

  const {
    ledgerDate,
    loadingDate,
    deliveryDateTime,
    lrDate,
    invoiceDate,
    ownerPrimaryWhatsappAvailable,
    ownerAlternateWhatsappAvailable,
    driverPrimaryWhatsappAvailable,
    driverAlternateWhatsappAvailable,
    ...rest
  } = payload;

  const normalizedNetWeight = rest.netWeight ?? rest.weight ?? null;

  return {
    ...rest,
    weight: normalizedNetWeight,
    ledgerDateTime: ledgerDate || null,
    loadingDateTime: loadingDate || null,
    deliveryDateTime: deliveryDateTime || null,
    lrDateTime: lrDate || null,
    invoiceDateTime: invoiceDate || null,
    ownerPrimaryWhatsapp: ownerPrimaryWhatsappAvailable,
    ownerAlternateWhatsapp: ownerAlternateWhatsappAvailable,
    driverPrimaryWhatsapp: driverPrimaryWhatsappAvailable,
    driverAlternateWhatsapp: driverAlternateWhatsappAvailable,
  };
}

export function getUniqueValues(items, field) {
  return [...new Set(items.map((item) => item[field]).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}
