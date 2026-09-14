import {
  LayoutDashboard,
  PackagePlus,
  PackageMinus,
  Home,
} from "lucide-react";

export default function Sidebar({ activePage, setActivePage }) {
  const menus = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "barang-masuk",
      label: "Barang Masuk",
      icon: PackagePlus,
    },
    {
      id: "barang-keluar",
      label: "Barang Keluar",
      icon: PackageMinus,
    },
    {
      id: "home",
      label: "Home",
      icon: Home,
    },
  ];

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white p-4">
      <h1 className="text-xl font-bold mb-6">
        Gudang
      </h1>

      <nav className="space-y-2">
        {menus.map((menu) => {
          const Icon = menu.icon;

          return (
            <button
              key={menu.id}
              type="button"
              onClick={() => setActivePage(menu.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
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
    </aside>
  );
}
