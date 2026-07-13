import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useToast } from '../components/Toast';
import { PlusCircle, Save, X } from 'lucide-react';

function TambahAgenda() {
  const navigate = useNavigate();
  const toast = useToast();
  const role = localStorage.getItem('role') || 'user';

  const [formData, setFormData] = useState({ nama_touring: '', tujuan: '', tanggal: '', deskripsi: '', kuota: '' });
  const [formMessage, setFormMessage] = useState({ text: '', isError: false });
  const [submitting, setSubmitting] = useState(false);

  // Jika bukan admin, sebaiknya tidak bisa lihat form ini (meski rute diprotect, ini double check)
  if (role !== 'admin') {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center shadow-xl">
        <p className="text-red-400">Anda tidak memiliki akses ke halaman ini.</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage({ text: '', isError: false });
    setSubmitting(true);
    try {
      await API.post('/api/touring', { ...formData, kuota: parseInt(formData.kuota, 10) || 0 });
      setFormMessage({ text: 'Berhasil menambahkan agenda!', isError: false });
      toast.success('Agenda berhasil ditambahkan!');
      setFormData({ nama_touring: '', tujuan: '', tanggal: '', deskripsi: '', kuota: '' });
      // Redirect ke dashboard setelah sukses
      navigate('/dashboard');
    } catch (err) {
      setFormMessage({ text: err.response?.data?.message || 'Gagal menyimpan agenda.', isError: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6 shadow-xl max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
        <PlusCircle className="w-6 h-6" /> Tambah Agenda Touring Baru
      </h2>
      
      {formMessage.text && (
        <div className={`p-3 rounded-lg text-sm mb-4 border ${formMessage.isError ? 'bg-red-950/40 border-red-900 text-red-400' : 'bg-emerald-950/40 border-emerald-900 text-emerald-400'}`}>
          {formMessage.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[['nama_touring','Nama Event / Touring','text','Contoh: Touring Wisata Pangandaran'],
          ['tujuan','Kota / Tempat Tujuan','text','Contoh: Pantai Barat Pangandaran'],
          ['tanggal','Tanggal Pelaksanaan','date',''],
          ['kuota','Kuota Peserta','number','Contoh: 50']
        ].map(([name, label, type, ph]) => (
          <div key={name}>
            <label className="block text-slate-400 text-xs font-semibold uppercase mb-1">{label}</label>
            <input type={type} name={name} value={formData[name]} required min={type==='number'?1:undefined}
              onChange={(e) => setFormData({...formData, [name]: e.target.value})} placeholder={ph}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 text-sm" />
          </div>
        ))}
        <div className="md:col-span-2">
          <label className="block text-slate-400 text-xs font-semibold uppercase mb-1">Deskripsi Kegiatan</label>
          <input type="text" name="deskripsi" value={formData.deskripsi} required
            onChange={(e) => setFormData({...formData, deskripsi: e.target.value})} placeholder="Contoh: Kumpul di basecamp jam 07.00 WIB"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 text-sm" />
        </div>
        <div className="md:col-span-2 flex justify-end">
          <button type="button" onClick={() => navigate('/dashboard')}
            className="mr-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-6 py-2.5 rounded-lg transition text-sm flex items-center gap-2">
            <X className="w-4 h-4" /> Batal
          </button>
          <button type="submit" disabled={submitting}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-slate-950 font-bold px-6 py-2.5 rounded-lg transition text-sm flex items-center gap-2">
            {submitting ? 'Menyimpan...' : <><Save className="w-4 h-4" /> Submit Agenda</>}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TambahAgenda;
