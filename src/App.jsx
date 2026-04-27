import { useEffect, useMemo, useState } from 'react';
import { Header } from './components/layout/Header.jsx';
import { StatusLine } from './components/layout/StatusLine.jsx';
import { emptyConsignmentForm, PAGE_SIZE } from './constants/consignment.js';
import { MasterPage } from './pages/MasterPage.jsx';
import { BillingViewPage } from './pages/BillingViewPage.jsx';
import { EntryFormPage } from './pages/EntryFormPage.jsx';
import { SavedDataPage } from './pages/SavedDataPage.jsx';
import {
  deleteConsignment,
  getAllConsignments,
  saveConsignment,
  searchConsignmentsByCustomer,
  updateConsignment,
} from './services/consignmentApi.js';
import { buildConsignmentPayload, getUniqueValues } from './utils/consignment.js';
import { getErrorMessage } from './utils/errors.js';

function toDateTimeLocal(value) {
  return typeof value === 'string' && value ? value.slice(0, 16) : '';
}

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

function normalizeAdvanceEntries(item) {
  const source = Array.isArray(item?.advanceEntries) && item.advanceEntries.length > 0 ? item.advanceEntries : null;
  if (source) {
    return source.map((entry, index) => ({
      id: entry.id ?? index + 1,
      amount: entry.amount ?? '',
    }));
  }

  return [{ id: 1, amount: item?.advance ?? '' }];
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
    const sourceValue = item.ledgerDateTime || item.loadingDateTime || item.deliveryDateTime || item.ledgerDate || item.loadingDate;
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

export function App() {
  const [form, setForm] = useState(() => ({ ...emptyConsignmentForm }));
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [searchName, setSearchName] = useState('');
  const [activePage, setActivePage] = useState('home');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Ready to connect');
  const [error, setError] = useState('');
  const [successPopup, setSuccessPopup] = useState('');
  const [homeFilter, setHomeFilter] = useState({ mode: 'all', from: '', to: '' });
  const [dataFilter, setDataFilter] = useState({ mode: 'all', from: '', to: '' });

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

  const homeItems = useMemo(() => applyDateFilter(allItems, homeFilter), [allItems, homeFilter]);
  const filteredDataItems = useMemo(() => applyDateFilter(items, dataFilter), [items, dataFilter]);

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

  function updateField(field, value) {
    setForm((current) => {
      const nextForm = { ...current, [field]: value };

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

      return nextForm;
    });
  }

  function clearForm() {
    setForm({ ...emptyConsignmentForm });
    setEditingId(null);
    setViewingItem(null);
    setError('');
    setMessage('New entry');
    setActivePage('form');
  }

  function applyConsignmentToForm(item) {
    setForm({
      ...emptyConsignmentForm,
      ...item,
      viewMode: item.gstNo ? 'GST' : item.imsNo ? 'IMS' : 'GST',
      gstType: item.gstType ? String(item.gstType) : '18',
      gstNo: item.gstNo ?? '',
      imsNo: item.imsNo ?? '',
      ledgerDate: toDateTimeLocal(item.ledgerDateTime),
      loadingDate: toDateTimeLocal(item.loadingDateTime),
      deliveryDateTime: toDateTimeLocal(item.deliveryDateTime),
      netWeight: item.netWeight ?? item.weight ?? '',
      tareWeight: item.tareWeight ?? '',
      actualWeight: item.actualWeight ?? '',
      crossVehicleWeight: item.crossVehicleWeight ?? '',
      supplierAmount: item.supplierAmount ?? '',
      advance: item.advance ?? '',
      advanceEntries: normalizeAdvanceEntries(item),
      balance: item.balance ?? '',
      ledgerAmount: item.ledgerAmount ?? '',
      customerRate: item.customerRate ?? '',
      additionalCharges: item.additionalCharges ?? '',
      expenses: item.expenses ?? '',
      netFreight: item.netFreight ?? '',
      profit: item.profit ?? '',
      lrNo: item.lrNo ?? '',
      lrDate: toDateTimeLocal(item.lrDateTime),
      invoiceNo: item.invoiceNo ?? '',
      invoiceDate: toDateTimeLocal(item.invoiceDateTime),
      paymentStatus: item.paymentStatus ?? '',
      dlNo: item.dlNo ?? '',
      ownerPrimaryContact: item.ownerPrimaryContact ?? '',
      ownerAlternateContact: item.ownerAlternateContact ?? '',
      driverPrimaryContact: item.driverPrimaryContact ?? '',
      driverAlternateContact: item.driverAlternateContact ?? '',
    });
  }

  async function submitForm(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const targetId = editingId ?? form.id ?? null;
      const isEditing = Boolean(targetId);
      const payload = buildConsignmentPayload(form);
      const saved = isEditing ? await updateConsignment(targetId, payload) : await saveConsignment(payload);
      const recordId = saved?.id ?? targetId ?? '';
      const successMessage = isEditing ? `Entry #${recordId} updated successfully` : `Entry #${recordId} saved successfully`;

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

  function editItem(item) {
    applyConsignmentToForm(item);
    setEditingId(item.id ?? null);
    setViewingItem(null);
    setActivePage('form');
    setMessage(`Editing entry #${item.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function viewItem(item) {
    setViewingItem(item);
    setActivePage('view');
    setMessage(`Viewing entry #${item.serialNo || item.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteItem(id) {
    if (!id) return;
    const confirmed = window.confirm(`Delete entry #${id}?`);
    if (!confirmed) return;

    setLoading(true);
    setError('');
    try {
      await deleteConsignment(id);
      setMessage(`Entry #${id} deleted`);
      if (editingId === id) clearForm();
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

  return (
    <main className="app-shell">
      <Header
        activePage={activePage}
        editingId={editingId}
        loading={loading}
        onBack={() => setActivePage('home')}
        onClear={clearForm}
      />

      {activePage === 'home' && (
        <MasterPage items={homeItems} filter={homeFilter} onFilterChange={setHomeFilter} onNavigate={setActivePage} />
      )}

      {activePage === 'form' && (
        <EntryFormPage
          editingId={editingId}
          form={form}
          suggestions={suggestions}
          onBack={() => setActivePage('home')}
          onSubmit={submitForm}
          onUpdateField={updateField}
        />
      )}

      <StatusLine loading={loading} message={message} error={error} />

      {activePage === 'data' && (
        <SavedDataPage
          currentPage={currentPage}
          filter={dataFilter}
          items={filteredDataItems}
          loading={loading}
          pagedItems={pagedItems}
          searchName={searchName}
          totalPages={totalPages}
          onBack={() => setActivePage('home')}
          onDelete={deleteItem}
          onEdit={editItem}
          onFilterChange={setDataFilter}
          onView={viewItem}
          onLoadAll={loadData}
          onSearch={searchByCustomer}
          onSearchNameChange={setSearchName}
          onSetPage={setCurrentPage}
        />
      )}

      {activePage === 'view' && (
        <BillingViewPage
          item={viewingItem}
          onBack={() => setActivePage('data')}
          onEdit={editItem}
          onHome={() => setActivePage('home')}
        />
      )}

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
