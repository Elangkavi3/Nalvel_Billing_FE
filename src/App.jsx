import { useEffect, useMemo, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Header } from './components/layout/Header.jsx';
import { StatusLine } from './components/layout/StatusLine.jsx';
import { emptyConsignmentForm, PAGE_SIZE } from './constants/consignment.js';
import { MasterPage } from './pages/MasterPage.jsx';
import { BillingViewPage } from './pages/BillingViewPage.jsx';
import { EntryFormPage } from './pages/EntryFormPage.jsx';
import { LRGenerationPage } from './pages/LRGenerationPage.jsx';
import { SavedDataPage } from './pages/SavedDataPage.jsx';
import {
  deleteConsignment,
  downloadConsignmentsExcel,
  getAllConsignments,
  getConsignmentsByDateRange,
  getMonthConsignments,
  saveConsignment,
  searchConsignmentsByCustomer,
  getTodayConsignments,
  getWeekConsignments,
  getYearConsignments,
  updateConsignment,
} from './services/consignmentApi.js';
import {
  deleteAdvancePayment,
  getAdvancePaymentsByConsignmentId,
  saveAdvancePayment,
  updateAdvancePayment,
} from './services/advancePaymentApi.js';
import {
  deleteLR,
  getAllLR,
} from './services/lrApi.js';
import {
  buildAdvancePaymentPayload,
  buildConsignmentPayload,
  getUniqueValues,
  applyCalculatedConsignmentValues,
  normalizeAdvanceEntries,
  normalizeDateOnly,
} from './utils/consignment.js';
import { getErrorMessage } from './utils/errors.js';

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getStartOfWeek(date) {
  const start = new Date(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

function getEndOfWeek(date) {
  const end = getStartOfWeek(date);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

const contactFields = new Set([
  'ownerPrimaryContact',
  'ownerAlternateContact',
  'driverPrimaryContact',
  'driverAlternateContact',
]);

function isNotFoundError(error) {
  return error?.response?.status === 404;
}

function responseRows(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return value ? [value] : [];
}

function resolveLrConsignmentId(record) {
  const nestedId = record?.consignment?.id;
  const directId = record?.consignmentId;
  const value = Number(directId ?? nestedId ?? 0);
  return Number.isFinite(value) ? value : 0;
}

async function ignoreMissing(deleteRequest) {
  try {
    await deleteRequest();
  } catch (error) {
    if (!isNotFoundError(error)) throw error;
  }
}

async function runSoft(action) {
  try {
    await action();
    return null;
  } catch (error) {
    return error;
  }
}

function isNumericLike(value) {
  if (value === null || value === undefined || value === '') return false;
  return Number.isFinite(Number(value));
}

function uniqueCandidates(values) {
  return [...new Set(values.filter((value) => value !== null && value !== undefined && value !== ''))];
}

function resolveConsignmentDeleteTargets(itemOrId) {
  if (itemOrId && typeof itemOrId === 'object') {
    const numericId = itemOrId.id ?? itemOrId.consignmentId ?? itemOrId.recordId ?? '';
    const serialNo = itemOrId.serialNo ?? '';
    const cleanupId = isNumericLike(numericId) ? Number(numericId) : null;
    const deleteCandidates = uniqueCandidates([
      cleanupId,
      numericId,
      serialNo,
    ]);
    const label = serialNo || numericId || '';
    return { cleanupId, deleteCandidates, label };
  }

  const cleanupId = isNumericLike(itemOrId) ? Number(itemOrId) : null;
  const deleteCandidates = uniqueCandidates([cleanupId, itemOrId]);
  return { cleanupId, deleteCandidates, label: itemOrId };
}

function normalizeContactNumber(value) {
  return String(value ?? '').replace(/\D/g, '').slice(0, 10);
}

function invalidContactFields(form) {
  return [...contactFields].filter((field) => {
    const value = form[field];
    return value && String(value).length !== 10;
  });
}

function applyDateFilter(items, filter) {
  if (!Array.isArray(items)) return [];

  const now = new Date();
  const todayKey = formatDateKey(now);
  const month = now.getMonth();
  const year = now.getFullYear();
  const weekStart = getStartOfWeek(now);
  const weekEnd = getEndOfWeek(now);

  return items.filter((item) => {
    const sourceValue =
      item.ledgerDateTime ||
      item.bookingDate ||
      item.loadingDateTime ||
      item.loadingDate ||
      item.deliveryDateTime ||
      item.deliveryDate ||
      item.ledgerDate;
    if (!sourceValue) return filter.mode === 'all';

    const parsed = new Date(sourceValue);
    if (Number.isNaN(parsed.getTime())) return filter.mode === 'all';

    if (filter.mode === 'today') return formatDateKey(parsed) === todayKey;
    if (filter.mode === 'week') return parsed >= weekStart && parsed <= weekEnd;
    if (filter.mode === 'month') return parsed.getMonth() === month && parsed.getFullYear() === year;
    if (filter.mode === 'range') {
      const from = filter.from ? new Date(`${filter.from}T00:00:00`) : null;
      const to = filter.to ? new Date(`${filter.to}T23:59:59`) : null;
      if (from && parsed < from) return false;
      if (to && parsed > to) return false;
      return true;
    }

    return true;
  });
}

function resolveExportDateRange(filter) {
  const now = new Date();

  if (filter.mode === 'today') {
    const today = formatDateKey(now);
    return { startDate: today, endDate: today };
  }

  if (filter.mode === 'week') {
    return {
      startDate: formatDateKey(getStartOfWeek(now)),
      endDate: formatDateKey(getEndOfWeek(now)),
    };
  }

  if (filter.mode === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      startDate: formatDateKey(start),
      endDate: formatDateKey(end),
    };
  }

  if (filter.mode === 'year') {
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31);
    return {
      startDate: formatDateKey(start),
      endDate: formatDateKey(end),
    };
  }

  if (filter.mode === 'range') {
    return {
      startDate: filter.from || '',
      endDate: filter.to || '',
    };
  }

  return { startDate: '', endDate: '' };
}

export function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState(() => ({ ...emptyConsignmentForm }));
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [searchName, setSearchName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Ready to connect');
  const [error, setError] = useState('');
  const [successPopup, setSuccessPopup] = useState('');
  const [homeFilter, setHomeFilter] = useState({ mode: 'all', from: '', to: '' });
  const [dataFilter, setDataFilter] = useState({ mode: 'all', from: '', to: '' });
  const [homeFilteredItems, setHomeFilteredItems] = useState([]);
  const [registerFilteredItems, setRegisterFilteredItems] = useState([]);

  // Derive active page from URL path
  const activePage = useMemo(() => {
    const path = location.pathname;
    if (path === '/entry') return 'form';
    if (path === '/register') return 'data';
    if (path === '/lr') return 'lr';
    if (path === '/view') return 'view';
    return 'home';
  }, [location.pathname]);

  const suggestions = useMemo(
    () => ({
      customer: getUniqueValues(allItems, 'customerName'),
      billTo: getUniqueValues(allItems, 'billTo'),
      owner: getUniqueValues(allItems, 'ownerName'),
      ownerPrimaryContact: getUniqueValues(allItems, 'ownerPrimaryContact'),
      ownerAlternateContact: getUniqueValues(allItems, 'ownerAlternateContact'),
      driver: getUniqueValues(allItems, 'driverName'),
      driverPrimaryContact: getUniqueValues(allItems, 'driverPrimaryContact'),
      driverAlternateContact: getUniqueValues(allItems, 'driverAlternateContact'),
      from: getUniqueValues(allItems, 'fromLocation'),
      to: getUniqueValues(allItems, 'toLocation'),
      truck: getUniqueValues(allItems, 'truckNo'),
      truckType: getUniqueValues(allItems, 'truckType'),
    }),
    [allItems],
  );

  const homeItems = homeFilteredItems;
  const filteredDataItems = registerFilteredItems;

  const totalPages = Math.max(1, Math.ceil(filteredDataItems.length / PAGE_SIZE));
  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredDataItems.slice(start, start + PAGE_SIZE);
  }, [filteredDataItems, currentPage]);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const consignments = await getAllConsignments();
      setItems(consignments);
      setAllItems(consignments);
      setCurrentPage(1);
      setMessage(`${consignments.length} consignments loaded`);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load consignments'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {

  const token = localStorage.getItem("token");
  const skipAuthRedirect =
    import.meta.env.DEV ||
    import.meta.env.VITE_DISABLE_AUTH_REDIRECT === "true";

  const publicRoutes = ["/login"];

  const isPublicRoute = publicRoutes.includes(location.pathname);

  if (skipAuthRedirect) {
    return;
  }

  if (!token && !isPublicRoute) {

    window.location.href = "http://nalvel.com";

  }

}, [location.pathname]);

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (token) {
    localStorage.setItem("token", token);

    // Optional: clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}, []);

  useEffect(() => {
    let cancelled = false;

    async function loadHomeByFilter() {
      try {
        if (homeFilter.mode === 'all') {
          if (!cancelled) setHomeFilteredItems(allItems);
          return;
        }
        if (homeFilter.mode === 'today') {
          const rows = await getTodayConsignments();
          if (!cancelled) setHomeFilteredItems(rows);
          return;
        }
        if (homeFilter.mode === 'week') {
          const rows = await getWeekConsignments();
          if (!cancelled) setHomeFilteredItems(rows);
          return;
        }
        if (homeFilter.mode === 'month') {
          const rows = await getMonthConsignments();
          if (!cancelled) setHomeFilteredItems(rows);
          return;
        }
        if (homeFilter.mode === 'year') {
          const rows = await getYearConsignments();
          if (!cancelled) setHomeFilteredItems(rows);
          return;
        }
        if (homeFilter.mode === 'range' && homeFilter.from && homeFilter.to) {
          const rows = await getConsignmentsByDateRange(homeFilter.from, homeFilter.to);
          if (!cancelled) setHomeFilteredItems(rows);
          return;
        }
        if (!cancelled) setHomeFilteredItems(applyDateFilter(allItems, homeFilter));
      } catch {
        if (!cancelled) setHomeFilteredItems(applyDateFilter(allItems, homeFilter));
      }
    }

    loadHomeByFilter();
    return () => {
      cancelled = true;
    };
  }, [allItems, homeFilter]);

  useEffect(() => {
    let cancelled = false;

    async function loadRegisterByFilter() {
      try {
        if (dataFilter.mode === 'all') {
          if (!cancelled) setRegisterFilteredItems(items);
          return;
        }
        if (dataFilter.mode === 'today') {
          const rows = await getTodayConsignments();
          if (!cancelled) setRegisterFilteredItems(rows);
          return;
        }
        if (dataFilter.mode === 'week') {
          const rows = await getWeekConsignments();
          if (!cancelled) setRegisterFilteredItems(rows);
          return;
        }
        if (dataFilter.mode === 'month') {
          const rows = await getMonthConsignments();
          if (!cancelled) setRegisterFilteredItems(rows);
          return;
        }
        if (dataFilter.mode === 'year') {
          const rows = await getYearConsignments();
          if (!cancelled) setRegisterFilteredItems(rows);
          return;
        }
        if (dataFilter.mode === 'range' && dataFilter.from && dataFilter.to) {
          const rows = await getConsignmentsByDateRange(dataFilter.from, dataFilter.to);
          if (!cancelled) setRegisterFilteredItems(rows);
          return;
        }
        if (!cancelled) setRegisterFilteredItems(applyDateFilter(items, dataFilter));
      } catch {
        if (!cancelled) setRegisterFilteredItems(applyDateFilter(items, dataFilter));
      }
    }

    loadRegisterByFilter();
    return () => {
      cancelled = true;
    };
  }, [items, dataFilter]);

  function updateField(field, value) {
    setForm((current) => {
      const nextValue = contactFields.has(field) ? normalizeContactNumber(value) : value;
      const nextForm = { ...current, [field]: nextValue };

      if (field === 'viewMode') {
        if (value === 'GST') {
          nextForm.imsNo = '';
        } else if (value === 'IMS') {
          nextForm.gstNo = '';
          nextForm.gstType = '';
        }
      }

      if (field === 'gstNo') {
        if (value && value.toString().trim()) {
          nextForm.viewMode = 'GST';
          nextForm.imsNo = '';
        }
      }

      if (field === 'imsNo') {
        if (value && value.toString().trim()) {
          nextForm.viewMode = 'IMS';
          nextForm.gstNo = '';
          nextForm.gstType = '';
        }
      }

      return applyCalculatedConsignmentValues(nextForm);
    });
  }

  function clearForm() {
    setForm({ ...emptyConsignmentForm });
    setEditingId(null);
    setViewingItem(null);
    setError('');
    setMessage('New entry');
    navigate('/entry');
  }

  function applyConsignmentToForm(item) {
    setForm(applyCalculatedConsignmentValues({
      ...emptyConsignmentForm,
      ...item,
      viewMode: item.gstNo ? 'GST' : item.imsNo ? 'IMS' : 'GST',
      gstType: item.gstType ? String(item.gstType) : '18',
      gstNo: item.gstNo ?? '',
      imsNo: item.imsNo ?? '',
      ledgerDate: normalizeDateOnly(item.ledgerDate ?? item.ledgerDateTime ?? item.bookingDate),
      loadingDate: normalizeDateOnly(item.loadingDate ?? item.loadingDateTime),
      deliveryDateTime: normalizeDateOnly(item.deliveryDateTime ?? item.deliveryDate),
      netWeight: item.netWeight ?? item.weight ?? '',
      tareWeight: item.tareWeight ?? '',
      actualWeight: item.actualWeight ?? '',
      grossWeight: item.grossWeight ?? item.crossVehicleWeight ?? '',
      material: item.material ?? '',
      supplierRateType: item.supplierRateType ?? 'fixed_cost',
      supplierAmount: item.supplierAmount ?? '',
      chargeableWeight: item.chargeableWeight ?? item.chargebleWeight ?? '',
      haltingCharge: item.haltingCharge ?? '',
      parkingCharge: item.parkingCharge ?? '',
      commission: item.commission ?? '',
      netBalance: item.netBalance ?? '',
      advance: item.advance ?? '',
      advanceEntries: normalizeAdvanceEntries(item.advanceEntries),
      totalAdvance: item.totalAdvance ?? '',
      balance: item.balance ?? '',
      ledgerAmount: item.ledgerAmount ?? '',
      customerRate: item.customerRate ?? '',
      additionalCharges: item.additionalCharges ?? '',
      expenses: item.expenses ?? '',
      netFreight: item.netFreight ?? '',
      profit: item.profit ?? '',
      lrNo: item.lrNo ?? item.lrNumber ?? '',
      lrDate: normalizeDateOnly(item.lrDateTime ?? item.lrDate),
      invoiceNo: item.invoiceNo ?? item.customerInvoiceNo ?? item.customerInvoiceNumber ?? '',
      invoiceDate: normalizeDateOnly(
        item.invoiceDate ?? item.invoiceDateTime ?? item.customerInvoiceDate ?? item.customerInvoiceDateTime,
      ),
      paymentStatus: item.paymentStatus ?? item.balancePaymentStatus ?? '',
      paymentType: item.paymentType ?? '',
      truckpaymentMode: item.truckpaymentMode ?? '',
      customerPaymentMode: item.customerPaymentMode ?? item.paymentMode ?? '',
      dlNo: item.dlNo ?? '',
      ownerPrimaryContact: item.ownerPrimaryContact ?? '',
      ownerAlternateContact: item.ownerAlternateContact ?? '',
      driverPrimaryContact: item.driverPrimaryContact ?? '',
      driverAlternateContact: item.driverAlternateContact ?? '',
    }));
  }

  async function syncAdvancePayments(consignmentId, currentForm) {
    const existingEntries = await getAdvancePaymentsByConsignmentId(consignmentId);
    const existingIds = new Set(existingEntries.map((entry) => entry.id));
    const submittedEntries = normalizeAdvanceEntries(currentForm.advanceEntries).filter((entry) => entry.amount !== '' || entry.refNo);
    const submittedExistingIds = new Set(submittedEntries.map((entry) => entry.id).filter((id) => existingIds.has(id)));

    await Promise.all(
      existingEntries
        .filter((entry) => !submittedExistingIds.has(entry.id))
        .map((entry) => deleteAdvancePayment(entry.id)),
    );

    await Promise.all(
      submittedEntries.map((entry, index) => {
        const payload = buildAdvancePaymentPayload(entry, index, currentForm);
        return existingIds.has(entry.id)
          ? updateAdvancePayment(entry.id, payload)
          : saveAdvancePayment(consignmentId, payload);
      }),
    );
  }

  async function deleteAdvancePaymentsForConsignment(consignmentId) {
    try {
      const advanceEntries = responseRows(await getAdvancePaymentsByConsignmentId(consignmentId));
      await Promise.all(
        advanceEntries
          .map((entry) => entry?.id)
          .filter(Boolean)
          .map((id) => ignoreMissing(() => deleteAdvancePayment(id))),
      );
    } catch (error) {
      if (!isNotFoundError(error)) throw error;
    }
  }

  async function deleteLrForConsignment(consignmentId) {
    try {
      const targetId = Number(consignmentId);
      const lrRecords = responseRows(await getAllLR())
        .filter((record) => resolveLrConsignmentId(record) === targetId);
      await Promise.all(
        lrRecords
          .map((record) => record?.id)
          .filter(Boolean)
          .map((id) => ignoreMissing(() => deleteLR(id))),
      );
    } catch (error) {
      if (!isNotFoundError(error)) throw error;
    }
  }

  async function submitForm(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const targetId = editingId ?? form.id ?? null;
      const isEditing = Boolean(targetId);
      const invalidContacts = invalidContactFields(form);
      if (invalidContacts.length > 0) {
        throw new Error('Mobile number must be exactly 10 digits');
      }
      const currentForm = applyCalculatedConsignmentValues(form);
      const payload = buildConsignmentPayload(currentForm);
      const saved = isEditing ? await updateConsignment(targetId, payload) : await saveConsignment(payload);
      const recordId = saved?.id ?? targetId ?? '';
      const successMessage = isEditing ? `Entry #${recordId} updated successfully` : `Entry #${recordId} saved successfully`;

      if (recordId) {
        await syncAdvancePayments(recordId, currentForm);
      }

      setMessage(successMessage);
      await loadData();
      setSuccessPopup(successMessage);

      clearForm();
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to save entry'));
    } finally {
      setLoading(false);
    }
  }

  async function editItem(item) {
    setLoading(true);
    setError('');
    try {
      const advanceEntries = await getAdvancePaymentsByConsignmentId(item.id);
      applyConsignmentToForm({ ...item, advanceEntries });
      setEditingId(item.id ?? null);
      setViewingItem(null);
      setMessage(`Editing entry #${item.id}`);
      navigate('/entry');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load advance payments'));
    } finally {
      setLoading(false);
    }
  }

  function viewItem(item) {
    setViewingItem(item);
    setMessage(`Viewing entry #${item.serialNo || item.id}`);
    navigate('/view');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteItem(itemOrId) {
    const { cleanupId, deleteCandidates, label } = resolveConsignmentDeleteTargets(itemOrId);
    if (deleteCandidates.length === 0) {
      setError('Unable to delete entry: missing backend record id');
      return;
    }
    const displayId = label || deleteCandidates[0];
    const confirmed = window.confirm(`Delete entry #${displayId}?`);
    if (!confirmed) return;

    setLoading(true);
    setError('');
    try {
      const lrCleanupError = cleanupId ? await runSoft(() => deleteLrForConsignment(cleanupId)) : null;
      const advanceCleanupError = cleanupId ? await runSoft(() => deleteAdvancePaymentsForConsignment(cleanupId)) : null;

      let deleteError = null;
      for (const candidate of deleteCandidates) {
        try {
          await deleteConsignment(candidate);
          deleteError = null;
          break;
        } catch (error) {
          deleteError = error;
          if (!isNotFoundError(error)) throw error;
        }
      }
      if (deleteError) throw deleteError;

      if (lrCleanupError || advanceCleanupError) {
        setMessage(`Entry #${displayId} deleted (child cleanup skipped where unavailable)`);
      } else {
        setMessage(`Entry #${displayId} deleted`);
      }
      if (editingId === cleanupId) clearForm();
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to delete entry'));
    } finally {
      setLoading(false);
    }
  }

  async function searchByCustomer(event) {
    event.preventDefault();
    if (!searchName.trim()) {
      await loadData();
      return;
    }

    setLoading(true);
    setError('');
    try {
      const consignments = await searchConsignmentsByCustomer(searchName.trim());
      setItems(consignments);
      setCurrentPage(1);
      setMessage(`${consignments.length} matches for ${searchName.trim()}`);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to search customer'));
    } finally {
      setLoading(false);
    }
  }

  async function exportSavedConsignments() {
    setLoading(true);
    setError('');
    try {
      const { startDate, endDate } = resolveExportDateRange(dataFilter);
      await downloadConsignmentsExcel({
        startDate,
        endDate,
        customerName: searchName.trim(),
      });
      setMessage('Consignment Excel exported successfully');
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to export consignment Excel'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <Header
        activePage={activePage}
        editingId={editingId}
        loading={loading}
        onBack={() => navigate(-1)}
        onClear={clearForm}
      />

      <StatusLine loading={loading} message={message} error={error} />

      <Routes>
        <Route
          path="/"
          element={
            <MasterPage
              items={homeItems}
              filter={homeFilter}
              onFilterChange={setHomeFilter}
              onNavigate={(page) => {
                if (page === 'form') navigate('/entry');
                else if (page === 'data') navigate('/register');
                else if (page === 'lr') navigate('/lr');
                else navigate('/');
              }}
            />
          }
        />

        <Route
          path="/entry"
          element={
            <EntryFormPage
              editingId={editingId}
              form={form}
              suggestions={suggestions}
              onBack={() => navigate('/')}
              onSubmit={submitForm}
              onUpdateField={updateField}
            />
          }
        />

        <Route
          path="/register"
          element={
            <SavedDataPage
              currentPage={currentPage}
              filter={dataFilter}
              items={filteredDataItems}
              loading={loading}
              pagedItems={pagedItems}
              searchName={searchName}
              totalPages={totalPages}
              onBack={() => navigate('/')}
              onDelete={deleteItem}
              onEdit={editItem}
              onFilterChange={setDataFilter}
              onView={viewItem}
              onLoadAll={loadData}
              onExportExcel={exportSavedConsignments}
              onSearch={searchByCustomer}
              onSearchNameChange={setSearchName}
              onSetPage={setCurrentPage}
            />
          }
        />

        <Route
          path="/lr"
          element={
            <LRGenerationPage
              onBack={() => navigate('/')}
              onSaved={setMessage}
            />
          }
        />

        <Route
          path="/view"
          element={
            <BillingViewPage
              item={viewingItem}
              onBack={() => navigate('/register')}
              onEdit={editItem}
              onHome={() => navigate('/')}
            />
          }
        />

        {/* Catch-all: redirect to home */}
        <Route path="*" element={<MasterPage items={homeItems} filter={homeFilter} onFilterChange={setHomeFilter} onNavigate={(page) => { if (page === 'form') navigate('/entry'); else if (page === 'data') navigate('/register'); else if (page === 'lr') navigate('/lr'); else navigate('/'); }} />} />
      </Routes>

      {successPopup && (
        <section className="success-popup-backdrop" role="presentation" onClick={() => setSuccessPopup('')}>
          <div
            className="success-popup"
            role="alertdialog"
            aria-live="assertive"
            aria-label="Submission successful"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="success-popup-icon" aria-hidden="true">
              <svg viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" />
                <path d="M18 33.5 27.5 43 46 24.5" />
              </svg>
            </div>
            <h2>Success</h2>
            <p>{successPopup}</p>
            <button type="button" className="btn primary" onClick={() => setSuccessPopup('')}>
              Continue
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
