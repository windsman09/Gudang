import { useState, useRef, useEffect } from "react";
import { Bell, LogOut, User as UserIcon, Menu } from "lucide-react";

export default function Header({ activePage, user, onLogout, onToggleSidebar }) {
  const [showProfile, setShowProfile] = useState(false);
  const dropdownRef = useRef(null);

  const pageTitles = {
    dashboard: "Dashboard",
    barang: "Master Barang Gudang",
    "barang-masuk": "Transaksi Barang Masuk",
    "barang-keluar": "Transaksi Barang Keluar",
    monitoring: "Kontrol & Monitoring",
    users: "User Management",
  };

  // Menutup dropdown jika pengguna mengklik di luar area profil
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md">
      {/* Bagian Kiri: Tombol Toggle Sidebar & Judul Halaman */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
          title="Buka/Tutup Menu"
        >
          <Menu size={20} />
        </button>

        <div>
          <h2 className="text-lg font-bold text-slate-800 capitalize">
            {pageTitles[activePage] || activePage}
          </h2>
          <p className="text-xs text-slate-400">
            Aplikasi Gudang dan Monitoring Kelas
          </p>
        </div>
      </div>

      {/* Bagian Kanan: Notifikasi & Tombol Profil Dropdown */}
      <div className="flex items-center gap-4">
        {/* Tombol Notifikasi */}
        <button
          type="button"
          className="relative rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
          title="Notifikasi"
        >
          <Bell size={18} />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-600" />
        </button>

        {/* Dropdown Menu Profil */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 transition hover:bg-slate-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-semibold text-white">
              {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
            </div>
            <span className="hidden text-sm font-semibold text-slate-700 md:inline">
              {user?.username || "User"}
            </span>
          </button>

          {/* Konten Dropdown */}
          {showProfile && (
            <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
              <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-lg font-semibold text-white">
                  {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="overflow-hidden">
                  <p className="font-semibold text-slate-800 truncate">
                    {user?.username || "User"}
                  </p>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">
                    {user?.role || "user"}
                  </p>
                </div>
              </div>

              {/* Tombol Logout */}
              <div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
