import { Bell, LogOut, User as UserIcon, Menu } from "lucide-react";

export default function Header({ activePage, user, onLogout, onToggleSidebar }) {
  const pageTitles = {
    dashboard: "Dashboard Overview",
    barang: "Master Barang Gudang",
    "barang-masuk": "Transaksi Barang Masuk",
    "barang-keluar": "Transaksi Barang Keluar",
    monitoring: "Kontrol & Monitoring IoT",
    users: "User Management",
  };

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
          <p className="text-xs text-slate-400">Aplikasi Pengelolaan Gudang</p>
        </div>
      </div>

      {/* Bagian Kanan: Profil User & Logout */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 font-bold text-blue-600">
            {user?.username ? (
              user.username.charAt(0).toUpperCase()
            ) : (
              <UserIcon size={18} />
            )}
          </div>

          <div className="hidden text-left md:block">
            <p className="text-sm font-semibold text-slate-800 leading-tight">
              {user?.username || "User"}
            </p>
            <p className="text-xs text-slate-400 capitalize">
              {user?.role || "user"}
            </p>
          </div>
        </div>

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-100"
            title="Keluar dari akun"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        )}
      </div>
    </header>
  );
}
