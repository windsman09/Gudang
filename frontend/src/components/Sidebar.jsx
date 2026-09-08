import {
  LayoutDashboard,
  Package,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";

export default function Sidebar() {
  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen">
      <div className="p-5 text-2xl font-bold border-b border-slate-700">
        Gudang
      </div>

      <nav className="p-4 space-y-2">
        <div className="flex items-center gap-3 p-3 rounded hover:bg-slate-800 cursor-pointer">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </div>

        <div className="flex items-center gap-3 p-3 rounded hover:bg-slate-800 cursor-pointer">
          <Package size={20} />
          <span>Data Barang</span>
        </div>

        <div className="flex items-center gap-3 p-3 rounded hover:bg-slate-800 cursor-pointer">
          <ArrowDownCircle size={20} />
          <span>Barang Masuk</span>
        </div>

        <div className="flex items-center gap-3 p-3 rounded hover:bg-slate-800 cursor-pointer">
          <ArrowUpCircle size={20} />
          <span>Barang Keluar</span>
        </div>
      </nav>
    </div>
  );
}
