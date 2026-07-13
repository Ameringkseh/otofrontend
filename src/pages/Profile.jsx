import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { useToast } from '../components/Toast';
import { ShieldCheck, User, Contact, Save, Lock, Eye, EyeOff, Wrench, X, AlertTriangle } from 'lucide-react';

function Profile() {
  const toast = useToast();
  const username = localStorage.getItem('username') || 'User';
  const role = localStorage.getItem('role') || 'user';

  // --- States ---
  const [profileForm, setProfileForm] = useState({ full_name: '', email: '', phone_number: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  const [pwdForm, setPwdForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  const [vehicles, setVehicles] = useState([]);
  const [vehicleForm, setVehicleForm] = useState({ bike_model: '', license_plate: '' });
  const [vehicleLoading, setVehicleLoading] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  // --- Fetch Initial Data ---
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get('/api/me');
      const data = res.data.data; // utils.RespondSuccess wraps in .data
      setProfileForm({
        full_name: data.full_name || '',
        email: data.email || '',
        phone_number: data.phone_number || ''
      });
      setVehicles(data.vehicles || []);
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengambil data profil');
    }
  };

  // --- Handlers ---
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await API.put('/api/profile', profileForm);
      toast.success('Profil berhasil diperbarui!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePwdSubmit = async (e) => {
    e.preventDefault();
    if (pwdForm.new_password !== pwdForm.confirm_password) {
      toast.error('Password baru dan konfirmasi tidak cocok!');
      return;
    }
    if (pwdForm.new_password.length < 6) {
      toast.warning('Password baru minimal 6 karakter.');
      return;
    }
    setPwdLoading(true);
    try {
      await API.put('/api/change-password', {
        old_password: pwdForm.old_password,
        new_password: pwdForm.new_password,
      });
      toast.success('Password berhasil diperbarui! 🎉');
      setPwdForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah password.');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    setVehicleLoading(true);
    try {
      await API.post('/api/vehicles', vehicleForm);
      toast.success('Kendaraan berhasil ditambahkan!');
      setVehicleForm({ bike_model: '', license_plate: '' });
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan kendaraan');
    } finally {
      setVehicleLoading(false);
    }
  };

  const handleDeleteVehicle = (v) => {
    setVehicleToDelete(v);
  };

  const confirmDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    try {
      await API.delete(`/api/vehicles/${vehicleToDelete.id}`);
      toast.success('Kendaraan berhasil dihapus');
      fetchProfile();
    } catch (err) {
      toast.error('Gagal menghapus kendaraan');
    } finally {
      setVehicleToDelete(null);
    }
  };

  const strength = (pwd) => {
    if (!pwd) return { w: '0%', color: '', label: '' };
    let s = 0;
    if (pwd.length >= 6) s++;
    if (pwd.length >= 10) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    const map = [
      { w: '20%', color: 'bg-red-500',    label: 'Sangat Lemah' },
      { w: '40%', color: 'bg-amber-500',  label: 'Lemah' },
      { w: '60%', color: 'bg-yellow-400', label: 'Cukup' },
      { w: '80%', color: 'bg-emerald-400',label: 'Kuat' },
      { w: '100%',color: 'bg-emerald-500',label: 'Sangat Kuat' },
    ];
    return map[s - 1] || map[0];
  };

  const str = strength(pwdForm.new_password);

  return (
    <div className="max-w-6xl mx-auto mt-6 animate-fadeIn">
      
      {/* Header Profil */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 mb-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 flex-shrink-0 text-slate-900">
          {role === 'admin' ? <ShieldCheck className="w-12 h-12" /> : <User className="w-12 h-12" />}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-2xl font-bold text-white mb-2">{username}</h2>
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase px-3 py-1.5 rounded-full ${
            role === 'admin'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
          }`}>
            {role === 'admin' ? <ShieldCheck className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />} {role === 'admin' ? 'Administrator' : 'Member'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* KOLOM KIRI: Data Profil & Password */}
        <div className="space-y-6">
          
          {/* Kelengkapan Profil */}
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Contact className="w-5 h-5 text-emerald-400" /> Data Diri
            </h3>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
                <input type="text" value={profileForm.full_name} onChange={(e) => setProfileForm({...profileForm, full_name: e.target.value})}
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 text-sm transition"
                  placeholder="Masukkan nama lengkap" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 text-sm transition"
                  placeholder="contoh@otomeet.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">No. Telepon / WhatsApp</label>
                <input type="tel" value={profileForm.phone_number} onChange={(e) => setProfileForm({...profileForm, phone_number: e.target.value})}
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 text-sm transition"
                  placeholder="08123456789" />
              </div>
              <button type="submit" disabled={profileLoading}
                className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-bold py-2.5 rounded-xl transition-all duration-200 text-sm">
                {profileLoading ? 'Menyimpan...' : <><Save className="w-4 h-4" /> Simpan Data Diri</>}
              </button>
            </form>
          </div>

          {/* Ubah Password */}
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-400" /> Ubah Password
            </h3>
            <form onSubmit={handlePwdSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Password Saat Ini</label>
                <div className="relative">
                  <input type={showOld ? 'text' : 'password'} value={pwdForm.old_password} onChange={(e) => setPwdForm({...pwdForm, old_password: e.target.value})} required
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 pr-10 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 text-sm transition" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition text-xs">
                    {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Password Baru</label>
                <div className="relative">
                  <input type={showNew ? 'text' : 'password'} value={pwdForm.new_password} onChange={(e) => setPwdForm({...pwdForm, new_password: e.target.value})} required
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 pr-10 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 text-sm transition" placeholder="Min. 6 karakter" />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition text-xs">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {pwdForm.new_password && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all duration-300 ${str.color}`} style={{ width: str.w }} /></div>
                    <span className="text-xs text-slate-500 w-24 text-right">{str.label}</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Konfirmasi Password Baru</label>
                <input type="password" value={pwdForm.confirm_password} onChange={(e) => setPwdForm({...pwdForm, confirm_password: e.target.value})} required placeholder="Ulangi password baru"
                  className={`w-full bg-slate-800/60 border rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 text-sm transition ${pwdForm.confirm_password && pwdForm.new_password !== pwdForm.confirm_password ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/40' : 'border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/40'}`} />
                {pwdForm.confirm_password && pwdForm.new_password !== pwdForm.confirm_password && <p className="text-xs text-red-400 mt-1.5">⚠️ Password tidak cocok</p>}
              </div>
              <button type="submit" disabled={pwdLoading} className="w-full flex justify-center items-center gap-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-bold py-2.5 rounded-xl transition-all duration-200 text-sm">{pwdLoading ? 'Menyimpan...' : <><Lock className="w-4 h-4" /> Ganti Password</>}</button>
            </form>
          </div>
        </div>

        {/* KOLOM KANAN: Garasi Motor */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl flex flex-col">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-emerald-400" /> Garasi Motor Saya
          </h3>
          
          {/* List Motor */}
          <div className="space-y-3 mb-6 flex-1">
            {vehicles.length === 0 ? (
              <div className="text-center py-8 bg-slate-800/30 rounded-xl border border-slate-800 border-dashed">
                <Wrench className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <p className="text-slate-500 text-sm">Belum ada motor yang disimpan.</p>
              </div>
            ) : (
              vehicles.map(v => (
                <div key={v.id} className="flex justify-between items-center bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-emerald-400 font-bold text-sm uppercase">{v.bike_model}</p>
                    <p className="text-slate-400 font-mono text-xs">{v.license_plate}</p>
                  </div>
                  <button onClick={() => handleDeleteVehicle(v)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Form Tambah Motor */}
          <div className="border-t border-slate-800 pt-5">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Tambah Motor Baru</h4>
            <form onSubmit={handleAddVehicle} className="space-y-3">
              <div>
                <input type="text" value={vehicleForm.bike_model} onChange={(e) => setVehicleForm({...vehicleForm, bike_model: e.target.value})} required
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 text-sm transition"
                  placeholder="Model Motor (ex: Honda PCX)" />
              </div>
              <div>
                <input type="text" value={vehicleForm.license_plate} onChange={(e) => setVehicleForm({...vehicleForm, license_plate: e.target.value})} required
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 text-sm transition"
                  placeholder="Plat Nomor (ex: B 1234 ABC)" />
              </div>
              <button type="submit" disabled={vehicleLoading}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-bold py-2.5 rounded-xl transition-all duration-200 text-sm shadow-lg shadow-emerald-500/20">
                {vehicleLoading ? 'Menambahkan...' : '+ Tambah ke Garasi'}
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* ═══ MODAL: KONFIRMASI HAPUS KENDARAAN ═══ */}
      {vehicleToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fadeIn">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setVehicleToDelete(null)}></div>
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl overflow-hidden animate-slideUp p-6 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Hapus Kendaraan?</h3>
            <p className="text-slate-400 text-sm mb-6">
              Anda yakin ingin menghapus <strong>{vehicleToDelete.bike_model}</strong> dari garasi?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setVehicleToDelete(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl transition text-sm">
                Batal
              </button>
              <button onClick={confirmDeleteVehicle}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl transition text-sm shadow-lg shadow-red-500/20">
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
