import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import { useToast } from './Toast';
import Logo from './Logo';
import { Home, PlusCircle, ClipboardList, User, ShieldCheck, Settings, Key, Sun, Moon, Copy, X, Menu, LogOut, ChevronUp, ChevronDown } from 'lucide-react';

function DashboardLayout() {
  const { isDark, toggle: toggleTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  
  const menuRef = useRef(null);
  
  const token = localStorage.getItem('token') || '';
  const username = localStorage.getItem('username') || 'User';
  const role = localStorage.getItem('role') || 'user';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/auth');
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row">
      
      {/* ─── SIDEBAR (MAIN NAVIGATION) ─── */}
      <div className={`${isSidebarOpen ? 'w-full md:w-72 border-r' : 'w-0 border-r-0'} bg-slate-900 border-slate-800 flex flex-col flex-shrink-0 z-30 shadow-2xl md:shadow-none transition-all duration-300 overflow-hidden`}>
        
        {/* Logo & Header Sidebar */}
        <div className="p-6 pb-4 border-b border-slate-800/50 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <Logo className="w-10 h-10 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
            <h1 className="text-2xl font-black text-white tracking-tight">
              Oto<span className="text-emerald-400">Meet</span>
            </h1>
          </div>
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mt-6 mb-2">Main Navigation</p>
        </div>

        {/* Navigasi Links */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {/* Dashboard Utama */}
          <NavLink to="/dashboard" end
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 font-medium'}`}>
            <Home className="w-5 h-5" />
            <span>Dashboard</span>
          </NavLink>

          {/* Tambah Agenda (Admin Only) */}
          {role === 'admin' && (
            <NavLink to="/dashboard/tambah-agenda"
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 font-medium'}`}>
              <PlusCircle className="w-5 h-5" />
              <span>Tambah Agenda</span>
            </NavLink>
          )}

          {/* Touring Saya */}
          <NavLink to="/dashboard/touring-saya"
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 font-medium'}`}>
            <ClipboardList className="w-5 h-5" />
            <span>Touring Saya</span>
          </NavLink>
        </nav>

        {/* Kotak Pengaturan Akun di Bawah Sidebar */}
        <div className="p-4 mt-auto border-t border-slate-800/50 relative" ref={menuRef}>
          
          {/* POPUP MENU */}
          {showProfileMenu && (
            <div className="absolute bottom-[calc(100%+0.5rem)] left-4 right-4 bg-slate-800 border border-slate-700 shadow-2xl rounded-2xl overflow-hidden animate-slideUp z-50 p-2 flex flex-col gap-1">
              <Link 
                to="/dashboard/profil"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-400 transition text-sm font-medium"
              >
                <User className="w-4 h-4" /> Profil Saya
              </Link>
              <button 
                onClick={() => {
                  setShowTokenModal(true);
                  setShowProfileMenu(false);
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-200 hover:bg-indigo-500/10 hover:text-indigo-400 transition text-sm font-medium w-full text-left"
              >
                <Key className="w-4 h-4" /> Lihat Token
              </button>
              <button 
                onClick={toggleTheme}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-200 hover:bg-amber-500/10 hover:text-amber-400 transition text-sm font-medium w-full text-left"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />} {isDark ? 'Mode Terang' : 'Mode Gelap'}
              </button>
            </div>
          )}

          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`w-full flex items-center gap-3 border rounded-2xl p-3 transition text-left group ${showProfileMenu ? 'bg-slate-800 border-slate-600' : 'bg-slate-800/40 hover:bg-slate-800 border-slate-700/50'}`}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg flex-shrink-0 text-slate-900">
              {role === 'admin' ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{username}</p>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">{role}</p>
            </div>
            <div className={`text-slate-500 transition ${showProfileMenu ? 'text-emerald-400' : 'group-hover:text-emerald-400'}`}>
              {showProfileMenu ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </div>
          </button>
        </div>
      </div>

      {/* ─── MAIN CONTENT AREA ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950">
        
        {/* TOP HEADER */}
        <header className="flex justify-between items-center px-8 py-5 border-b border-slate-800/60 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="text-slate-400 hover:text-white bg-slate-800 border border-slate-700 hover:bg-slate-700 p-2 rounded-xl transition shadow-sm flex items-center justify-center">
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-200 hidden sm:block">Panel Kontrol</h2>
          </div>
          <div className="flex-1"></div>
          
          <div className="flex items-center gap-4">
            {/* Logout Button */}
            <button onClick={handleLogout}
              className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/30 font-bold px-4 py-2.5 rounded-xl transition text-sm flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Log Out
            </button>
          </div>
        </header>

        {/* PAGE CONTENT (Outlet) */}
        <main className="flex-1 flex flex-col overflow-y-auto animate-fadeIn relative">
          <div className="p-6 md:p-8 flex-1 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
          
          {/* FOOTER ELEGAN */}
          <footer className="border-t border-slate-800/60 bg-slate-900/30 py-6 mt-auto">
            <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 opacity-80">
                <Logo className="w-6 h-6" />
                <span className="text-sm font-bold text-slate-300">Oto<span className="text-emerald-500">Meet</span></span>
              </div>
              <p className="text-xs text-slate-500 font-medium text-center">
                © {new Date().getFullYear()} OtoMeet. Dibuat dengan ❤️ untuk komunitas motor Indonesia.
              </p>
            </div>
          </footer>
        </main>
      </div>

      {/* ═══ MODAL: LIHAT TOKEN ═══ */}
      {showTokenModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowTokenModal(false)}></div>
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl overflow-hidden animate-slideUp">
            <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/40">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-400" /> JSON Web Token (JWT)
              </h3>
              <button onClick={() => setShowTokenModal(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-slate-400 text-sm mb-4">
                Ini adalah token akses otentikasi Anda yang digunakan untuk berkomunikasi dengan API. Jaga kerahasiaan token ini.
              </p>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-5 relative group">
                <p className="text-emerald-400 font-mono text-xs break-all leading-relaxed opacity-90 group-hover:opacity-100 transition">
                  {token}
                </p>
              </div>
              <div className="flex gap-3 mt-2">
                <button onClick={() => { navigator.clipboard.writeText(token); toast.success('Token berhasil disalin!'); }}
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2.5 rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
                  <Copy className="w-4 h-4" /> Salin Token Akses
                </button>
                <button onClick={() => setShowTokenModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl transition text-sm">
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardLayout;
