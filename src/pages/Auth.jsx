import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useToast } from '../components/Toast';
import { useTheme } from '../components/ThemeContext';
import Logo from '../components/Logo';
import { Sun, Moon, User, ShieldCheck, Rocket, LogIn } from 'lucide-react';

// ─── Ikon ─────────────────────────────────────────────────────────
const IconUser = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const IconLock = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const IconEye = ({ open }) => open ? (
  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
) : (
  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const IconShield = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const getPasswordStrength = (pass) => {
  if (!pass) return { score: 0, label: '', color: 'bg-slate-700', textColor: 'text-slate-500' };
  let score = 0;
  if (pass.length >= 8) score += 1;
  if (/[A-Z]/.test(pass)) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;
  
  if (score <= 1) return { score, label: 'Lemah', color: 'bg-red-500', textColor: 'text-red-400' };
  if (score === 2 || score === 3) return { score, label: 'Sedang', color: 'bg-amber-500', textColor: 'text-amber-400' };
  return { score, label: 'Kuat', color: 'bg-emerald-500', textColor: 'text-emerald-400' };
};

// ─── Input Field ──────────────────────────────────────────────────
function InputField({ icon, label, type, value, onChange, name, placeholder, showToggle, onToggle, showPass }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
      <div className="relative group">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors duration-200">
          {icon}
        </span>
        <input
          type={showToggle ? (showPass ? 'text' : 'password') : type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-11 pr-10 py-3 text-slate-100 placeholder-slate-600
            focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50
            hover:border-slate-600 transition-all duration-200 text-sm"
        />
        {showToggle && (
          <button type="button" onClick={onToggle}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
            <IconEye open={showPass} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Komponen Utama Auth ──────────────────────────────────────────
function Auth() {
  const toast = useToast();
  const navigate = useNavigate();
  const { isDark, toggle: toggleTheme } = useTheme();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', confirmPassword: '', role: 'user' });
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const switchMode = () => {
    setIsRegister(!isRegister);
    setFormData({ username: '', password: '', confirmPassword: '', role: 'user' });
    setShowPass(false);
    setShowConfirmPass(false);
    setAgreeTerms(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRegister) {
      if (formData.password !== formData.confirmPassword) {
        toast.error('Konfirmasi password tidak cocok.');
        return;
      }
      if (!agreeTerms) {
        toast.error('Anda harus menyetujui Syarat & Ketentuan.');
        return;
      }
    }
    setLoading(true);
    try {
      if (isRegister) {
        await API.post('/register', formData);
        toast.success('Registrasi berhasil! Silakan login.');
        switchMode();
      } else {
        const res = await API.post('/login', { username: formData.username, password: formData.password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.role);
        localStorage.setItem('username', formData.username.trim());
        localStorage.setItem('profile_photo', res.data.profile_photo || '');
        toast.success(`Selamat datang, ${formData.username}!`);
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex relative overflow-hidden">

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-indigo-500/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/3 blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#64ffda 1px,transparent 1px),linear-gradient(to right,#64ffda 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition backdrop-blur-sm shadow-lg"
        title={isDark ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
      >
        {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
      </button>

      {/* Split Layout Container */}
      <div className="w-full min-h-screen flex flex-col lg:flex-row relative z-10">

        {/* ─── KIRI: DESKRIPSI SINGKAT ─── */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-slate-900/30 backdrop-blur-sm border-r border-slate-800 flex-col justify-center items-start p-12 lg:p-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />

          <div className="mb-8 relative z-10 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Logo className="w-20 h-20" />
          </div>

          <h1 className="text-5xl xl:text-6xl font-black text-white tracking-tight mb-6 leading-tight relative z-10">
            Oto<span className="text-emerald-400">Meet</span>
          </h1>

          <p className="text-slate-300 text-lg xl:text-xl font-light mb-10 max-w-lg leading-relaxed relative z-10">
            Platform manajemen komunitas touring motor terbaik di Indonesia. Kelola agenda, pantau peserta, dan berdiskusi secara real-time dalam satu tempat yang elegan.
          </p>

          <div className="flex flex-wrap gap-4 relative z-10">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50 text-slate-300 text-sm font-medium"><span className="text-emerald-400">✓</span> Real-time Data</div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50 text-slate-300 text-sm font-medium"><span className="text-emerald-400">✓</span> Secure JWT</div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50 text-slate-300 text-sm font-medium"><span className="text-emerald-400">✓</span> Modern UI</div>
          </div>
        </div>

        {/* ─── KANAN: FORM ─── */}
        <div className="w-full lg:w-1/2 xl:w-2/5 flex flex-col justify-center p-6 sm:p-12 relative z-10 min-h-screen">
          <div className="w-full max-w-md mx-auto animate-fadeIn">

            {/* Logo untuk layar kecil (Mobile/Tablet) */}
            <div className="lg:hidden text-center mb-10 flex flex-col items-center">
              <div className="mb-4 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <Logo className="w-16 h-16" />
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight">
                Oto<span className="text-emerald-400">Meet</span>
              </h1>
              <p className="text-slate-500 text-sm mt-1.5">Platform Manajemen Komunitas Touring</p>
            </div>

            {/* Card Form */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-8 shadow-2xl shadow-black/50">

              {/* Tab Switcher */}
              <div className="flex bg-slate-800/60 rounded-xl p-1 mb-7 border border-slate-700/50">
                <button onClick={() => isRegister && switchMode()}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${!isRegister ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-slate-200'
                    }`}>
                  Masuk
                </button>
                <button onClick={() => !isRegister && switchMode()}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${isRegister ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-slate-200'
                    }`}>
                  Daftar
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">

                <InputField
                  label="Username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Masukkan username Anda"
                  icon={<IconUser />}
                />

                <InputField
                  label="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Masukkan password Anda"
                  icon={<IconLock />}
                  showToggle
                  onToggle={() => setShowPass(!showPass)}
                  showPass={showPass}
                />

                {isRegister && (
                  <div className="pt-1 pb-2">
                    <div className="flex gap-1 h-1.5 mb-1.5">
                      {[1, 2, 3].map((level) => {
                        const strength = getPasswordStrength(formData.password);
                        const isActive = level === 1 ? strength.score >= 1 : level === 2 ? strength.score >= 2 : strength.score >= 4;
                        return (
                          <div key={level} className={`flex-1 rounded-full transition-colors duration-300 ${isActive ? strength.color : 'bg-slate-800'}`} />
                        );
                      })}
                    </div>
                    <p className={`text-[10px] uppercase font-bold tracking-wider ${getPasswordStrength(formData.password).textColor}`}>
                      {getPasswordStrength(formData.password).label || 'Kekuatan Password'}
                    </p>
                  </div>
                )}

                {isRegister && (
                  <InputField
                    label="Konfirmasi Password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Ulangi password Anda"
                    icon={<IconLock />}
                    showToggle
                    onToggle={() => setShowConfirmPass(!showConfirmPass)}
                    showPass={showConfirmPass}
                  />
                )}

                {isRegister && (
                  <label className="flex items-start gap-3 mt-4 mb-2 cursor-pointer group">
                    <div className="relative flex items-center justify-center mt-0.5">
                      <input type="checkbox" className="sr-only" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 ${agreeTerms ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'bg-slate-800 border-slate-600 text-transparent group-hover:border-emerald-500'}`}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 leading-relaxed">
                      Saya setuju dengan <a href="#" className="text-emerald-400 hover:underline" onClick={(e) => e.preventDefault()}>Syarat & Ketentuan</a> serta <a href="#" className="text-emerald-400 hover:underline" onClick={(e) => e.preventDefault()}>Kebijakan Privasi</a> OtoMeet.
                    </span>
                  </label>
                )}

                {/* Role selector dihapus - Semua akun baru otomatis menjadi 'user' */}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300
                disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500
                text-slate-950 font-bold py-3.5 rounded-xl transition-all duration-200 mt-2
                shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.01]
                active:scale-[0.99] text-sm tracking-wide flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {isRegister ? 'Mendaftarkan...' : 'Masuk...'}
                    </>
                  ) : (
                    isRegister 
                      ? <><Rocket className="w-5 h-5" /> Buat Akun Sekarang</>
                      : <><LogIn className="w-5 h-5" /> Masuk ke Dashboard</>
                  )}
                </button>

              </form>

              {/* Footer info */}
              {!isRegister && (
                <p className="text-center text-xs text-slate-600 mt-5 flex items-center justify-center gap-1.5">
                  <IconShield />
                  Login aman menggunakan JWT — sesi aktif selama 3 hari
                </p>
              )}
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-slate-700 mt-8">
              © 2025 OtoMeet · Platform Komunitas Touring Motor Indonesia
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Auth;