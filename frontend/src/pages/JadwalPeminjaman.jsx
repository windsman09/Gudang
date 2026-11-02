import { useEffect, useState } from "react";
import { CalendarDays, Package, RefreshCw, Plus } from "lucide-react";
import api from "../services/api";

const emptySchedule = {
  room: "kelas-1",
  title: "",
  organizer: "",
  start_time: "",
  end_time: "",
  description: "",
};

const emptyBooking = {
  item_id: "",
  quantity: "1",
  borrower_name: "",
  purpose: "",
  start_time: "",
  end_time: "",
  note: "",
};

const dateTime = (value) => value ? new Date(value).toLocaleString("id-ID") : "-";

export default function JadwalPeminjaman({ user }) {
  const [tab, setTab] = useState("jadwal");
  const [schedules, setSchedules] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [items, setItems] = useState([]);
  const [schedule, setSchedule] = useState(emptySchedule);
  const [booking, setBooking] = useState(emptyBooking);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [scheduleRes, bookingRes, itemRes] = await Promise.all([
        api.get("/schedules"),
        api.get("/facility-bookings"),
        api.get("/items"),
      ]);
      setSchedules(Array.isArray(scheduleRes.data) ? scheduleRes.data : []);
      setBookings(Array.isArray(bookingRes.data) ? bookingRes.data : []);
      const data = itemRes.data;
      setItems(Array.isArray(data) ? data : data?.items || data?.data || []);
    } catch (err) {
      setError(err.response?.data?.detail || "Gagal mengambil data. Pastikan login sebagai Admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const submitSchedule = async (event) => {
    event.preventDefault();
    setMessage(""); setError("");
    try {
      await api.post("/schedules", schedule);
      setMessage("Jadwal berhasil disimpan.");
      setSchedule(emptySchedule);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.detail || "Gagal menyimpan jadwal.");
    }
  };

  const submitBooking = async (event) => {
    event.preventDefault();
    setMessage(""); setError("");
    try {
      await api.post("/facility-bookings", {
        ...booking,
        item_id: Number(booking.item_id),
        quantity: Number(booking.quantity),
      });
      setMessage("Peminjaman fasilitas berhasil dicatat.");
      setBooking(emptyBooking);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.detail || "Gagal mencatat peminjaman.");
    }
  };

  const updateBooking = async (id, status) => {
    try {
      await api.patch(`/facility-bookings/${id}/status`, { status });
      setMessage("Status peminjaman diperbarui.");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.detail || "Gagal memperbarui status.");
    }
  };

  const field = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-blue-500";
  const label = "mb-1.5 block text-sm font-medium text-slate-700";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Jadwal & Peminjaman Fasilitas</h1>
          <p className="mt-1 text-sm text-slate-500">Dikelola oleh Admin · Login: {user?.username}</p>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm"><RefreshCw size={16}/> Muat ulang</button>
      </div>

      {message && <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>}
      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="flex gap-2 border-b border-slate-200">
        <button onClick={() => setTab("jadwal")} className={`px-4 py-3 text-sm font-medium ${tab === "jadwal" ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500"}`}><CalendarDays className="mr-2 inline" size={16}/>Jadwal Ruang</button>
        <button onClick={() => setTab("peminjaman")} className={`px-4 py-3 text-sm font-medium ${tab === "peminjaman" ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500"}`}><Package className="mr-2 inline" size={16}/>Peminjaman Fasilitas</button>
      </div>

      {tab === "jadwal" ? (
        <>
          <form onSubmit={submitSchedule} className="grid gap-4 rounded-2xl border bg-white p-5 md:grid-cols-2">
            <div className="md:col-span-2 flex items-center gap-2 font-semibold text-slate-800"><Plus size={18}/> Tambah Jadwal</div>
            <div><label className={label}>Ruang / Kelas</label><select className={field} value={schedule.room} onChange={e => setSchedule({...schedule, room:e.target.value})}>{[1,2,3,4,5,6].map(n=><option key={n} value={`kelas-${n}`}>Kelas {n}</option>)}</select></div>
            <div><label className={label}>Nama kegiatan</label><input required className={field} value={schedule.title} onChange={e=>setSchedule({...schedule,title:e.target.value})} placeholder="Contoh: Praktikum Elektronika"/></div>
            <div><label className={label}>Penyelenggara</label><input required className={field} value={schedule.organizer} onChange={e=>setSchedule({...schedule,organizer:e.target.value})}/></div>
            <div><label className={label}>Keterangan</label><input className={field} value={schedule.description} onChange={e=>setSchedule({...schedule,description:e.target.value})}/></div>
            <div><label className={label}>Mulai</label><input required type="datetime-local" className={field} value={schedule.start_time} onChange={e=>setSchedule({...schedule,start_time:e.target.value})}/></div>
            <div><label className={label}>Selesai</label><input required type="datetime-local" className={field} value={schedule.end_time} onChange={e=>setSchedule({...schedule,end_time:e.target.value})}/></div>
            <div className="md:col-span-2"><button disabled={loading} className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white disabled:opacity-50">Simpan Jadwal</button></div>
          </form>
          <section className="overflow-hidden rounded-2xl border bg-white">
            <div className="border-b p-5 font-semibold">Daftar Jadwal</div>
            <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50 text-left text-slate-600"><tr>{["Ruang","Kegiatan","Penyelenggara","Mulai","Selesai","Status","Aksi"].map(x=><th key={x} className="px-4 py-3">{x}</th>)}</tr></thead><tbody className="divide-y">{schedules.map(row=><tr key={row.id}><td className="px-4 py-3">{row.room}</td><td className="px-4 py-3 font-medium">{row.title}</td><td className="px-4 py-3">{row.organizer}</td><td className="px-4 py-3">{dateTime(row.start_time)}</td><td className="px-4 py-3">{dateTime(row.end_time)}</td><td className="px-4 py-3">{row.status}</td><td className="px-4 py-3">{row.status !== "cancelled" && <button onClick={async()=>{if(confirm("Batalkan jadwal ini?")){await api.delete(`/schedules/${row.id}`);loadData();}}} className="text-red-600">Batalkan</button>}</td></tr>)}{!schedules.length && <tr><td colSpan="7" className="p-8 text-center text-slate-400">Belum ada jadwal</td></tr>}</tbody></table></div>
          </section>
        </>
      ) : (
        <>
          <form onSubmit={submitBooking} className="grid gap-4 rounded-2xl border bg-white p-5 md:grid-cols-2">
            <div className="md:col-span-2 flex items-center gap-2 font-semibold text-slate-800"><Plus size={18}/> Catat Peminjaman</div>
            <div className="md:col-span-2"><label className={label}>Barang / Fasilitas</label><select required className={field} value={booking.item_id} onChange={e=>setBooking({...booking,item_id:e.target.value})}><option value="">Pilih barang</option>{items.map(item=><option key={item.id} value={item.id}>{item.item_code} - {item.item_name} (stok {item.stock} {item.unit})</option>)}</select></div>
            <div><label className={label}>Jumlah</label><input required type="number" min="1" className={field} value={booking.quantity} onChange={e=>setBooking({...booking,quantity:e.target.value})}/></div>
            <div><label className={label}>Nama peminjam</label><input required className={field} value={booking.borrower_name} onChange={e=>setBooking({...booking,borrower_name:e.target.value})}/></div>
            <div className="md:col-span-2"><label className={label}>Keperluan</label><input required className={field} value={booking.purpose} onChange={e=>setBooking({...booking,purpose:e.target.value})}/></div>
            <div><label className={label}>Waktu pinjam</label><input required type="datetime-local" className={field} value={booking.start_time} onChange={e=>setBooking({...booking,start_time:e.target.value})}/></div>
            <div><label className={label}>Waktu kembali</label><input required type="datetime-local" className={field} value={booking.end_time} onChange={e=>setBooking({...booking,end_time:e.target.value})}/></div>
            <div className="md:col-span-2"><label className={label}>Catatan</label><textarea className={field} rows="2" value={booking.note} onChange={e=>setBooking({...booking,note:e.target.value})}/></div>
            <div className="md:col-span-2"><button className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white">Simpan Peminjaman</button></div>
          </form>
          <section className="overflow-hidden rounded-2xl border bg-white">
            <div className="border-b p-5 font-semibold">Riwayat Peminjaman Fasilitas</div>
            <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50 text-left text-slate-600"><tr>{["Barang","Jumlah","Peminjam","Keperluan","Periode","Status","Aksi"].map(x=><th key={x} className="px-4 py-3">{x}</th>)}</tr></thead><tbody className="divide-y">{bookings.map(row=><tr key={row.id}><td className="px-4 py-3">{row.item_name}</td><td className="px-4 py-3">{row.quantity}</td><td className="px-4 py-3">{row.borrower_name}</td><td className="px-4 py-3">{row.purpose}</td><td className="px-4 py-3">{dateTime(row.start_time)} – {dateTime(row.end_time)}</td><td className="px-4 py-3">{row.status}</td><td className="px-4 py-3 space-x-2">{row.status === "booked" && <button onClick={()=>updateBooking(row.id,"returned")} className="text-green-700">Dikembalikan</button>}{row.status === "booked" && <button onClick={()=>updateBooking(row.id,"cancelled")} className="text-red-600">Batalkan</button>}</td></tr>)}{!bookings.length && <tr><td colSpan="7" className="p-8 text-center text-slate-400">Belum ada peminjaman</td></tr>}</tbody></table></div>
          </section>
        </>
      )}

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <strong>Outlook personal:</strong> Sinkronisasi satu arah akan mengirim jadwal Gudang ke kalender Outlook admin yang terhubung. Koneksi Microsoft 365 belum diaktifkan; diperlukan konfigurasi App Registration (Client ID, Tenant ID, dan Redirect URI) sebelum OAuth dapat diuji.
      </div>
    </div>
  );
}
