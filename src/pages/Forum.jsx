import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { MessageSquare, Send, Users, Calendar, ArrowLeft, User, ChevronDown, Edit2, Trash2, X, Check } from 'lucide-react';
import { useToast } from '../components/Toast';

export default function Forum() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [tourings, setTourings] = useState([]);
  const [activeTouring, setActiveTouring] = useState(null);
  
  const [messages, setMessages] = useState([]);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  
  const chatBottomRef = useRef(null);
  const lastMsgIdRef = useRef(0);
  const renderedLastMsgIdRef = useRef(0);
  const menuRef = useRef(null);
  
  const [unreadMsgId, setUnreadMsgId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const username = localStorage.getItem('username') || 'User';

  const [activeMenuId, setActiveMenuId] = useState(null);
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editInputVal, setEditInputVal] = useState('');
  const [isProcessingMsg, setIsProcessingMsg] = useState(false);

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  // 1. Minta Izin Notifikasi saat komponen pertama kali dimuat
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // 2. Ambil daftar touring yang diikuti untuk Sidebar kiri
  useEffect(() => {
    const fetchMyTourings = async () => {
      try {
        // Hanya ambil grup yang sudah diikuti user
        const res = await API.get('/api/my-touring');
        const data = Array.isArray(res.data) ? res.data : [];
        
        // Map dari model Registration -> Touring
        const joinedTourings = data.map(reg => reg.touring).filter(Boolean);
        setTourings(joinedTourings);
        
        // Cek URL params jika ada ?id=xxx
        const urlId = searchParams.get('id');
        if (urlId) {
          const selected = joinedTourings.find(t => t.id.toString() === urlId);
          if (selected) {
            setActiveTouring(selected);
          }
        }
      } catch (err) {
        console.error("Gagal memuat daftar touring", err);
      }
    };
    fetchMyTourings();
  }, [searchParams]);

  // 3. Auto-scroll ke bawah saat ada pesan baru
  useEffect(() => {
    if (messages.length > 0) {
      const currentLastId = messages[messages.length - 1].id;
      // Hanya scroll ke bawah JIKA ada id pesan baru (mencegah scroll paksa saat polling biasa)
      if (currentLastId !== renderedLastMsgIdRef.current) {
        if (chatBottomRef.current) {
          chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        renderedLastMsgIdRef.current = currentLastId;
      }
    }
  }, [messages]);

  // 4. Polling pesan untuk Active Touring & Push Notifications
  useEffect(() => {
    let interval;
    
    const fetchMessages = async (silent = false) => {
      if (!activeTouring) return;
      if (!silent) setLoadingMsg(true);
      
      try {
        const res = await API.get(`/api/touring/${activeTouring.id}/diskusi`);
        const data = Array.isArray(res.data) ? res.data : [];
        setMessages(data);
        
        if (data.length > 0) {
          const latestMsg = data[data.length - 1];
          lastMsgIdRef.current = latestMsg.id;

          if (!silent) {
            const lastReadStr = localStorage.getItem(`lastRead_${activeTouring.id}`);
            if (lastReadStr) {
              const lastReadId = parseInt(lastReadStr, 10);
              const unreadMsgs = data.filter(m => m.id > lastReadId);
              if (unreadMsgs.length > 0) {
                setUnreadMsgId(unreadMsgs[0].id);
                setUnreadCount(unreadMsgs.length);
              } else {
                setUnreadMsgId(null);
                setUnreadCount(0);
              }
            } else {
              setUnreadMsgId(null);
              setUnreadCount(0);
            }
            localStorage.setItem(`lastRead_${activeTouring.id}`, latestMsg.id.toString());
          } else {
            localStorage.setItem(`lastRead_${activeTouring.id}`, latestMsg.id.toString());
          }
        }
      } catch (err) {
        if (!silent) setMessages([]);
      } finally {
        if (!silent) setLoadingMsg(false);
      }
    };

    if (activeTouring) {
      lastMsgIdRef.current = 0; // Reset ID saat pindah grup
      renderedLastMsgIdRef.current = 0; // Reset tracker scroll
      fetchMessages(false); // Fetch awal (muncul loading)
      
      // Polling setiap 3 detik
      interval = setInterval(() => {
        fetchMessages(true); // Fetch diam-diam (tanpa loading)
      }, 3000);
    } else {
      setMessages([]);
    }

    return () => clearInterval(interval);
  }, [activeTouring, username]);

  // 5. Fungsi kirim pesan
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || !activeTouring) return;
    
    setSendingMsg(true);
    try {
      await API.post(`/api/touring/${activeTouring.id}/diskusi`, { message: inputMsg });
      setInputMsg('');
      
      // Paksa fetch ulang segera tanpa menunggu polling 3 detik
      const res = await API.get(`/api/touring/${activeTouring.id}/diskusi`);
      const data = Array.isArray(res.data) ? res.data : [];
      setMessages(data);
      if (data.length > 0) lastMsgIdRef.current = data[data.length - 1].id;
      
    } catch (err) {
      toast.error('Gagal mengirim pesan');
    } finally {
      setSendingMsg(false);
    }
  };

  const submitEditMessage = async (id) => {
    if (!editInputVal.trim()) return;
    setIsProcessingMsg(true);
    try {
      await API.put(`/api/diskusi/${id}`, { message: editInputVal });
      toast.success('Pesan diperbarui');
      setEditingMsgId(null);
      // Refresh messages
      const res = await API.get(`/api/touring/${activeTouring.id}/diskusi`);
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error('Gagal mengedit pesan');
    } finally {
      setIsProcessingMsg(false);
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm("Hapus pesan ini?")) return;
    setIsProcessingMsg(true);
    try {
      await API.delete(`/api/diskusi/${id}`);
      setActiveMenuId(null);
      // Refresh messages
      const res = await API.get(`/api/touring/${activeTouring.id}/diskusi`);
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error('Gagal menghapus pesan');
    } finally {
      setIsProcessingMsg(false);
    }
  };

  const selectTouring = (t) => {
    setSearchParams({ id: t.id });
  };

  const renderDateSeparator = (dateStr) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    let text = '';
    if (d.toDateString() === today.toDateString()) {
      text = 'Hari Ini';
    } else if (d.toDateString() === yesterday.toDateString()) {
      text = 'Kemarin';
    } else {
      const diffTime = Math.abs(today - d);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 7) {
        text = d.toLocaleDateString('id-ID', { weekday: 'long' });
      } else {
        text = d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
      }
    }
    
    return (
      <div className="flex justify-center my-4">
        <span className="bg-slate-800/80 text-slate-300 text-xs px-4 py-1.5 rounded-xl shadow-sm border border-slate-700/50 font-medium tracking-wide">
          {text}
        </span>
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-140px)] w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative z-10">
      
      {/* ─── KOLOM KIRI: DAFTAR GRUP (SIDEBAR CHAT) ─── */}
      <div className={`w-full md:w-80 flex-shrink-0 bg-slate-950 border-r border-slate-800 flex flex-col ${activeTouring ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-5 border-b border-slate-800 bg-slate-900/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-sky-400" /> Forum Obrolan
          </h2>
          <p className="text-xs text-slate-400 mt-1">Pilih agenda untuk berdiskusi</p>
        </div>
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {tourings.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">Belum ada agenda.</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {tourings.map(t => (
                <button
                  key={t.id}
                  onClick={() => selectTouring(t)}
                  className={`w-full text-left p-4 transition duration-200 hover:bg-slate-800 flex items-center gap-3
                    ${activeTouring?.id === t.id ? 'bg-slate-800 border-l-4 border-sky-500' : 'border-l-4 border-transparent'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm flex-shrink-0
                    ${activeTouring?.id === t.id ? 'bg-sky-500' : 'bg-slate-700'}`}>
                    {(t.nama_touring || t.title || 'T')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold truncate text-sm ${activeTouring?.id === t.id ? 'text-sky-400' : 'text-slate-200'}`}>
                      {t.nama_touring || t.title}
                    </h3>
                    <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" /> 
                      {new Date(t.tanggal || t.departure_date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── KOLOM KANAN: RUANG OBROLAN (MAIN CHAT) ─── */}
      <div className={`flex-1 flex flex-col bg-[#0f172a] ${!activeTouring ? 'hidden md:flex' : 'flex'}`}>
        {!activeTouring ? (
          // Layar Kosong
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <MessageSquare className="w-16 h-16 opacity-20 mb-4" />
            <p className="font-semibold text-slate-400">Pilih obrolan untuk mulai berdiskusi</p>
            <p className="text-sm mt-2 max-w-sm text-center">Bergabunglah dalam obrolan dengan peserta lain untuk merencanakan perjalanan touring Anda!</p>
          </div>
        ) : (
          // Ruang Obrolan Aktif
          <>
            {/* Header Chat */}
            <div className="h-16 px-4 md:px-6 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between shadow-sm z-10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <button onClick={() => { setActiveTouring(null); setSearchParams({}); }} className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center font-bold text-white shadow-sm flex-shrink-0 hidden sm:flex">
                  {(activeTouring.nama_touring || activeTouring.title || 'T')[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base leading-tight">
                    {activeTouring.nama_touring || activeTouring.title}
                  </h3>
                  <p className="text-xs text-sky-400 mt-0.5 font-medium flex items-center gap-1">
                    <Users className="w-3 h-3" /> Grup Forum
                  </p>
                </div>
              </div>
            </div>

            {/* Area Pesan */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-950/50 chat-bg-pattern">
              {loadingMsg ? (
                <div className="flex h-full items-center justify-center text-sky-500 animate-pulse font-medium text-sm">
                  Memuat riwayat obrolan...
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-slate-500">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-3">
                    <MessageSquare className="w-8 h-8 opacity-50" />
                  </div>
                  <p className="text-sm bg-slate-900 px-4 py-2 rounded-full border border-slate-800">Jadilah yang pertama mengirim pesan!</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isSelf = msg.user?.username === username;
                  const prevMsg = messages[index - 1];
                  const nextMsg = messages[index + 1];
                  
                  const msgDate = new Date(msg.created_at);
                  const prevMsgDate = prevMsg ? new Date(prevMsg.created_at) : null;
                  const isNewDay = !prevMsgDate || msgDate.toDateString() !== prevMsgDate.toDateString();

                  // We need to redefine isSameUserAsPrev carefully because of the date separator or unread separator
                  const hasSeparatorAbove = isNewDay || msg.id === unreadMsgId;
                  const isSameUserAsPrev = prevMsg && prevMsg.user?.username === msg.user?.username && !hasSeparatorAbove;
                  
                  const nextMsgDate = nextMsg ? new Date(nextMsg.created_at) : null;
                  const willHaveSeparatorBelow = nextMsg && (nextMsg.id === unreadMsgId || nextMsgDate.toDateString() !== msgDate.toDateString());
                  const isSameUserAsNext = nextMsg && nextMsg.user?.username === msg.user?.username && !willHaveSeparatorBelow;
                  
                  let bubbleClass = isSelf 
                    ? 'bg-sky-500 text-slate-950 font-medium shadow-md shadow-sky-900/20' 
                    : 'bg-slate-800 text-slate-200 border border-slate-700/50 shadow-sm';

                  if (isSelf) {
                    bubbleClass += ` rounded-2xl ${isSameUserAsPrev ? 'rounded-tr-sm' : ''} ${isSameUserAsNext ? 'rounded-br-sm' : 'rounded-br-none'}`;
                  } else {
                    bubbleClass += ` rounded-2xl ${isSameUserAsPrev ? 'rounded-tl-sm' : ''} ${isSameUserAsNext ? 'rounded-bl-sm' : 'rounded-bl-none'}`;
                  }

                  return (
                    <React.Fragment key={msg.id}>
                      {isNewDay && renderDateSeparator(msg.created_at)}
                      
                      {msg.id === unreadMsgId && (
                        <div className="flex justify-center my-5 relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-sky-500/30"></div>
                          </div>
                          <div className="relative flex justify-center">
                            <span className="bg-slate-900 text-sky-400 text-[11px] px-4 py-1 font-bold uppercase tracking-wider rounded-full shadow-sm border border-sky-500/20 flex items-center gap-2">
                              {unreadCount} pesan belum dibaca
                            </span>
                          </div>
                        </div>
                      )}

                      <div className={`flex w-full ${isSelf ? 'justify-end' : 'justify-start'} ${isSameUserAsNext ? 'mb-1' : 'mb-4'}`}>
                        
                        {!isSelf && !isSameUserAsNext && (
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex-shrink-0 mr-2 mt-auto overflow-hidden border border-slate-700 flex items-center justify-center shadow-sm">
                            {msg.user?.profile_photo ? (
                              <img src={msg.user.profile_photo} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        )}
                        {!isSelf && isSameUserAsNext && (
                          <div className="w-8 mr-2 flex-shrink-0"></div>
                        )}

                        <div className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[75%]`}>
                          {!isSameUserAsPrev && (
                            <span className="text-[11px] text-slate-400 mb-1 px-1.5 font-bold tracking-wide">
                              {isSelf ? 'Anda' : (msg.user?.username || 'User')}
                            </span>
                          )}
                          <div className={`px-4 py-2.5 text-sm leading-relaxed w-full relative group ${bubbleClass}`}>
                            
                            {/* TOMBOL MUNCUL MENU (Chevron) - KHUSUS MILIK SENDIRI */}
                            {isSelf && editingMsgId !== msg.id && (
                               <button 
                                 onClick={() => setActiveMenuId(activeMenuId === msg.id ? null : msg.id)}
                                 className="absolute top-1 right-2 w-6 h-6 rounded-full bg-black/10 hover:bg-black/20 text-sky-950 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                               >
                                 <ChevronDown className="w-4 h-4" />
                               </button>
                            )}
                            
                            {/* CONTEXT MENU (Dropdown WA-style) */}
                            {isSelf && activeMenuId === msg.id && (
                              <div ref={menuRef} className="absolute top-8 right-2 w-32 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-1 z-20 text-slate-200">
                                <button 
                                  onClick={() => { setEditingMsgId(msg.id); setEditInputVal(msg.message); setActiveMenuId(null); }}
                                  className="w-full text-left px-4 py-2 hover:bg-slate-700 flex items-center gap-2 text-sm"
                                >
                                  <Edit2 className="w-3.5 h-3.5" /> Edit
                                </button>
                                <button 
                                  onClick={() => deleteMessage(msg.id)}
                                  className="w-full text-left px-4 py-2 hover:bg-red-500/10 hover:text-red-400 flex items-center gap-2 text-sm text-red-400"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Hapus
                                </button>
                              </div>
                            )}

                            {editingMsgId === msg.id ? (
                              <div className="flex flex-col gap-2 mt-1">
                                <input 
                                  type="text"
                                  autoFocus
                                  value={editInputVal}
                                  onChange={(e) => setEditInputVal(e.target.value)}
                                  className="bg-sky-100 text-slate-900 border border-sky-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-sky-500 w-full"
                                />
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => setEditingMsgId(null)} className="text-slate-600 hover:text-slate-900 flex items-center gap-1 text-xs font-bold">
                                    <X className="w-3 h-3" /> Batal
                                  </button>
                                  <button onClick={() => submitEditMessage(msg.id)} disabled={isProcessingMsg} className="bg-sky-600 text-white rounded px-2 py-1 flex items-center gap-1 text-xs font-bold hover:bg-sky-700 shadow-sm">
                                    <Check className="w-3 h-3" /> Simpan
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                {msg.message}
                                <span className={`block text-[9px] mt-1.5 text-right font-bold uppercase tracking-wider ${isSelf ? 'text-sky-950/70' : 'text-slate-500'}`}>
                                  {new Date(msg.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                                  {msg.is_edited && ' (diedit)'}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-3">
              <input 
                type="text" 
                value={inputMsg} 
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Ketik pesan..."
                className="flex-1 bg-slate-950 border border-slate-700/50 rounded-full px-5 py-3 text-slate-200 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition shadow-inner" 
              />
              <button 
                type="submit" 
                disabled={sendingMsg || !inputMsg.trim()}
                className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 font-bold rounded-full transition shadow-lg shadow-sky-500/20"
              >
                {sendingMsg ? <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span> : <Send className="w-5 h-5 ml-1" />}
              </button>
            </form>
          </>
        )}
      </div>
      
    </div>
  );
}
