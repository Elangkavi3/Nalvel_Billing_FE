export const PAGE_SIZE = 10;

export const emptyConsignmentForm = {
  viewMode: 'GST',
  gstType: '18',
  gstNo: '',
  imsNo: '',
  serialNo: '',
  subSerialNo: '',
  ledgerDate: new Date().toISOString().slice(0, 10),
  loadingDate: new Date().toISOString().slice(0, 16),
  deliveryDateTime: '',
  customerName: '',
  billTo: '',
  truckNo: '',
  truckType: '32 ft SXL',
  ownerName: '',
  ownerPrimaryContact: '',
  ownerPrimaryWhatsappAvailable: false,
  ownerAlternateContact: '',
  ownerAlternateWhatsappAvailable: false,
  driverName: '',
  driverPrimaryContact: '',
  driverPrimaryWhatsappAvailable: false,
  driverAlternateContact: '',
  driverAlternateWhatsappAvailable: false,
  fromLocation: '',
  toLocation: '',
  weight: '',
  supplierAmount: '',
  advance: '',
  customerRate: '',
  additionalChargeType: '',
  additionalExpenseType: '',
  netFreight: '',
  lrNo: '',
  lrDate: '',
  invoiceNo: '',
  invoiceDate: '',
  paymentStatus: 'Pending',
  paymentMode: 'Bank Transfer',
  remarks: '',
};

export const truckTypeOptions = ['32 ft SXL', 'Mini', '17ft', '20ft', 'Trailer'];
export const paymentStatusOptions = ['Pending', 'Partial', 'Paid'];
export const paymentModeOptions = ['Bank Transfer', 'DD', 'Cheque', 'UPI', 'Cash'];
export const numericConsignmentFields = new Set(['weight', 'supplierAmount', 'advance', 'customerRate', 'netFreight']);
