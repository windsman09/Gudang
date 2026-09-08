import {
  Package,
  ArrowDownToLine,
  ArrowUpFromLine
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">
        Dashboard Gudang
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow p-5">
          <Package className="text-blue-500" />
          <p className="mt-3 text-gray-500">
            Total Barang
          </p>
          <h2 className="text-3xl font-bold">
            1,250
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <ArrowDownToLine className="text-green-500" />
          <p className="mt-3 text-gray-500">
            Barang Masuk
          </p>
          <h2 className="text-3xl font-bold">
            150
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <ArrowUpFromLine className="text-red-500" />
          <p className="mt-3 text-gray-500">
            Barang Keluar
          </p>
          <h2 className="text-3xl font-bold">
            95
          </h2>
        </div>
      </div>
    </div>
  );
}
