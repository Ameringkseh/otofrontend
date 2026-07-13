import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { SkeletonCard } from '../components/Skeleton';
import { ClipboardList, Bike, UserPlus, CalendarDays } from 'lucide-react';

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

function TouringSaya() {
  const [myTourings, setMyTourings] = useState([]);
  const [myTouringLoading, setMyTouringLoading] = useState(true);

  useEffect(() => {
    const fetchMyTouring = async () => {
      try {
        const res = await API.get('/api/my-touring');
        setMyTourings(Array.isArray(res.data) ? res.data : []);
      } catch {
        setMyTourings([]);
      } finally {
        setMyTouringLoading(false);
      }
    };
    fetchMyTouring();
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-indigo-400 mb-6 flex items-center gap-2">
        <ClipboardList className="w-6 h-6" /> Touring Saya
      </h2>
      
      {myTouringLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : myTourings.length === 0 ? (
        <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl flex flex-col items-center">
          <Bike className="w-12 h-12 mb-3 text-slate-600" />
          <p className="text-base font-medium">Anda belum bergabung ke touring manapun.</p>
          <p className="text-sm mt-1 text-slate-600 flex items-center justify-center gap-1">
            Pergi ke beranda lalu klik tombol <span className="text-emerald-400 inline-flex items-center gap-1 mx-1"><UserPlus className="w-3.5 h-3.5" /> Gabung</span> pada agenda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myTourings.map((reg) => {
            const t = reg.touring || {};
            const tanggal = t.tanggal || t.departure_date;
            const today = new Date(); today.setHours(0,0,0,0);
            const tgl = tanggal ? new Date(tanggal) : null;
            const sudahSelesai = tgl && tgl < today;
            
            return (
              <div key={reg.id} className="bg-slate-800/50 border border-slate-700 hover:border-indigo-500/50 transition-colors rounded-xl p-5 flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-emerald-400 font-bold text-lg leading-tight mb-1 truncate">{t.nama_touring || t.title || `Touring #${reg.touring_id}`}</p>
                    <p className="text-slate-300 text-sm mb-1">{t.tujuan || t.destination}</p>
                    <p className="text-slate-500 text-xs flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5" /> {formatTanggal(tanggal)}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${sudahSelesai ? 'bg-slate-700 text-slate-400' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'}`}>
                    {sudahSelesai ? 'Selesai' : 'Akan Datang'}
                  </span>
                </div>
                
                <div className="mt-auto pt-4 border-t border-slate-700/80 flex flex-col gap-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Kendaraan:</span>
                    <span className="text-slate-200 font-medium">{reg.bike_model}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Plat Nomor:</span>
                    <span className="bg-slate-950 border border-slate-700 text-slate-300 font-mono px-2 py-0.5 rounded text-xs">{reg.license_plate}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xs">
                    <span className="text-slate-600">Didaftarkan:</span>
                    <span className="text-slate-500">{formatWaktu(reg.registered_at)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TouringSaya;
