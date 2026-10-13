import { useEffect, useState } from "react";
import {
  ArrowUpFromLine,
  Search,
  Package,
  Loader2,
  FileSpreadsheet,
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

  // Mengambil daftar barang
  const fetchItems = async () => {
    try {
      const response = await api.get("/items");
      setItems(response.data);
    } catch (err) {
      console.error("Gagal mengambil barang:", err);
      setError("Gagal mengambil daftar barang");
    }
  };

  // Mengambil riwayat barang keluar
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

  // Export riwayat barang keluar ke Excel
  const handleExportExcel = async () => {
    try {
      const response = await api.get("/exports/stock-out", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");

      link.href = url;
      link.download = "riwayat_barang_keluar.xlsx";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export barang keluar gagal:", err);
      alert("Gagal export Excel. Periksa koneksi, login, dan backend.");
    }
  };

  // Mengubah nilai form
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Menyimpan transaksi barang keluar
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

      setMessage(
        response.data.message || "Barang keluar berhasil disimpan"
      );

      setForm({
        item_id: "",
        quantity: "",
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

  // Filter barang berdasarkan kata kunci
  const filteredItems = items.filter((item) => {
    const keyword = search.toLowerCase();

    return (
      item.item_code?.toLowerCase().includes(keyword) ||
      item.item_name?.toLowerCase().includes(keyword) ||
      item.category?.toLowerCase().includes(keyword) ||
      item.location?.toLowerCase().includes(keyword)
    );
  });

  // Barang yang sedang dipilih
  const selectedItem = items.find(
    (item) => item.id === Number(form.item_id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Barang Keluar
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Catat barang yang keluar dari gudang
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportExcel}
          className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-medium text-white transition hover:bg-green-700"
        >
          <FileSpreadsheet size={18} />
          Export Excel
        </button>
      </div>

      {/* Form Barang Keluar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
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

        {/* Pesan berhasil */}
        {message && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {/* Pesan error */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Pencarian barang */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
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
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
          </div>

          {/* Pilih barang */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Barang
            </label>

            <select
              name="item_id"
              value={form.item_id}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="">-- Pilih Barang --</option>

              {filteredItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.item_code} - {item.item_name} | Stok:{" "}
                  {item.stock}
                </option>
              ))}
            </select>
          </div>

          {/* Informasi stok */}
          {selectedItem && (
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <Package size={20} className="text-blue-600" />

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

          {/* Jumlah keluar */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
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
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          {/* Tujuan */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Tujuan
            </label>

            <input
              type="text"
              name="destination"
              value={form.destination}
              onChange={handleChange}
              placeholder="Contoh: Ruang H2"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          {/* Keterangan */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Keterangan
            </label>

            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              rows={3}
              placeholder="Keterangan tambahan..."
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          {/* Tombol simpan */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
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

      {/* Riwayat Barang Keluar */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800">
            Riwayat Barang Keluar
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Daftar transaksi barang yang sudah keluar
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">
                  No
                </th>

                <th className="px-6 py-4 text-left font-semibold text-slate-600">
                  Barang
                </th>

                <th className="px-6 py-4 text-left font-semibold text-slate-600">
                  Jumlah
                </th>

                <th className="px-6 py-4 text-left font-semibold text-slate-600">
                  Tujuan
                </th>

                <th className="px-6 py-4 text-left font-semibold text-slate-600">
                  Keterangan
                </th>

                <th className="px-6 py-4 text-left font-semibold text-slate-600">
                  Tanggal
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {history.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-slate-400"
                  >
                    Belum ada transaksi barang keluar
                  </td>
                </tr>
              ) : (
                history.map((transaction, index) => {
                  const item = items.find(
                    (item) => item.id === transaction.item_id
                  );

                  return (
                    <tr
                      key={transaction.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">{index + 1}</td>

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
                        -{transaction.qty}
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
