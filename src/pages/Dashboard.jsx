import React, { useState, useEffect, useRef, useCallback } from 'react';
import API from '../api/axios';
import { useToast } from '../components/Toast';
import { SkeletonRow } from '../components/Skeleton';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import * as XLSX from 'xlsx';
import { BarChart2, CalendarDays, UserPlus, MessageSquare, Users, Edit, Trash2, ChevronDown, ChevronRight, AlertTriangle, X, Download } from 'lucide-react';

// ─── Helper ──────────────────────────────────────────────
const formatTanggal = (val) => {
  if (!val) return '-';
  try { return new Date(val).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }); }
  catch { return val; }
};

const formatWaktu = (val) => {
  if (!val) return '';
  try { return new Date(val).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }); }
  catch { return ''; }
};

const getStatusBadge = (tanggal, kuota, pesertaCount) => {
  if (!tanggal) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tgl = new Date(tanggal);
  if (tgl < today) return { label: 'Selesai', cls: 'bg-slate-700 text-slate-400' };
  if (kuota > 0 && pesertaCount >= kuota) return { label: 'Penuh', cls: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' };
  return { label: 'Akan Datang', cls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' };
};

// ─── Komponen Modal Shell ────────────────────────────────
function Modal({ onClose, children, maxWidth = 'max-w-lg', zIndex = 'z-50' }) {
  return (
    <div className={`fixed inset-0 ${zIndex} flex items-center justify-center p-4`}
      style={{ backgroundColor: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full ${maxWidth} flex flex-col`} style={{ maxHeight: '90vh' }}>
        {children}
      </div>
    </div>
  );
}

// ─── Komponen Modal Header ───────────────────────────────
function ModalHeader({ title, subtitle, subtitleColor = 'text-emerald-400', onClose }) {
  return (
    <div className="flex items-center justify-between p-5 border-b border-slate-800 flex-shrink-0">
      <div className="min-w-0 pr-3">
        <h3 className="text-base font-bold text-white">{title}</h3>
        {subtitle && <p className={`text-sm font-semibold mt-0.5 truncate ${subtitleColor}`}>{subtitle}</p>}
      </div>
      <button onClick={onClose} className="text-slate-500 hover:text-white hover:bg-slate-700 w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg transition text-lg"><X className="w-5 h-5"/></button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// KOMPONEN UTAMA DASHBOARD
// ═══════════════════════════════════════════════════════════
function Dashboard() {
  const toast = useToast();
  const [tourings, setTourings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [stats, setStats] = useState({ total_users: 0, total_tourings: 0, total_registrations: 0 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [expandedRow, setExpandedRow] = useState(null);

  // Modal: Gabung Touring
  const [gabungModal, setGabungModal] = useState(null);
  const [gabungForm, setGabungForm] = useState({ bike_model: '', license_plate: '' });
  const [gabungMsg, setGabungMsg] = useState({ text: '', isError: false });
  const [gabungLoading, setGabungLoading] = useState(false);

  // Modal: Diskusi
  const [diskusiModal, setDiskusiModal] = useState(null);
  const [diskusiList, setDiskusiList] = useState([]);
  const [diskusiLoading, setDiskusiLoading] = useState(false);
  const [diskusiInput, setDiskusiInput] = useState('');
  const [diskusiSending, setDiskusiSending] = useState(false);
  const chatBottomRef = useRef(null);

  // Modal: Edit Agenda (Admin)
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editMsg, setEditMsg] = useState({ text: '', isError: false });
  const [editLoading, setEditLoading] = useState(false);

  // Modal: Peserta (Admin)
  const [pesertaModal, setPesertaModal] = useState(null);
  const [pesertaList, setPesertaList] = useState([]);
  const [pesertaLoading, setPesertaLoading] = useState(false);

  // Modal: Konfirmasi Hapus/Keluarkan
  const [confirmDialog, setConfirmDialog] = useState(null);

  const username = localStorage.getItem('username') || 'User';
  const role = localStorage.getItem('role') || 'user';
  const [myVehicles, setMyVehicles] = useState([]);

  // Fungsi helper untuk menyingkat nama agenda di XAxis
  const getShortName = (text) => {
    if (!text) return "";
    const words = text.trim().split(/\s+/);
    if (words.length <= 1) return text.substring(0, 10) + (text.length > 10 ? '...' : '');
    const firstWord = words[0];
    const initials = words.slice(1).map(w => w[0].toUpperCase()).join('');
    return `${firstWord} ${initials}`;
  };

  // ─── Fetch Stats ─────────────────────────────────────────
  const fetchStats = async () => {
    try {
      const res = await API.get('/api/stats');
      setStats(res.data);
      
      const vRes = await API.get('/api/vehicles');
      setMyVehicles(Array.isArray(vRes.data) ? vRes.data : []);
    } catch (err) { console.error(err); }
  };

  // ─── Fetch Touring ──────────────────────────────────────
  const fetchTouringData = async () => {
    try {
      setLoading(true);
      const res = await API.get('/api/touring', {
        params: { page, limit: 10, search: searchTerm, sort: sortField, order: sortOrder }
      });
      setTourings(res.data.data || []);
      setTotalPages(res.data.total_page || 1);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat jadwal touring.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchTouringData();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [page, searchTerm, sortField, sortOrder]);

  // ─── Diskusi ─────────────────────────────────────────────
  const fetchDiskusi = async (id) => {
    setDiskusiLoading(true);
    try {
      const res = await API.get(`/api/touring/${id}/diskusi`);
      setDiskusiList(Array.isArray(res.data) ? res.data : []);
    } catch { setDiskusiList([]); }
    finally { setDiskusiLoading(false); }
  };

  useEffect(() => {
    if (chatBottomRef.current) chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [diskusiList]);

  const openDiskusi = (item) => { setDiskusiModal({ id: item.id, nama: item.nama_touring || item.title }); fetchDiskusi(item.id); };
  const closeDiskusi = () => { setDiskusiModal(null); setDiskusiList([]); setDiskusiInput(''); };

  const handleSendDiskusi = async (e) => {
    e.preventDefault();
    if (!diskusiInput.trim()) return;
    setDiskusiSending(true);
    try { await API.post(`/api/touring/${diskusiModal.id}/diskusi`, { message: diskusiInput }); setDiskusiInput(''); fetchDiskusi(diskusiModal.id); }
    catch (err) { console.error(err); }
    finally { setDiskusiSending(false); }
  };

  // ─── Gabung Touring ──────────────────────────────────────
  const openGabung = (item) => { setGabungModal({ id: item.id, nama: item.nama_touring || item.title }); setGabungForm({ bike_model: '', license_plate: '' }); setGabungMsg({ text: '', isError: false }); };
  const closeGabung = () => { setGabungModal(null); setGabungMsg({ text: '', isError: false }); };

  const handleGabungSubmit = async (e) => {
    e.preventDefault();
    setGabungLoading(true); setGabungMsg({ text: '', isError: false });
    try {
      await API.post('/api/register-touring', { touring_id: gabungModal.id, ...gabungForm });
      toast.success('Berhasil bergabung ke agenda touring! 🎉');
      closeGabung();
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal mendaftar.';
      setGabungMsg({ text: msg, isError: true });
      toast.error(msg);
    } finally { setGabungLoading(false); }
  };

  // ─── Edit Agenda (Admin) ─────────────────────────────────
  const openEdit = (item) => {
    setEditModal({ id: item.id, nama: item.nama_touring || item.title });
    setEditForm({
      nama_touring: item.nama_touring || item.title || '',
      tujuan: item.tujuan || item.destination || '',
      tanggal: (item.tanggal || item.departure_date || '').split('T')[0],
      deskripsi: item.deskripsi || item.description || '',
      kuota: item.kuota || item.max_participants || '',
    });
    setEditMsg({ text: '', isError: false });
  };
  const closeEdit = () => { setEditModal(null); setEditMsg({ text: '', isError: false }); };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true); setEditMsg({ text: '', isError: false });
    try {
      const payload = { ...editForm, kuota: parseInt(editForm.kuota, 10) || 0 };
      await API.put(`/api/touring/${editModal.id}`, payload);
      toast.success('Agenda berhasil diperbarui! ✅');
      fetchTouringData();
      closeEdit();
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal memperbarui.';
      setEditMsg({ text: msg, isError: true });
      toast.error(msg);
    } finally { setEditLoading(false); }
  };

  // ─── Hapus Agenda (Admin) ────────────────────────────────
  const handleDelete = (item) => {
    setConfirmDialog({
      title: 'Hapus Agenda',
      message: `Yakin ingin menghapus agenda "${item.nama_touring || item.title}"?`,
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await API.delete(`/api/touring/${item.id}`);
          toast.success('Agenda berhasil dihapus!');
          fetchTouringData();
        } catch (err) {
          toast.error(err.response?.data?.message || 'Gagal menghapus agenda.');
        }
      }
    });
  };

  // ─── Peserta Touring (Admin) ─────────────────────────────
  const openPeserta = async (item) => {
    setPesertaModal({ id: item.id, nama: item.nama_touring || item.title });
    setPesertaList([]);
    setPesertaLoading(true);
    try {
      const res = await API.get(`/api/touring/${item.id}/peserta`);
      setPesertaList(Array.isArray(res.data) ? res.data : []);
    } catch { setPesertaList([]); }
    finally { setPesertaLoading(false); }
  };
  const closePeserta = () => { setPesertaModal(null); setPesertaList([]); };

  const handleKickPeserta = (pesertaId) => {
    setConfirmDialog({
      title: 'Keluarkan Peserta',
      message: 'Yakin ingin mengeluarkan peserta ini dari agenda?',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await API.delete(`/api/touring/${pesertaModal.id}/peserta/${pesertaId}`);
          toast.success("Peserta berhasil dikeluarkan!");
          const res = await API.get(`/api/touring/${pesertaModal.id}/peserta`);
          setPesertaList(Array.isArray(res.data) ? res.data : []);
          fetchTouringData();
        } catch (err) {
          toast.error(err.response?.data?.message || "Gagal mengeluarkan peserta.");
        }
      }
    });
  };
  const filteredTourings = tourings.filter(item => {
    const term = searchTerm.toLowerCase();
    const matchSearch = (item.nama_touring || item.title || '').toLowerCase().includes(term) || 
                        (item.tujuan || item.destination || '').toLowerCase().includes(term);
    if (!matchSearch) return false;

    if (statusFilter !== 'Semua') {
      const tanggalRaw = item.tanggal || item.departure_date;
      const kuota = item.kuota || item.max_participants || 0;
      const count = item.peserta_count || 0;
      const badge = getStatusBadge(tanggalRaw, kuota, count);
      if (badge?.label !== statusFilter) return false;
    }
    return true;
  });

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredTourings.map(t => ({
      ID: t.id,
      Nama: t.nama_touring || t.title,
      Tujuan: t.tujuan || t.destination,
      Tanggal: formatTanggal(t.tanggal || t.departure_date),
      Waktu: t.waktu,
      Kuota: t.kuota || t.max_participants,
      JumlahPeserta: t.peserta_count || 0
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Touring");
    XLSX.writeFile(wb, "Data_Touring.xlsx");
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // ─── Render ───────────────────────────────────────────────
  return (
    <>
      {/* STATISTIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl hover:-translate-y-1 transition-all duration-300">
          <p className="text-slate-400 text-sm font-medium mb-1">Total Pengguna</p>
          <h3 className="text-3xl font-bold text-white">{stats.total_users || 0}</h3>
        </div>
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl hover:-translate-y-1 transition-all duration-300">
          <p className="text-slate-400 text-sm font-medium mb-1">Total Agenda Touring</p>
          <h3 className="text-3xl font-bold text-white">{stats.total_tourings || 0}</h3>
        </div>
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl hover:-translate-y-1 transition-all duration-300">
          <p className="text-slate-400 text-sm font-medium mb-1">Total Registrasi Peserta</p>
          <h3 className="text-3xl font-bold text-emerald-400">{stats.total_registrations || 0}</h3>
        </div>
      </div>

      {/* BAR CHART */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl mb-8 hidden md:block">
        <h2 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-emerald-400" /> Grafik Peserta per Agenda
        </h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tourings.map(t => ({ name: (t.nama_touring || t.title), peserta: t.peserta_count || 0 }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={getShortName} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                itemStyle={{ color: '#10b981' }}
              />
              <Bar dataKey="peserta" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* TABEL AGENDA */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-emerald-400" /> Agenda Jadwal Touring
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <input 
              type="text" 
              placeholder="Cari event atau tujuan..."
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500 w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500 w-full sm:w-40"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="Semua">Semua Status</option>
              <option value="Akan Datang">Akan Datang</option>
              <option value="Penuh">Penuh</option>
              <option value="Selesai">Selesai</option>
            </select>
            <button onClick={handleExportExcel} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition flex items-center gap-2 whitespace-nowrap shadow-lg shadow-emerald-900/20">
              <Download className="w-4 h-4" /> Export Excel
            </button>
          </div>
        </div>
        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-800">
                  {['','Nama Event','Tujuan','Tanggal','Kuota','Status','Deskripsi','Aksi'].map((h, i) => (
                    <th key={i} className="py-3 px-4 text-left">
                      {h !== '' && <div className="skeleton-shimmer h-3 w-16 rounded" />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1,2,3,4].map(i => <SkeletonRow key={i} cols={8} />)}
              </tbody>
            </table>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-950/50 border border-red-900 text-red-400 rounded-lg text-center text-sm">{error}</div>
        ) : filteredTourings.length === 0 ? (
          <div className="text-center py-10 text-slate-500 border border-dashed border-slate-800 rounded-xl">
            Belum ada agenda touring yang ditemukan.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center"></th>
                  <th className="py-3 px-4 cursor-pointer hover:text-emerald-400 transition" onClick={() => handleSort('title')}>Nama Event {sortField === 'title' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</th>
                  <th className="py-3 px-4 cursor-pointer hover:text-emerald-400 transition" onClick={() => handleSort('destination')}>Tujuan {sortField === 'destination' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</th>
                  <th className="py-3 px-4 cursor-pointer hover:text-emerald-400 transition" onClick={() => handleSort('departure_date')}>Tanggal {sortField === 'departure_date' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</th>
                  <th className="py-3 px-4 cursor-pointer hover:text-emerald-400 transition" onClick={() => handleSort('max_participants')}>Kuota {sortField === 'max_participants' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Deskripsi</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {filteredTourings.map((item) => {
                  const tanggalRaw = item.tanggal || item.departure_date;
                  const kuota = item.kuota || item.max_participants || 0;
                  const count = item.peserta_count || 0;
                  const status = getStatusBadge(tanggalRaw, kuota, count);
                  const isExpanded = expandedRow === item.id;
                  
                  return (
                    <React.Fragment key={item.id}>
                    <tr className={`hover:bg-slate-800/40 transition ${isExpanded ? 'bg-slate-800/30' : ''}`}>
                      <td className="py-3.5 px-4 text-center">
                        <button onClick={() => setExpandedRow(isExpanded ? null : item.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer">
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-400 whitespace-nowrap">{item.nama_touring || item.title}</td>
                      <td className="py-3.5 px-4 text-slate-300">{item.tujuan || item.destination}</td>
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">{formatTanggal(tanggalRaw)}</td>
                      <td className="py-3.5 px-4 text-slate-400 text-center">{count} / {kuota || '-'}</td>
                      <td className="py-3.5 px-4">
                        {status && (
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${status.cls}`}>{status.label}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 max-w-[180px] truncate">{item.deskripsi || item.description}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                          {/* Gabung - hanya untuk user biasa */}
                          <button onClick={() => openGabung(item)}
                            className="inline-flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition whitespace-nowrap">
                            <UserPlus className="w-3.5 h-3.5" /> Gabung
                          </button>
                          {/* Diskusi - semua */}
                          <button onClick={() => openDiskusi(item)}
                            className="inline-flex items-center gap-1.5 bg-indigo-500/10 hover:bg-indigo-500/25 text-indigo-400 border border-indigo-500/30 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition whitespace-nowrap">
                            <MessageSquare className="w-3.5 h-3.5" /> Forum
                          </button>
                          {/* Admin only */}
                          {role === 'admin' && (<>
                            <button onClick={() => openPeserta(item)}
                              className="inline-flex items-center gap-1.5 bg-sky-500/10 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition whitespace-nowrap">
                              <Users className="w-3.5 h-3.5" /> Peserta
                            </button>
                            <button onClick={() => openEdit(item)}
                              className="inline-flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition whitespace-nowrap">
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button onClick={() => handleDelete(item)}
                              className="inline-flex items-center justify-center w-7 h-7 bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/30 rounded-lg transition whitespace-nowrap">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>)}
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-800/10 border-b border-slate-800/50">
                        <td colSpan="8" className="p-0">
                          <div className="p-5 border-l-4 border-emerald-500 bg-slate-800/20 shadow-inner">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Info Lengkap</h4>
                                <ul className="space-y-2 text-sm text-slate-300">
                                  <li><span className="text-slate-500 inline-block w-24">Tujuan:</span> {item.tujuan || item.destination}</li>
                                  <li><span className="text-slate-500 inline-block w-24">Tanggal:</span> {formatTanggal(tanggalRaw)}</li>
                                  <li><span className="text-slate-500 inline-block w-24">Kuota:</span> <span className="font-semibold text-emerald-400">{count}</span> dari {kuota} peserta</li>
                                  <li><span className="text-slate-500 inline-block w-24">Status:</span> {status?.label}</li>
                                </ul>
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Deskripsi Agenda</h4>
                                <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 whitespace-pre-wrap shadow-sm">
                                  {item.deskripsi || item.description || 'Tidak ada deskripsi.'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-slate-800 gap-4">
            <span className="text-sm text-slate-400">Halaman {page} dari {totalPages}</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 hover:bg-slate-700 transition font-medium text-sm shadow-md"
              >
                Sebelumnya
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                disabled={page === totalPages}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 hover:bg-slate-700 transition font-medium text-sm shadow-md"
              >
                Selanjutnya
              </button>
            </div>
          </div>
          </>
        )}
      </div>

      {/* ═══ MODAL: GABUNG TOURING ═══ */}
      {gabungModal && (
        <Modal onClose={closeGabung} maxWidth="max-w-md">
          <ModalHeader title={<span className="flex items-center gap-2"><UserPlus className="w-5 h-5 text-emerald-400" /> Daftar Gabung Touring</span>} subtitle={gabungModal.nama} onClose={closeGabung} />
          <form onSubmit={handleGabungSubmit} className="p-5 space-y-4">
            <p className="text-slate-400 text-sm">Isi data kendaraan yang akan Anda bawa pada agenda ini.</p>
            {gabungMsg.text && (
              <div className={`p-3 rounded-lg text-sm border flex items-start gap-2 ${gabungMsg.isError ? 'bg-red-950/40 border-red-900 text-red-400' : 'bg-emerald-950/40 border-emerald-900 text-emerald-400'}`}>
                <span>{gabungMsg.isError ? '⚠️' : '✅'}</span><span>{gabungMsg.text}</span>
              </div>
            )}
            {myVehicles.length > 0 && (
              <div>
                <label className="block text-slate-400 text-xs font-semibold uppercase mb-1.5">Pilih dari Garasi Motor</label>
                <select 
                  onChange={(e) => {
                    const v = myVehicles.find(x => x.id.toString() === e.target.value);
                    if (v) setGabungForm({...gabungForm, bike_model: v.bike_model, license_plate: v.license_plate});
                    else setGabungForm({...gabungForm, bike_model: '', license_plate: ''});
                  }}
                  className="w-full bg-slate-900 border border-emerald-500/50 text-emerald-400 font-bold rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-400 text-sm mb-4"
                >
                  <option value="">-- Ketik manual atau pilih motor --</option>
                  {myVehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.bike_model} ({v.license_plate})</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase mb-1.5">Model Kendaraan / Motor</label>
              <input type="text" value={gabungForm.bike_model} required placeholder="Contoh: Honda CB150R"
                onChange={(e) => setGabungForm({...gabungForm, bike_model: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 text-sm" />
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase mb-1.5">Plat Nomor</label>
              <input type="text" value={gabungForm.license_plate} required placeholder="Contoh: D 1234 ABC"
                onChange={(e) => setGabungForm({...gabungForm, license_plate: e.target.value.toUpperCase()})}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 text-sm font-mono tracking-wider" />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={closeGabung} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-lg transition text-sm">Batal</button>
              <button type="submit" disabled={gabungLoading || (!gabungMsg.isError && !!gabungMsg.text)}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 font-bold py-2.5 rounded-lg transition text-sm">
                {gabungLoading ? 'Mendaftar...' : '✓ Konfirmasi Gabung'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ═══ MODAL: EDIT AGENDA (ADMIN) ═══ */}
      {editModal && (
        <Modal onClose={closeEdit} maxWidth="max-w-lg">
          <ModalHeader title={<span className="flex items-center gap-2"><Edit className="w-5 h-5 text-amber-400" /> Edit Agenda Touring</span>} subtitle={editModal.nama} subtitleColor="text-amber-400" onClose={closeEdit} />
          <form onSubmit={handleEditSubmit} className="p-5 space-y-4 overflow-y-auto">
            {editMsg.text && (
              <div className={`p-3 rounded-lg text-sm border ${editMsg.isError ? 'bg-red-950/40 border-red-900 text-red-400' : 'bg-emerald-950/40 border-emerald-900 text-emerald-400'}`}>
                {editMsg.text}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[['nama_touring','Nama Event','text'],['tujuan','Tujuan','text'],['tanggal','Tanggal','date'],['kuota','Kuota','number']].map(([k,l,t]) => (
                <div key={k}>
                  <label className="block text-slate-400 text-xs font-semibold uppercase mb-1">{l}</label>
                  <input type={t} value={editForm[k] || ''} required min={t==='number'?1:undefined}
                    onChange={(e) => setEditForm({...editForm, [k]: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500 text-sm" />
                </div>
              ))}
              <div className="md:col-span-2">
                <label className="block text-slate-400 text-xs font-semibold uppercase mb-1">Deskripsi</label>
                <input type="text" value={editForm.deskripsi || ''} required
                  onChange={(e) => setEditForm({...editForm, deskripsi: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500 text-sm" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={closeEdit} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-lg transition text-sm">Batal</button>
              <button type="submit" disabled={editLoading}
                className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 font-bold py-2.5 rounded-lg transition text-sm">
                {editLoading ? 'Menyimpan...' : '✓ Simpan Perubahan'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ═══ MODAL: KONFIRMASI ═══ */}
      {confirmDialog && (
        <Modal onClose={() => setConfirmDialog(null)} maxWidth="max-w-sm" zIndex="z-[70]">
          <ModalHeader title={confirmDialog.title} onClose={() => setConfirmDialog(null)} />
          <div className="p-5">
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDialog(null)} 
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-lg transition text-sm">
                Batal
              </button>
              <button onClick={confirmDialog.onConfirm} 
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-lg transition text-sm">
                Yakin
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ═══ MODAL: PESERTA (ADMIN) ═══ */}
      {pesertaModal && (
        <Modal onClose={closePeserta} maxWidth="max-w-xl">
          <ModalHeader title={<span className="flex items-center gap-2"><Users className="w-5 h-5 text-sky-400" /> Daftar Peserta</span>} subtitle={pesertaModal.nama} subtitleColor="text-sky-400" onClose={closePeserta} />
          <div className="p-5 overflow-y-auto">
            {pesertaLoading ? (
              <div className="text-center py-8 text-slate-500 animate-pulse">Memuat peserta...</div>
            ) : pesertaList.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <p className="text-2xl mb-2">👤</p>
                <p className="text-sm">Belum ada peserta yang mendaftar.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-slate-400 text-xs mb-3">Total: <span className="text-white font-bold">{pesertaList.length}</span> peserta terdaftar</p>
                {pesertaList.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-4 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3">
                    <div className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 font-bold text-sm flex-shrink-0">{i+1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm">{p.user?.username || `User #${p.user_id}`}</p>
                      <p className="text-slate-400 text-xs">{p.bike_model} · <span className="font-mono text-slate-300">{p.license_plate}</span></p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <p className="text-slate-600 text-[10px]">{formatWaktu(p.registered_at)}</p>
                      <button onClick={() => handleKickPeserta(p.id)}
                        className="bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-xs font-semibold px-2 py-1 rounded transition whitespace-nowrap">
                        Keluarkan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ═══ MODAL: DISKUSI ═══ */}
      {diskusiModal && (
        <Modal onClose={closeDiskusi} maxWidth="max-w-lg">
          <ModalHeader title={<span className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-indigo-400" /> Forum Diskusi</span>} subtitle={diskusiModal.nama} subtitleColor="text-indigo-400" onClose={closeDiskusi} />
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: '280px' }}>
            {diskusiLoading ? (
              <div className="text-center py-8 text-slate-500 text-sm animate-pulse">Memuat diskusi...</div>
            ) : diskusiList.length === 0 ? (
              <div className="text-center py-10 flex flex-col items-center gap-2">
                <MessageSquare className="w-12 h-12 text-slate-600 mb-2" />
                <p className="text-slate-500 text-sm">Belum ada diskusi. Jadilah yang pertama!</p>
              </div>
            ) : diskusiList.map((msg, index) => {
              const isSelf = msg.user?.username === username;
              const prevMsg = diskusiList[index - 1];
              const nextMsg = diskusiList[index + 1];
              const isSameUserAsPrev = prevMsg && prevMsg.user?.username === msg.user?.username;
              const isSameUserAsNext = nextMsg && nextMsg.user?.username === msg.user?.username;
              
              let bubbleClass = isSelf 
                ? 'bg-emerald-500 text-slate-950 font-medium' 
                : 'bg-slate-800 text-slate-200 border border-slate-700/50 shadow-sm';

              // Rounded corners for consecutive messages
              if (isSelf) {
                bubbleClass += ` rounded-2xl ${isSameUserAsPrev ? 'rounded-tr-sm' : ''} ${isSameUserAsNext ? 'rounded-br-sm' : 'rounded-br-none'}`;
              } else {
                bubbleClass += ` rounded-2xl ${isSameUserAsPrev ? 'rounded-tl-sm' : ''} ${isSameUserAsNext ? 'rounded-bl-sm' : 'rounded-bl-none'}`;
              }

              return (
                <div key={msg.id} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} ${isSameUserAsNext ? 'mb-1' : 'mb-4'}`}>
                  {!isSameUserAsPrev && (
                    <span className="text-xs text-slate-400 mb-1 px-1 font-semibold">{isSelf ? 'Anda' : (msg.user?.username || 'User')}</span>
                  )}
                  <div className={`max-w-[85%] md:max-w-[75%] px-4 py-2.5 text-sm leading-relaxed ${bubbleClass}`}>
                    {msg.message}
                    <span className={`block text-[10px] mt-1 opacity-70 text-right font-medium tracking-wide ${isSelf ? 'text-emerald-950' : 'text-slate-400'}`}>
                      {new Date(msg.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={chatBottomRef} />
          </div>
          <form onSubmit={handleSendDiskusi} className="p-4 border-t border-slate-800 flex gap-2 flex-shrink-0">
            <input type="text" value={diskusiInput} onChange={(e) => setDiskusiInput(e.target.value)}
              placeholder="Tulis pesan diskusi..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-500 transition" />
            <button type="submit" disabled={diskusiSending || !diskusiInput.trim()}
              className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold px-4 py-2.5 rounded-xl transition text-sm">
              {diskusiSending ? '...' : '➤'}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}

export default Dashboard;