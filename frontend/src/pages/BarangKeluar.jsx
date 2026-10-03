import { useEffect, useState } from "react";
import {
  ArrowUpFromLine,
  Search,
  Package,
  Loader2,
} from "lucide-react";

import api from "../services/api";

export default function BarangKeluar() {
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    item_id: "",
    quantity: "",
    destination: "",
    note: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchItems = async () => {
    try {
      const response = await api.get("/items");
      setItems(response.data);
    } catch (err) {
      console.error("Gagal mengambil barang:", err);
      setError("Gagal mengambil daftar barang");
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await api.get("/stock-out/");
      setHistory(response.data);
    } catch (err) {
      console.error("Gagal mengambil riwayat:", err);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchHistory();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!form.item_id) {
      setError("Silakan pilih barang");
      return;
    }

    if (!form.quantity || Number(form.quantity) <= 0) {
      setError("Jumlah barang harus lebih dari 0");
      return;
    }

    const selectedItem = items.find(
      (item) => item.id === Number(form.item_id)
    );

    if (!selectedItem) {
      setError("Barang tidak ditemukan");
      return;
    }

    if (Number(form.quantity) > selectedItem.stock) {
      setError(
        `Stok tidak cukup. Stok tersedia: ${selectedItem.stock}`
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/stock-out/", {
        item_id: Number(form.item_id),
        qty: Number(form.quantity),
        destination: form.destination || null,
        note: form.note || null,
      });

      setMessage(response.data.message);

      setForm({
        item_id: "",
        qty: "",
        destination: "",
        note: "",
      });

      await fetchItems();
      await fetchHistory();
    } catch (err) {
      console.error("Gagal menyimpan barang keluar:", err);

      setError(
        err.response?.data?.detail ||
          "Gagal menyimpan barang keluar"
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const keyword = search.toLowerCase();

    return (
      item.item_code?.toLowerCase().includes(keyword) ||
      item.item_name?.toLowerCase().includes(keyword) ||
      item.category?.toLowerCase().includes(keyword) ||
      item.location?.toLowerCase().includes(keyword)
    );
  });

  const selectedItem = items.find(
    (item) => item.id === Number(form.item_id)
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Barang Keluar
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Catat barang yang keluar dari gudang
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <ArrowUpFromLine size={22} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-800">
              Input Barang Keluar
            </h2>

            <p className="text-sm text-slate-500">
              Stok akan otomatis dikurangi setelah disimpan
            </p>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-5 rounded-xl bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Cari Barang
            </label>

            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari kode atau nama barang..."
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
          </div>

          {/* Item */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Barang
            </label>

            <select
              name="item_id"
              value={form.item_id}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white"
            >
              <option value="">
                -- Pilih Barang --
              </option>

              {filteredItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.item_code} - {item.item_name} | Stok:{" "}
                  {item.stock}
                </option>
              ))}
            </select>
          </div>

          {/* Stock information */}
          {selectedItem && (
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <Package
                size={20}
                className="text-blue-600"
              />

              <div>
                <p className="text-sm text-slate-500">
                  Stok tersedia
                </p>

                <p className="font-semibold text-slate-800">
                  {selectedItem.stock} {selectedItem.unit}
                </p>
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Jumlah Keluar
            </label>

            <input
              type="number"
              name="quantity"
              min="1"
              max={selectedItem?.stock || undefined}
              value={form.quantity}
              onChange={handleChange}
              placeholder="Masukkan jumlah"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tujuan
            </label>

            <input
              type="text"
              name="destination"
              value={form.destination}
              onChange={handleChange}
              placeholder="Contoh: Ruang H2"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Keterangan
            </label>

            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              rows="3"
              placeholder="Keterangan tambahan..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 rounded-xl transition"
          >
            {loading ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Menyimpan...
              </>
            ) : (
              <>
                <ArrowUpFromLine size={18} />
                Simpan Barang Keluar
              </>
            )}
          </button>
        </form>
      </div>

      {/* History */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

        <div className="p-6 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800">
            Riwayat Barang Keluar
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Daftar transaksi barang yang sudah keluar
          </p>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-slate-600">
                  No
                </th>

                <th className="text-left px-6 py-4 font-semibold text-slate-600">
                  Barang
                </th>

                <th className="text-left px-6 py-4 font-semibold text-slate-600">
                  Jumlah
                </th>

                <th className="text-left px-6 py-4 font-semibold text-slate-600">
                  Tujuan
                </th>

                <th className="text-left px-6 py-4 font-semibold text-slate-600">
                  Keterangan
                </th>

                <th className="text-left px-6 py-4 font-semibold text-slate-600">
                  Tanggal
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {history.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-slate-400"
                  >
                    Belum ada transaksi barang keluar
                  </td>
                </tr>
              ) : (
                history.map((transaction, index) => {

                  const item = items.find(
                    (item) =>
                      item.id === transaction.item_id
                  );

                  return (
                    <tr
                      key={transaction.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        {index + 1}
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">
                          {item?.item_name ||
                            `Item #${transaction.item_id}`}
                        </div>

                        {item?.item_code && (
                          <div className="text-xs text-slate-400">
                            {item.item_code}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 font-semibold text-red-600">
                        -{transaction.quantity}
                      </td>

                      <td className="px-6 py-4">
                        {transaction.destination || "-"}
                      </td>

                      <td className="px-6 py-4 text-slate-500">
                        {transaction.note || "-"}
                      </td>

                      <td className="px-6 py-4 text-slate-500">
                        {transaction.created_at
                          ? new Date(
                              transaction.created_at
                            ).toLocaleString("id-ID")
                          : "-"}
                      </td>
                    </tr>
                  );
                })
              )}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
