import { numericConsignmentFields } from '../constants/consignment.js';
import { toNumber } from './numbers.js';

export function buildConsignmentPayload(form) {
  return Object.fromEntries(
    Object.entries(form)
      .filter(([key]) => !['id', 'serialNo', 'balance', 'ledgerAmount', 'profit'].includes(key))
      .map(([key, value]) => [key, numericConsignmentFields.has(key) ? toNumber(value) : value]),
  );
}

export function getConsignmentCalculations(form) {
  const supplier = toNumber(form.supplierAmount);
  const advance = toNumber(form.advance);
  const expenses = toNumber(form.expenses);
  const customerRate = toNumber(form.customerRate);

  return {
    balance: supplier - advance,
    ledgerAmount: supplier,
    profit: customerRate - supplier - expenses,
  };
}

export function getUniqueValues(items, field) {
  return [...new Set(items.map((item) => item[field]).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}
