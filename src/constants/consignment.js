export const PAGE_SIZE = 10;

export const emptyConsignmentForm = {
  serialNo: '',
  ledgerDate: new Date().toISOString().slice(0, 10),
  loadingDate: new Date().toISOString().slice(0, 10),
  customerName: '',
  billTo: '',
  truckNo: '',
  truckType: '32 ft SXL',
  ownerName: '',
  ownerContact: '',
  driverName: '',
  driverContact: '',
  fromLocation: '',
  toLocation: '',
  weight: '',
  supplierAmount: '',
  advance: '',
  customerRate: '',
  paymentStatus: 'Pending',
  expenses: '',
  paymentMode: 'Bank Transfer',
  remarks: '',
};

export const truckTypeOptions = ['32 ft SXL', 'Mini', '17ft', '20ft', 'Trailer'];
export const paymentStatusOptions = ['Pending', 'Partial', 'Paid'];
export const paymentModeOptions = ['Bank Transfer', 'DD', 'Cheque', 'UPI', 'Cash'];
export const numericConsignmentFields = new Set(['weight', 'supplierAmount', 'advance', 'customerRate', 'expenses']);
