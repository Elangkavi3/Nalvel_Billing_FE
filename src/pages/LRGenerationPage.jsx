import { useMemo, useState } from 'react';
import { lrEndpoints } from '../services/endpoints.js';
import { deleteLR, getAllLR, request } from '../services/lrApi.js';
import { toNumber } from '../utils/numbers.js';

const TERMS_APPLICABILITY =
  "The provisions set out and referred to in this LR shall apply to all multi-modal transportation being performed by NALVEL LOGISTICS SERVICES. It also applies, if the transport as described on the face of the LR is contrary to the original intentions of the party, performed by one mode of transport only.";
const TERMS_DEFINITIONS =
  "Definitions: (a) Delivery - means tender of consignment to the parties or intimation about consignment. (b) Parties - means and includes consignor, consignee, other transport contractors or their authorised representatives.";
const TERMS_LEFT = [
  "NALVEL LOGISTICS SERVICES is entitled to use any modes and routes for transportation.",
  "The LR is a contract between NALVEL LOGISTICS SERVICES and parties.",
  "The LR note is issued strictly on the basis of declaration given by the parties. NALVEL LOGISTICS SERVICES shall not be responsible for any wrongful declaration.",
  "The parties are alone responsible for all payment, if any, levied by the Government or any statutory body.",
  "The parties hereby declare that the consignment covered under the LR does not include any contraband hazardous prohibited articles.",
  "LIEN: NALVEL LOGISTICS SERVICES shall have a right of central lien over all the consignments of the parties towards any dues payable to NALVEL LOGISTICS SERVICES.",
  "The party shall pay the freight and other charges immediately against delivery or as per agreed terms. In case of non-payment of bill amount within stipulated time, parties shall be liable for payment of interest at the rate of 24% per Annum. Bill will be raised on delivery even if POD is not submitted. All payments are by DD's or by bank transfer only and no cash payment is allowed.",
  "The parties shall not be entitled to deduct/adjust/set off any amount due to NALVEL LOGISTICS SERVICES, on account of any claims.",
  "In the event of any claims, subject to any exceptions available under law. No consequential loss can be claimed. However if the loss is made good by insurance company, NALVEL LOGISTICS SERVICES will not be liable for any claim.",
  "No claim shall be entertained by NALVEL LOGISTICS SERVICES unless all the dues payable to NALVEL LOGISTICS SERVICES are cleared by the parties including the statutory payment made by or on behalf of the parties is reimbursed.",
];
const TERMS_RIGHT = [
  "No claim shall be entertained by NALVEL LOGISTICS SERVICES for any loss or shortage, damage, non-delivery, breakage, leakage, pilferage etc. for the consignments unless a written claim is lodged with evidences within 3 days from the date of LR.",
  "If the parties do not take delivery of the consignment due to any reason whatsoever, NALVEL LOGISTICS SERVICES shall raise bill to the parties towards the transportation and other charges in terms of contract and the parties shall be liable to pay all the dues payable to NALVEL LOGISTICS SERVICES.",
  "If the consignment is not accepted by the parties when tendered for delivery, for any reason, NALVEL LOGISTICS SERVICES shall be entitled to send the consignments to unclaimed goods department to proceed with sale of consignment to release all dues by issuing prescribed notices.",
  "In case party fails to take delivery of the shipment within 48 hrs from the date of tendering, a warehouse charge of 0.1% of the invoice value will be charged or at such other rates as may be fixed by NALVEL LOGISTICS SERVICES from time to time.",
  "The terms and conditions stipulated in this LR are in addition to the special contract if any, between NALVEL LOGISTICS SERVICES and parties.",
  "No loading and unloading mamools, tea expenses or any other form of mamools/charges, parking charges, handling charges, AttiCooli etc. charges will not be paid by NALVEL LOGISTICS SERVICES or by its assigned truckers or by its drivers. Freight charges agreed only for transporting cargos from once place to destination. All other charges/Mamools are exclusive of freight rate and it has to be paid by parties.",
  "In case the truck is not loaded within 12 hrs and not unloaded at destination within 24 hrs from the time of arrival of truck, halting charges will be charged/billed by NALVEL LOGISTICS SERVICES. Halting charges range between Rs.1500/- to Rs.5000/- per day based on type of truck.",
  "All demands and claims arising from the LR shall be paid at registered office situated at Chennai. Any dispute, difference and claims arising out of this LR - courts at Chennai alone shall have exclusive jurisdiction to adjudicate all claims.",
  "Any dispute or differences arising from the LR shall be referred to an arbitrator. NALVEL LOGISTICS SERVICES shall be entitled to nominate an arbitrator to adjudicate any dispute, differences or claims. The venue of arbitration shall be at Chennai only.",
];
const LR_COPY_LABELS = ['CONSIGNOR COPY', 'CONSIGNEE COPY', 'DRIVER COPY', 'BOOK COPY'];

const emptyLRForm = {
  lrRecordId: '',
  consignmentId: '',
  sourceSerialNo: '',
  lrNo: '',
  lrDate: '',
  vehicleNo: '',
  consignorName: '',
  consignorAddress: '',
  consignorGstin: '',
  from: '',
  consigneeName: '',
  consigneeAddress: '',
  consigneeGstin: '',
  to: '',
  contentsChecked: 'CONTENTS NOT CHECKED',
  insuranceNote: 'Insurance at Owners Risk',
  noOfPackages: '',
  description: '',
  actualWeight: '',
  chargedWeight: '',
  invoiceValue: '',
  freight: '',
  surcharge: '',
  hamali: '',
  escort: '',
  bocdd: '',
  stCharges: '',
  total: '',
  insuranceCompany: '',
  policyNo: '',
  policyDate: '',
  insuranceAmount: '',
  risk: '',
  recipientEmail: '',
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function lrRecordToForm(record, currentForm = {}) {
  const consignment = record?.consignment || {};
  return {
    ...emptyLRForm,
    ...currentForm,
    lrRecordId: record?.id ?? '',
    consignmentId: record?.consignmentId ?? consignment.id ?? currentForm.consignmentId ?? '',
    sourceSerialNo: record?.savedDataSNo ?? currentForm.sourceSerialNo ?? '',
    lrNo: record?.cnNo ?? '',
    lrDate: record?.date ?? todayKey(),
    vehicleNo: record?.vehicleNo ?? '',
    consignorName: record?.consignorName ?? '',
    consignorAddress: record?.consignorAddress ?? '',
    consignorGstin: record?.consignorGstin ?? '',
    from: record?.fromLocation ?? currentForm.from ?? '',
    consigneeName: record?.consigneeName ?? '',
    consigneeAddress: record?.consigneeAddress ?? '',
    consigneeGstin: record?.consigneeGstin ?? '',
    to: record?.toLocation ?? currentForm.to ?? '',
    insuranceNote: String(record?.customerInsured || '').toLowerCase() === 'yes' ? 'Insurance Covered by Customer' : 'Insurance at Owners Risk',
    insuranceCompany: record?.insuranceCompany ?? '',
    policyNo: record?.policyNo ?? '',
    policyDate: record?.policyDate ?? '',
    insuranceAmount: record?.insuranceAmount ?? '',
    risk: record?.riskType ?? '',
    invoiceValue: record?.declaredValue ?? '',
    noOfPackages: record?.noOfPkgs ?? '',
    description: record?.description ?? '',
    actualWeight: record?.actualWt ?? '',
    chargedWeight: record?.chargedWt ?? '',
    freight: record?.freightRs ?? '',
    surcharge: record?.surchargeRs ?? '',
    hamali: record?.hamahRs ?? '',
    escort: record?.escortRs ?? '',
    bocdd: record?.bodDdRs ?? '',
    stCharges: record?.stChargesRs ?? '',
    total: record?.total ?? '',
  };
}

function composeLRText(form) {
  return [
    `NALVEL LOGISTICS SERVICES - LR ${form.lrNo || '-'}`,
    `Date: ${form.lrDate || '-'}`,
    `Vehicle: ${form.vehicleNo || '-'}`,
    `From: ${form.from || '-'}`,
    `To: ${form.to || '-'}`,
    `Consignor: ${form.consignorName || '-'}`,
    `Consignee: ${form.consigneeName || '-'}`,
    `Packages: ${form.noOfPackages || '-'}`,
    `Description: ${form.description || '-'}`,
    `Actual Weight: ${form.actualWeight || '-'}`,
    `Charged Weight: ${form.chargedWeight || '-'}`,
    `Total: ${form.total || '-'}`,
    '',
    'TERMS AND CONDITIONS:',
    TERMS_APPLICABILITY,
    TERMS_DEFINITIONS,
    '',
    ...TERMS_LEFT.map((line, index) => `${index + 1}. ${line}`),
    ...TERMS_RIGHT.map((line, index) => `${index + 11}. ${line}`),
  ].join('\n');
}

function resolveRecordConsignmentId(record) {
  const nestedId = record?.consignment?.id;
  const directId = record?.consignmentId;
  const value = Number(directId ?? nestedId ?? 0);
  return Number.isFinite(value) ? value : 0;
}

async function fetchAllLrRecords() {
  const data = await getAllLR();
  return Array.isArray(data) ? data : [];
}

async function fetchLrByConsignmentId(consignmentId) {
  if (!consignmentId) return null;
  const targetId = Number(consignmentId);
  if (!targetId) return null;
  const lrRecords = await fetchAllLrRecords();
  return lrRecords.find((record) => resolveRecordConsignmentId(record) === targetId) || null;
}

async function fetchLrById(id) {
  if (!id) return null;
  const numericId = Number(id);
  const lrRecords = await fetchAllLrRecords();
  return lrRecords.find((record) => Number(record?.id) === numericId) || null;
}

async function fetchLrPrefillBySavedDataSNo(savedDataSNo) {
  if (!savedDataSNo) return null;
  return request(lrEndpoints.readPrefillBySavedDataSNo(savedDataSNo));
}

async function deleteLrById(id) {
  if (!id) return null;
  return deleteLR(id);
}

function firstLrRecord(value) {
  if (Array.isArray(value)) return value[0] || null;
  if (Array.isArray(value?.data)) return value.data[0] || null;
  return value || null;
}

async function saveLRToBackend(form) {
  async function resolveExistingLrRecordId() {
    const consignmentId = Number(form.consignmentId);
    if (consignmentId) {
      try {
        const byConsignment = await fetchLrByConsignmentId(consignmentId);
        if (byConsignment?.id) return byConsignment.id;
      } catch {
        // fallback to allData below
      }
    }

    try {
      const lrRecords = await fetchAllLrRecords();
      const serialNo = String(form.sourceSerialNo || '').trim().toLowerCase();
      const cnNo = String(form.lrNo || '').trim().toLowerCase();
      const matched = lrRecords.find((record) => {
        const recordConsignmentId = resolveRecordConsignmentId(record);
        const recordSerial = String(record?.savedDataSNo || '').trim().toLowerCase();
        const recordCno = String(record?.cnNo || '').trim().toLowerCase();
        return (consignmentId && recordConsignmentId === consignmentId)
          || (serialNo && recordSerial === serialNo)
          || (cnNo && recordCno === cnNo);
      });
      return matched?.id ?? '';
    } catch {
      return '';
    }
  }

  const payload = {
    consignmentId: Number(form.consignmentId),
    savedDataSNo: form.sourceSerialNo || '',
    cnNo: form.lrNo || '',
    date: form.lrDate || null,
    vehicleNo: form.vehicleNo || '',
    fromLocation: form.from || '',
    toLocation: form.to || '',
    consignorName: form.consignorName || '',
    consignorGstin: form.consignorGstin || '',
    consignorAddress: form.consignorAddress || '',
    consigneeName: form.consigneeName || '',
    consigneeGstin: form.consigneeGstin || '',
    consigneeAddress: form.consigneeAddress || '',
    customerInsured: String(form.insuranceNote || '').toLowerCase().includes('covered') ? 'Yes' : 'No',
    insuranceCompany: form.insuranceCompany || '',
    policyNo: form.policyNo || '',
    policyDate: form.policyDate || null,
    insuranceAmount: toNumber(form.insuranceAmount),
    riskType: form.risk || '',
    declaredValue: toNumber(form.invoiceValue),
    noOfPkgs: Math.trunc(toNumber(form.noOfPackages)),
    description: form.description || '',
    actualWt: toNumber(form.actualWeight),
    chargedWt: toNumber(form.chargedWeight),
    freightRatePer: 0,
    freightRs: toNumber(form.freight),
    surchargeRatePer: 0,
    surchargeRs: toNumber(form.surcharge),
    hamahRatePer: 0,
    hamahRs: toNumber(form.hamali),
    escortRatePer: 0,
    escortRs: toNumber(form.escort),
    bodDdRatePer: 0,
    bodDdRs: toNumber(form.bocdd),
    stChargesRatePer: 0,
    stChargesRs: toNumber(form.stCharges),
    total: toNumber(form.total),
  };

  let targetLrRecordId = form.lrRecordId;
  if (!targetLrRecordId) {
    targetLrRecordId = await resolveExistingLrRecordId();
  }

  const isUpdate = Boolean(targetLrRecordId);
  const url = isUpdate ? lrEndpoints.updateById(targetLrRecordId) : lrEndpoints.create();
  const method = isUpdate ? 'PUT' : 'POST';

  const result = await request(url, {
    method,
    body: JSON.stringify(payload),
  });

  let resolvedId = targetLrRecordId;
  if (!resolvedId && payload.consignmentId) {
    const byConsignment = await fetchLrByConsignmentId(payload.consignmentId);
    resolvedId = byConsignment?.id || '';
  }

  const latest = resolvedId ? await fetchLrById(resolvedId) : null;
  return { result, lrRecordId: resolvedId, latest };
}

export function LRGenerationPage({ onBack, onSaved }) {
  const [form, setForm] = useState(() => ({ ...emptyLRForm, lrDate: todayKey() }));
  const [lookupMessage, setLookupMessage] = useState('');
  const [savePopup, setSavePopup] = useState('');
  const isCustomerInsured = String(form.insuranceNote || '').toLowerCase().includes('covered');

  const lrText = useMemo(() => composeLRText(form), [form]);
  const mailHref = `mailto:${encodeURIComponent(form.recipientEmail)}?subject=${encodeURIComponent(`LR ${form.lrNo || ''}`)}&body=${encodeURIComponent(lrText)}`;

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

async function loadFromSerial() {
    const serialNo = String(form.sourceSerialNo || '').trim();
    if (!serialNo) {
      setLookupMessage('Enter Saved Data S.No');
      return;
    }

    try {
      const prefill = await fetchLrPrefillBySavedDataSNo(serialNo);
      const consignmentId = Number(prefill?.consignmentId || 0);

      if (consignmentId) {
        try {
          const record = await fetchLrByConsignmentId(consignmentId);
          if (record?.id) {
            setForm((current) => lrRecordToForm(record, { ...current, sourceSerialNo: prefill.savedDataSNo || serialNo, consignmentId }));
            setLookupMessage(`Loaded existing LR from backend for S.No ${prefill.savedDataSNo || serialNo}`);
            return;
          }
        } catch {
          // No existing LR found for this consignment; fallback to prefill DTO.
        }
      }

      setForm((current) => ({
        ...current,
        consignmentId: prefill?.consignmentId ?? '',
        sourceSerialNo: prefill?.savedDataSNo ?? serialNo,
        lrNo: prefill?.cnNo ?? current.lrNo ?? '',
        lrDate: prefill?.date ?? current.lrDate ?? todayKey(),
        vehicleNo: prefill?.vehicleNo ?? current.vehicleNo ?? '',
        consignorName: prefill?.consignorName ?? current.consignorName ?? '',
        consignorAddress: prefill?.consignorAddress ?? current.consignorAddress ?? '',
        from: current.from || prefill?.fromLocation || prefill?.consignorAddress || '',
        consignorGstin: prefill?.consignorGstin ?? current.consignorGstin ?? '',
        consigneeName: prefill?.consigneeName ?? current.consigneeName ?? '',
        consigneeAddress: prefill?.consigneeAddress ?? current.consigneeAddress ?? '',
        to: current.to || prefill?.toLocation || prefill?.consigneeAddress || '',
        consigneeGstin: prefill?.consigneeGstin ?? current.consigneeGstin ?? '',
      }));
      setLookupMessage(`No LR found yet. Loaded consignment prefill from backend for S.No ${prefill?.savedDataSNo || serialNo}`);
    } catch {
      setLookupMessage(`No backend data found for S.No ${serialNo}`);
    }
  }

  async function loadSavedLrFromTable() {
    const serialNo = String(form.sourceSerialNo || '').trim();
    if (!serialNo) {
      setLookupMessage('Enter Saved Data S.No');
      return;
    }

    try {
      const normalizedKey = serialNo.toLowerCase();
      const lrRecords = await fetchAllLrRecords();
      const matchedRecord = lrRecords.find((record) => {
        const recordSerial = String(record?.savedDataSNo || '').trim().toLowerCase();
        const recordCno = String(record?.cnNo || '').trim().toLowerCase();
        return recordSerial === normalizedKey || recordCno === normalizedKey;
      });

      if (!matchedRecord?.id) {
        setLookupMessage(`No saved LR found in LR table for ${serialNo}`);
        return;
      }

      setForm((current) => lrRecordToForm(matchedRecord, { ...current, sourceSerialNo: matchedRecord?.savedDataSNo || serialNo }));
      setLookupMessage(`Loaded saved LR #${matchedRecord.id} from LR table`);
    } catch (error) {
      setLookupMessage(error?.message || 'Unable to load saved LR from LR table');
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLookupMessage('');
    setSavePopup('');
    if (!form.consignmentId) {
      setLookupMessage('Please load a saved entry using S.No before Save & Generate CN');
      return;
    }

    try {
      const saved = await saveLRToBackend(form);
      if (saved?.lrRecordId) {
        setForm((current) => ({
          ...current,
          ...lrRecordToForm(saved.latest || {}, current),
          lrRecordId: saved.lrRecordId,
        }));
      }
      onSaved?.(`LR ${form.lrNo || form.sourceSerialNo || ''} saved to backend successfully`);
      setLookupMessage('Saved to backend successfully. Opening print...');
      setTimeout(() => {
        window.print();
        setForm({ ...emptyLRForm, lrDate: todayKey() });
        setSavePopup('LR data saved');
      }, 150);
    } catch (error) {
      setLookupMessage(error?.message || 'Unable to save LR in backend');
    }
  }

  async function handleDeleteLr() {
    let targetLrRecordId = form.lrRecordId;

    if (!targetLrRecordId && form.consignmentId) {
      try {
        targetLrRecordId = firstLrRecord(await fetchLrByConsignmentId(form.consignmentId))?.id || '';
      } catch {
        targetLrRecordId = '';
      }
    }

    if (!targetLrRecordId) {
      setLookupMessage('No existing LR record found to delete');
      return;
    }
    const confirmed = window.confirm(`Delete LR record #${targetLrRecordId}?`);
    if (!confirmed) return;
    try {
      await deleteLrById(targetLrRecordId);
      setLookupMessage(`Deleted LR record #${targetLrRecordId}`);
      setForm({ ...emptyLRForm, lrDate: todayKey() });
    } catch (error) {
      setLookupMessage(error?.message || 'Unable to delete LR record');
    }
  }

  return (
    <section className="lr-page">
      <div className="lr-workspace">
        <form className="lr-form-panel lr-ui-page lr-edit-form" onSubmit={handleSubmit}>
          <div className="lr-lookup-strip">
            <div className="lr-lookup-field">
              <div className="cell-label">Saved Data S.No</div>
              <input className="field-input" value={form.sourceSerialNo} onChange={(event) => updateField('sourceSerialNo', event.target.value)} />
            </div>
            <button type="button" className="btn btn-secondary" onClick={loadFromSerial}>Fill</button>
            <button type="button" className="btn btn-secondary" onClick={loadSavedLrFromTable}>Load Saved LR</button>
            {lookupMessage && <div className="lr-lookup-message">{lookupMessage}</div>}
          </div>

          <div className="lr-ui-header">
            <div className="logo-box">
              <img
            className="brand-logo"
            src="Logo.svg"
            alt="Nalvel Logistics Logo"
            style={{ height: '60px', width: 'auto', objectFit: 'contain', display: 'block' }}
          />
            </div>
            <div className="company-info">
              <h1>NALVEL LOGISTICS SERVICES</h1>
              <p>New No.12, Old No.26, Nallappa Street, Nehru Nagar, Chromepet, Chennai - 600 044</p>
              <p>Phone: 044-45830699 | nalvellogisticsservices@gmail.com | GSTIN: 33ARXPK1573A2ZT</p>
            </div>
            <div className="badge-box">
              <p>{form.contentsChecked || 'CONTENTS NOT CHECKED'}</p>
              <p>{form.insuranceNote || 'Insurance at Owners Risk'}</p>
              <div className="stamp">CONSIGNOR COPY</div>
            </div>
          </div>

          <div className="form-body">
            <div className="row">
              <div className="cell cell-cn">
                <div className="cell-label">CN No.</div>
                <div className="cn-badge">{form.lrNo || '-'}</div>
              </div>
              <div className="cell cell-date">
                <div className="cell-label">Date</div>
                <input className="field-input" type="date" value={form.lrDate} onChange={(event) => updateField('lrDate', event.target.value)} />
              </div>
              <div className="cell cell-vehicle">
                <div className="cell-label">Vehicle No.</div>
                <input className="field-input" value={form.vehicleNo} onChange={(event) => updateField('vehicleNo', event.target.value)} />
              </div>
              <div className="cell">
                <div className="cell-label">From</div>
                <input className="field-input" value={form.from} onChange={(event) => updateField('from', event.target.value)} />
              </div>
              <div className="cell">
                <div className="cell-label">To</div>
                <input className="field-input" value={form.to} onChange={(event) => updateField('to', event.target.value)} />
              </div>
            </div>

            <div className="row">
              <div className="cell">
                <div className="section-title">CONSIGNOR (Sender)</div>
                <div className="two-col mt6">
                  <div><div className="cell-label">Name</div><input className="field-input" value={form.consignorName} onChange={(e) => updateField('consignorName', e.target.value)} /></div>
                  <div><div className="cell-label">GSTIN</div><input className="field-input" value={form.consignorGstin} onChange={(e) => updateField('consignorGstin', e.target.value)} /></div>
                </div>
                <div className="mt6"><div className="cell-label">Address</div><textarea className="field-input no-resize" rows={2} value={form.consignorAddress} onChange={(e) => updateField('consignorAddress', e.target.value)} /></div>
              </div>
              <div className="cell">
                <div className="section-title">CONSIGNEE (Receiver)</div>
                <div className="two-col mt6">
                  <div><div className="cell-label">Name</div><input className="field-input" value={form.consigneeName} onChange={(e) => updateField('consigneeName', e.target.value)} /></div>
                  <div><div className="cell-label">GSTIN</div><input className="field-input" value={form.consigneeGstin} onChange={(e) => updateField('consigneeGstin', e.target.value)} /></div>
                </div>
                <div className="mt6"><div className="cell-label">Address</div><textarea className="field-input no-resize" rows={2} value={form.consigneeAddress} onChange={(e) => updateField('consigneeAddress', e.target.value)} /></div>
              </div>
            </div>

            <div className={`row insurance-print-row${isCustomerInsured ? '' : ' insurance-print-row-hidden'}`}>
              <div className="cell cell-flex2 insurance-full-row">
                <div className="section-title">INSURANCE DETAILS</div>
                <div className="mt6">
                  <div className="cell-label">Has the customer insured this consignment?</div>
                  <div className="radio-group">
                    <label><input type="radio" name="insured" checked={isCustomerInsured} onChange={() => updateField('insuranceNote', 'Insurance Covered by Customer')} /> Yes </label>
                    <label>
                      <input
                        type="radio"
                        name="insured"
                        checked={!isCustomerInsured}
                        onChange={() =>
                          setForm((current) => ({
                            ...current,
                            insuranceNote: 'Insurance at Owners Risk',
                            insuranceCompany: '',
                            policyNo: '',
                            policyDate: '',
                            insuranceAmount: '',
                            risk: '',
                          }))
                        }
                      />{' '}
                      No 
                    </label>
                  </div>
                </div>
                {isCustomerInsured && (
                  <>
                    <div className="three-col mt6">
                      <div><div className="cell-label">Company</div><input className="field-input" value={form.insuranceCompany} onChange={(e) => updateField('insuranceCompany', e.target.value)} /></div>
                      <div><div className="cell-label">Policy No.</div><input className="field-input" value={form.policyNo} onChange={(e) => updateField('policyNo', e.target.value)} /></div>
                      <div><div className="cell-label">Policy Date</div><input className="field-input" type="date" value={form.policyDate} onChange={(e) => updateField('policyDate', e.target.value)} /></div>
                    </div>
                    <div className="two-col mt6">
                      <div><div className="cell-label">Amount (Rs)</div><input className="field-input" value={form.insuranceAmount} onChange={(e) => updateField('insuranceAmount', e.target.value)} /></div>
                      <div><div className="cell-label">Risk Type</div><input className="field-input" value={form.risk} onChange={(e) => updateField('risk', e.target.value)} /></div>
                    </div>
                  </>
                )}
                {!isCustomerInsured && <div className="insurance-print-spacer" aria-hidden="true" />}
              </div>
            </div>

            <div className="row">
              <div className="cell cell-flex3 package-details-cell">
                <div className="section-title">PACKAGE DETAILS</div>
                <table className="pkg-table mt6">
                  <thead>
                    <tr>
                      <th className="pkg-col-packages">No. of Packages</th>
                      <th className="pkg-col-description">Description (Said to Contain)</th>
                      <th className="pkg-col-weight">Weight in Kgs</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td rowSpan="2" className="pkg-vertical-cell">
                        <input value={form.noOfPackages} onChange={(e) => updateField('noOfPackages', e.target.value)} />
                      </td>
                      <td rowSpan="2" className="pkg-description-cell">
                        <textarea
                          className="pkg-description-input"
                          rows={6}
                          value={form.description}
                          onChange={(e) => updateField('description', e.target.value)}
                        />
                      </td>
                      <td className="pkg-weight-cell">
                        <div className="pkg-weight-label">Actual</div>
                        <input value={form.actualWeight} onChange={(e) => updateField('actualWeight', e.target.value)} />
                      </td>
                    </tr>
                    <tr>
                      <td className="pkg-weight-cell">
                        <div className="pkg-weight-label">Charged</div>
                        <input value={form.chargedWeight} onChange={(e) => updateField('chargedWeight', e.target.value)} />
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="mt6 package-declared-value">
                  <div className="cell-label">Declared Value (Rs) - * As per the Bill Attached.</div>
                  <input className="field-input mt4" value={form.invoiceValue} onChange={(e) => updateField('invoiceValue', e.target.value)} />
                </div>
              </div>
              <div className="cell cell-flex12">
                <div className="section-title">FREIGHT CHARGES</div>
                <table className="charge-table mt6">
                  <thead><tr><th>Charge Type</th><th>Rate Per</th><th>Rs.</th></tr></thead>
                  <tbody>
                    <tr><td>Freight</td><td><input placeholder="-" /></td><td><input value={form.freight} onChange={(e) => updateField('freight', e.target.value)} /></td></tr>
                    <tr><td>Surcharge</td><td><input placeholder="-" /></td><td><input value={form.surcharge} onChange={(e) => updateField('surcharge', e.target.value)} /></td></tr>
                    <tr><td>Hamah</td><td><input placeholder="-" /></td><td><input value={form.hamali} onChange={(e) => updateField('hamali', e.target.value)} /></td></tr>
                    <tr><td>Escort</td><td><input placeholder="-" /></td><td><input value={form.escort} onChange={(e) => updateField('escort', e.target.value)} /></td></tr>
                    <tr><td>BOD / DD</td><td><input placeholder="-" /></td><td><input value={form.bocdd} onChange={(e) => updateField('bocdd', e.target.value)} /></td></tr>
                    <tr><td>St. Charges</td><td><input placeholder="-" /></td><td><input value={form.stCharges} onChange={(e) => updateField('stCharges', e.target.value)} /></td></tr>
                    <tr className="total-row"><td colSpan="2">TOTAL</td><td><input value={form.total} onChange={(e) => updateField('total', e.target.value)} /></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="print-signature-row" aria-hidden="true">
            <div className="print-signature-line">Booking Incharge</div>
          </div>
         
          <div className="btn-row">
            <button type="button" className="btn btn-secondary" onClick={onBack}>
              Back
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => window.print()}>
              Print / Save PDF
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleDeleteLr}>
              Delete LR
            </button>
            <a className={form.recipientEmail ? 'btn btn-secondary' : 'btn btn-secondary disabled'} href={form.recipientEmail ? mailHref : undefined}>
              Send Email
            </a>
            <button type="submit" className="btn btn-primary">Save & Generate CN</button>
          </div>

          <section className="lr-terms-print" aria-label="Terms and conditions">
            <h2>TERMS AND CONDITIONS</h2>
            <p>
              <b>APPLICABILITY:</b> {TERMS_APPLICABILITY}
              <br />
              <b>{TERMS_DEFINITIONS}</b>
            </p>
            <div className="lr-terms-print-grid">
              <div>
                {TERMS_LEFT.map((term, index) => (
                  <p key={`print-left-${index}`}>
                    <b>{index + 1}.</b> {term}
                  </p>
                ))}
              </div>
              <div>
                {TERMS_RIGHT.map((term, index) => (
                  <p key={`print-right-${index}`}>
                    <b>{index + 11}.</b> {term}
                  </p>
                ))}
              </div>
            </div>
            <div className="lr-terms-print-footer">
              All disputes subject to Chennai jurisdiction only. | This is a computer generated document.
            </div>
          </section>
        </form>

        <div className="lr-print-duplicates" aria-hidden="true">
          {LR_COPY_LABELS.map((copyLabel, index) => (
            <LRPrintDuplicate key={`lr-print-duplicate-${index}`} form={form} copyIndex={index} copyLabel={copyLabel} />
          ))}
        </div>

        <div className="lr-print-only">
          <LRPreview form={form} />
        </div>
      </div>

      {savePopup && (
        <section className="success-popup-backdrop" role="presentation" onClick={() => setSavePopup('')}>
          <div
            className="success-popup"
            role="alertdialog"
            aria-live="assertive"
            aria-label="LR saved"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="success-popup-icon" aria-hidden="true">
              <svg viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" />
                <path d="M18 33.5 27.5 43 46 24.5" />
              </svg>
            </div>
            <h2>Success</h2>
            <p>{savePopup}</p>
            <button type="button" className="btn primary" onClick={() => setSavePopup('')}>
              Continue
            </button>
          </div>
        </section>
      )}
    </section>
  );
}

function LRPrintDuplicate({ form, copyIndex, copyLabel }) {
  const isCustomerInsured = String(form.insuranceNote || '').toLowerCase().includes('covered');
  const insuredName = `insured-print-${copyIndex}`;

  return (
    <form className="lr-form-panel lr-ui-page lr-print-duplicate">
      <div className="lr-ui-header">
        <div className="logo-box">
          <img
            className="brand-logo"
            src="Logo.svg"
            alt="Nalvel Logistics Logo"
            style={{ height: '60px', width: 'auto', objectFit: 'contain', display: 'block' }}
          />
        </div>
        <div className="company-info">
          <h1>NALVEL LOGISTICS SERVICES</h1>
          <p>New No.12, Old No.26, Nallappa Street, Nehru Nagar, Chromepet, Chennai - 600 044</p>
          <p>Phone: 044-45830699 | nalvellogisticsservices@gmail.com | GSTIN: 33ARXPK1573A2ZT</p>
        </div>
        <div className="badge-box">
          <p>{form.contentsChecked || 'CONTENTS NOT CHECKED'}</p>
          <p>{form.insuranceNote || 'Insurance at Owners Risk'}</p>
          <div className="stamp">{copyLabel}</div>
        </div>
      </div>

      <div className="form-body">
        <div className="row">
          <div className="cell cell-cn">
            <div className="cell-label">CN No.</div>
            <div className="cn-badge">{form.lrNo || '-'}</div>
          </div>
          <div className="cell cell-date">
            <div className="cell-label">Date</div>
            <input className="field-input" type="date" value={form.lrDate} readOnly />
          </div>
          <div className="cell cell-vehicle">
            <div className="cell-label">Vehicle No.</div>
            <input className="field-input" value={form.vehicleNo} readOnly />
          </div>
          <div className="cell">
            <div className="cell-label">From</div>
            <input className="field-input" value={form.from} readOnly />
          </div>
          <div className="cell">
            <div className="cell-label">To</div>
            <input className="field-input" value={form.to} readOnly />
          </div>
        </div>

        <div className="row">
          <div className="cell">
            <div className="section-title">CONSIGNOR (Sender)</div>
            <div className="two-col mt6">
              <div><div className="cell-label">Name</div><input className="field-input" value={form.consignorName} readOnly /></div>
              <div><div className="cell-label">GSTIN</div><input className="field-input" value={form.consignorGstin} readOnly /></div>
            </div>
            <div className="mt6"><div className="cell-label">Address</div><textarea className="field-input no-resize" rows={2} value={form.consignorAddress} readOnly /></div>
          </div>
          <div className="cell">
            <div className="section-title">CONSIGNEE (Receiver)</div>
            <div className="two-col mt6">
              <div><div className="cell-label">Name</div><input className="field-input" value={form.consigneeName} readOnly /></div>
              <div><div className="cell-label">GSTIN</div><input className="field-input" value={form.consigneeGstin} readOnly /></div>
            </div>
            <div className="mt6"><div className="cell-label">Address</div><textarea className="field-input no-resize" rows={2} value={form.consigneeAddress} readOnly /></div>
          </div>
        </div>

        <div className={`row insurance-print-row${isCustomerInsured ? '' : ' insurance-print-row-hidden'}`}>
          <div className="cell cell-flex2 insurance-full-row">
            <div className="section-title">INSURANCE DETAILS</div>
            <div className="mt6">
              <div className="cell-label">Has the customer insured this consignment?</div>
              <div className="radio-group">
                <label><input type="radio" name={insuredName} checked={isCustomerInsured} readOnly /> Yes - Insured</label>
                <label>
                  <input type="radio" name={insuredName} checked={!isCustomerInsured} readOnly />{' '}
                  No - Not Insured
                </label>
              </div>
            </div>
            {isCustomerInsured && (
              <>
                <div className="three-col mt6">
                  <div><div className="cell-label">Company</div><input className="field-input" value={form.insuranceCompany} readOnly /></div>
                  <div><div className="cell-label">Policy No.</div><input className="field-input" value={form.policyNo} readOnly /></div>
                  <div><div className="cell-label">Policy Date</div><input className="field-input" type="date" value={form.policyDate} readOnly /></div>
                </div>
                <div className="two-col mt6">
                  <div><div className="cell-label">Amount (Rs)</div><input className="field-input" value={form.insuranceAmount} readOnly /></div>
                  <div><div className="cell-label">Risk Type</div><input className="field-input" value={form.risk} readOnly /></div>
                </div>
              </>
            )}
            {!isCustomerInsured && <div className="insurance-print-spacer" aria-hidden="true" />}
          </div>
        </div>

        <div className="row">
          <div className="cell cell-flex3 package-details-cell">
            <div className="section-title">PACKAGE DETAILS</div>
            <table className="pkg-table mt6">
              <thead>
                <tr>
                  <th className="pkg-col-packages">No. of Packages</th>
                  <th className="pkg-col-description">Description (Said to Contain)</th>
                  <th className="pkg-col-weight">Weight in Kgs</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td rowSpan="2" className="pkg-vertical-cell">
                    <input value={form.noOfPackages} readOnly />
                  </td>
                  <td rowSpan="2" className="pkg-description-cell">
                    <textarea
                      className="pkg-description-input"
                      rows={6}
                      value={form.description}
                      readOnly
                    />
                  </td>
                  <td className="pkg-weight-cell">
                    <div className="pkg-weight-label">Actual</div>
                    <input value={form.actualWeight} readOnly />
                  </td>
                </tr>
                <tr>
                  <td className="pkg-weight-cell">
                    <div className="pkg-weight-label">Charged</div>
                    <input value={form.chargedWeight} readOnly />
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="mt6 package-declared-value">
              <div className="cell-label">Declared Value (Rs) - * As per the Bill Attached.</div>
              <input className="field-input mt4" value={form.invoiceValue} readOnly />
            </div>
          </div>
          <div className="cell cell-flex12">
            <div className="section-title">FREIGHT CHARGES</div>
            <table className="charge-table mt6">
              <thead><tr><th>Charge Type</th><th>Rate Per</th><th>Rs.</th></tr></thead>
              <tbody>
                <tr><td>Freight</td><td><input placeholder="-" readOnly /></td><td><input value={form.freight} readOnly /></td></tr>
                <tr><td>Surcharge</td><td><input placeholder="-" readOnly /></td><td><input value={form.surcharge} readOnly /></td></tr>
                <tr><td>Hamah</td><td><input placeholder="-" readOnly /></td><td><input value={form.hamali} readOnly /></td></tr>
                <tr><td>Escort</td><td><input placeholder="-" readOnly /></td><td><input value={form.escort} readOnly /></td></tr>
                <tr><td>BOD / DD</td><td><input placeholder="-" readOnly /></td><td><input value={form.bocdd} readOnly /></td></tr>
                <tr><td>St. Charges</td><td><input placeholder="-" readOnly /></td><td><input value={form.stCharges} readOnly /></td></tr>
                <tr className="total-row"><td colSpan="2">TOTAL</td><td><input value={form.total} readOnly /></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="print-signature-row" aria-hidden="true">
        <div className="print-signature-line">Booking Incharge</div>
      </div>

      <section className="lr-terms-print" aria-label="Terms and conditions">
        <h2>TERMS AND CONDITIONS</h2>
        <p>
          <b>APPLICABILITY:</b> {TERMS_APPLICABILITY}
          <br />
          <b>{TERMS_DEFINITIONS}</b>
        </p>
        <div className="lr-terms-print-grid">
          <div>
            {TERMS_LEFT.map((term, index) => (
              <p key={`print-copy-${copyIndex}-left-${index}`}>
                <b>{index + 1}.</b> {term}
              </p>
            ))}
          </div>
          <div>
            {TERMS_RIGHT.map((term, index) => (
              <p key={`print-copy-${copyIndex}-right-${index}`}>
                <b>{index + 11}.</b> {term}
              </p>
            ))}
          </div>
        </div>
        <div className="lr-terms-print-footer">
          All disputes subject to Chennai jurisdiction only. | This is a computer generated document.
        </div>
      </section>
    </form>
  );
}

function LRField({ label, value, onChange, type = 'text' }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function LRText({ label, value, onChange, wide = false }) {
  return (
    <label className={wide ? 'field lr-field-wide' : 'field'}>
      <span>{label}</span>
      <textarea rows={3} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function LRPreview({ form }) {
  const isCustomerInsured = String(form.insuranceNote || '').toLowerCase().includes('covered');

  return (
    <article className="page-wrapper lr-template-wrap">
      <div className="pdf-sheet">
        <div className="pdf-border pdf-border-top">
          <div className="pdf-header">
            <div className="pdf-logo-col">
              <div className="pdf-logo-text">NALVEL<br />LOGISTICS<br />SERVICES</div>
              <div className="pdf-logo-sub">WE DELIVER EVERYWHERE</div>
            </div>
            <div className="pdf-company-col">
              <div className="pdf-company-name">NALVEL LOGISTICS SERVICES</div>
              <div className="pdf-company-addr">
                New No.12, Old No.26, Nallappa Street, Nehru Nagar, Chromepet, Chennai - 600 044
                <br />
                Phone: 044-45830699 | nalvellogisticsservices@gmail.com | GSTIN: 33ARXPK1573A2ZT
              </div>
            </div>
            <div className="pdf-right-col">
              <div className="pdf-right-row">VEHICLE NO: {form.vehicleNo || '-'}</div>
              <div className="pdf-right-row">{form.contentsChecked || 'CONTENTS NOT CHECKED'}</div>
              <div className="pdf-right-row">{form.insuranceNote || 'Insurance at Owners Risk'}</div>
            </div>
          </div>

          <div className="pdf-cn-row">
            <div className="pdf-cn-cell cn-a">
              <div className="pdf-cn-label">CN No.</div>
              <div className="pdf-cn-no">{form.lrNo || '-'}</div>
            </div>
            <div className="pdf-cn-cell cn-b">
              <div className="pdf-cn-label">Date</div>
              <div className="cn-val">{form.lrDate || '-'}</div>
            </div>
            <div className="pdf-cn-cell cn-c">
              <div className="pdf-cn-label">Route</div>
              <div className="cn-route">{form.from || '-'} &#8594; {form.to || '-'}</div>
            </div>
          </div>

          <div className="pdf-parties">
            <div className="pdf-party">
              <div className="pdf-sec-label">CONSIGNOR (Sender)</div>
              <div className="pdf-name">{form.consignorName || '-'}</div>
              <div className="pdf-detail">{form.consignorAddress || '-'}</div>
              <div className="pdf-detail">GSTIN: {form.consignorGstin || '-'}</div>
            </div>
            <div className="pdf-party">
              <div className="pdf-sec-label">CONSIGNEE (Receiver)</div>
              <div className="pdf-name">{form.consigneeName || '-'}</div>
              <div className="pdf-detail">{form.consigneeAddress || '-'}</div>
              <div className="pdf-detail">GSTIN: {form.consigneeGstin || '-'}</div>
            </div>
          </div>

          <div className="pdf-mid">
            <div className="pdf-pkg-col">
              <table>
                <thead>
                  <tr>
                    <th className="w-pkg">Pkgs</th>
                    <th>Description (Said to Contain)</th>
                    <th className="w-wt">Actual Wt (KG)</th>
                    <th className="w-wt">Charged Wt (KG)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td >{form.noOfPackages || '-'}</td>
                    <td>{form.description || '-'}</td>
                    <td className="txt-right">{form.actualWeight || '-'}</td>
                    <td className="txt-right">{form.chargedWeight || '-'}</td>
                  </tr>
                  <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
                  <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
                </tbody>
              </table>
            </div>
            <div className="pdf-charges-col">
              <table>
                <thead><tr><th>Charge</th><th>Rate</th><th>Rs.</th></tr></thead>
                <tbody>
                  <tr><td>Freight</td><td className="txt-center">-</td><td>{form.freight || '-'}</td></tr>
                  <tr><td>Surcharge</td><td className="txt-center">-</td><td>{form.surcharge || '-'}</td></tr>
                  <tr><td>Hamah</td><td className="txt-center">-</td><td>{form.hamali || '-'}</td></tr>
                  <tr><td>Escort</td><td className="txt-center">-</td><td>{form.escort || '-'}</td></tr>
                  <tr><td>BOD / DD</td><td className="txt-center">-</td><td>{form.bocdd || '-'}</td></tr>
                  <tr><td>St. Charges</td><td className="txt-center">-</td><td>{form.stCharges || '-'}</td></tr>
                  <tr className="total-row-pdf"><td colSpan="2">TOTAL</td><td>{form.total || '-'}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {isCustomerInsured && (
            <div className="pdf-insurance">
              <b>INSURANCE DETAILS:</b> Company: {form.insuranceCompany || '-'} | Policy No: {form.policyNo || '-'} | Policy Date: {form.policyDate || '-'} | Amount: {form.insuranceAmount || '-'} | Risk Type: {form.risk || '-'}
            </div>
          )}

          <div className="pdf-footer">
            <div className="pdf-footer-left">
              {isCustomerInsured && <div><b>Declared Value:</b> Rs. {form.invoiceValue || '-'}</div>}
              <div className="pdf-footer-note">
                * Contents not checked. {isCustomerInsured ? 'Insurance covered by customer.' : "Insurance at owner's risk."}
              </div>
            </div>
            <div className="pdf-footer-mid">
              - CONSIGNOR COPY -
              <br />
              <span>For NALVEL LOGISTICS SERVICES</span>
            </div>
            <div className="pdf-footer-right">
              <div className="pdf-sig-line">Booking Incharge</div>
            </div>
          </div>
        </div>

        <div className="terms-section">
          <div className="terms-header">TERMS AND CONDITIONS</div>
          <div className="terms-applicability">
            <b>APPLICABILITY:</b> {TERMS_APPLICABILITY}
            <br />
            <b>{TERMS_DEFINITIONS}</b>
          </div>
          <div className="terms-grid">
            <div className="terms-col">
              {TERMS_LEFT.map((term, index) => (
                <div className="term-item" key={`left-${index}`}>
                  <b>{index + 1}.</b> {term}
                </div>
              ))}
            </div>
            <div className="terms-col">
              {TERMS_RIGHT.map((term, index) => (
                <div className="term-item" key={`right-${index}`}>
                  <b>{index + 11}.</b> {term}
                </div>
              ))}
            </div>
          </div>
          <div className="terms-footer">All disputes subject to Chennai jurisdiction only. | This is a computer generated document.</div>
        </div>
      </div>
    </article>
  );
}

