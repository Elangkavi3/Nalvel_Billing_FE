import { useEffect, useMemo, useState } from 'react';
import { Header } from './components/layout/Header.jsx';
import { StatusLine } from './components/layout/StatusLine.jsx';
import { emptyConsignmentForm, PAGE_SIZE } from './constants/consignment.js';
import { MasterPage } from './pages/MasterPage.jsx';
import { EntryFormPage } from './pages/EntryFormPage.jsx';
import { SavedDataPage } from './pages/SavedDataPage.jsx';
import {
  deleteConsignment,
  getAllConsignments,
  getConsignmentById,
  saveConsignment,
  searchConsignmentsByCustomer,
  updateConsignment,
} from './services/consignmentApi.js';
import { buildConsignmentPayload, getUniqueValues } from './utils/consignment.js';
import { getErrorMessage } from './utils/errors.js';

function toDateTimeLocal(value) {
  return typeof value === 'string' && value ? value.slice(0, 16) : '';
}

export function App() {
  const [form, setForm] = useState(emptyConsignmentForm);
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchName, setSearchName] = useState('');
  const [activePage, setActivePage] = useState('home');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Ready to connect');
  const [error, setError] = useState('');

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

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, currentPage]);

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
    setForm((current) => ({ ...current, [field]: value }));
  }

  function clearForm() {
    setForm(emptyConsignmentForm);
    setEditingId(null);
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
      weight: item.weight ?? '',
      supplierAmount: item.supplierAmount ?? '',
      advance: item.advance ?? '',
      customerRate: item.customerRate ?? '',
      additionalChargeType: item.additionalCharges ?? '',
      additionalExpenseType: item.expenses ?? '',
      lrNo: item.lrNo ?? '',
      lrDate: toDateTimeLocal(item.lrDateTime),
      invoiceNo: item.invoiceNo ?? '',
      invoiceDate: toDateTimeLocal(item.invoiceDateTime),
      subSerialNo: item.subSerialNo ?? '',
      ownerPrimaryContact: item.ownerPrimaryContact ?? '',
      ownerPrimaryWhatsappAvailable: Boolean(item.ownerPrimaryWhatsapp),
      ownerAlternateContact: item.ownerAlternateContact ?? '',
      ownerAlternateWhatsappAvailable: Boolean(item.ownerAlternateWhatsapp),
      driverPrimaryContact: item.driverPrimaryContact ?? '',
      driverPrimaryWhatsappAvailable: Boolean(item.driverPrimaryWhatsapp),
      driverAlternateContact: item.driverAlternateContact ?? '',
      driverAlternateWhatsappAvailable: Boolean(item.driverAlternateWhatsapp),
    });
  }

  async function submitForm(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const isEditing = Boolean(editingId);
      const payload = buildConsignmentPayload(form);
      const saved = editingId ? await updateConsignment(editingId, payload) : await saveConsignment(payload);
      const backendRecord = saved?.id ? await getConsignmentById(saved.id) : saved;
      const successMessage = isEditing ? `Entry #${backendRecord.id} updated successfully` : `Entry #${backendRecord.id} saved successfully`;

      setMessage(successMessage);
      await loadData();
      window.alert(successMessage);

      if (isEditing) {
        applyConsignmentToForm(backendRecord);
        setEditingId(backendRecord.id ?? null);
      } else {
        clearForm();
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to save entry'));
    } finally {
      setLoading(false);
    }
  }

  function editItem(item) {
    applyConsignmentToForm(item);
    setEditingId(item.id ?? null);
    setActivePage('form');
    setMessage(`Editing entry #${item.id}`);
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

      {activePage === 'home' && <MasterPage onNavigate={setActivePage} />}

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
          items={items}
          loading={loading}
          pagedItems={pagedItems}
          searchName={searchName}
          totalPages={totalPages}
          onBack={() => setActivePage('home')}
          onDelete={deleteItem}
          onEdit={editItem}
          onLoadAll={loadData}
          onSearch={searchByCustomer}
          onSearchNameChange={setSearchName}
          onSetPage={setCurrentPage}
        />
      )}
    </main>
  );
}
