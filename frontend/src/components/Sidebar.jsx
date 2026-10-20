import {
  LayoutDashboard,
  Package,
  PackagePlus,
  PackageMinus,
  PackageOpen,
  Home,
  Warehouse,
  Forklift,
  Users,
  Monitor,
  X,
} from "lucide-react";

export default function Sidebar({
  activePage,
  setActivePage,
  user,
  isOpen,
  setIsOpen,
}) {
  const menus = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "barang",
      label: "Master Barang",
      icon: Warehouse,
    },
    {
      id: "barang-masuk",
      label: "Barang Masuk",
      icon: Forklift,
    },
    {
      id: "barang-keluar",
      label: "Barang Keluar",
      icon: PackageOpen,
    },
    {
      id: "monitoring",
      label: "Monitoring Kelas",
      icon: Monitor,
    },

    // Hanya muncul untuk Super Admin
    ...(user?.role === "superuser"
      ? [
          {
            id: "users",
            label: "User Management",
            icon: Users,
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Overlay latar belakang gelap saat sidebar terbuka di layar */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-20 bg-slate-900/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Konten Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col justify-between bg-slate-900 p-4 text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Header Sidebar & Tombol Close (Mobile) */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold">ME Syahdan</h1>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* Menu Navigasi */}
          <nav className="space-y-2">
            {menus.map((menu) => {
              const Icon = menu.icon;

              return (
                <button
                  key={menu.id}
                  type="button"
                  onClick={() => {
                    setActivePage(menu.id);
                    // Otomatis menutup sidebar di layar kecil setelah menu diklik
                    if (window.innerWidth < 1024) {
                      setIsOpen(false);
                    }
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition ${
                    activePage === menu.id
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <Icon size={20} />
                  <span>{menu.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Informasi user di bagian bawah */}
        <div className="border-t border-slate-700 pt-4">
          <p className="text-sm text-slate-400">Login sebagai</p>
          <p className="font-semibold truncate">{user?.username || "User"}</p>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">
            {user?.role || "user"}
          </p>
        </div>
      </aside>
    </>
  );
}
