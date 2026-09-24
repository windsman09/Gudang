import { useEffect, useState } from "react";
import {
  ArrowDownToLine,
  Save,
  Package,
  RefreshCw,
} from "lucide-react";
import api from "../api/api";

export default function BarangMasuk() {
  const [items, setItems] = useState([]);
  const [riwayat, setRiwayat] = useState([]);

  const [form, setForm] = useState({
    item_id: "",
    jumlah: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(true);

  // =========================
  // Ambil data barang
  // =========================
  const fetchItems = async () => {
    try {
      setLoadingItems(true);

      const response = await api.get("/items");

      setItems(response.data);
    } catch (error) {
      console.error("Gagal mengambil data barang:", error);

      alert(
        error.response?.data?.detail ||
        "Gagal mengambil data barang"
      );
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // =========================
  // Handle input
  // =========================
  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // =========================
  // Simpan barang masuk
  // =========================
  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.item_id) {
      alert("Silakan pilih barang.");
      return;
    }

    if (!form.jumlah || Number(form.jumlah) <= 0) {
      alert("Jumlah barang harus lebih dari 0.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/stock-in", null, {
        params: {
          item_id: Number(form.item_id),
          qty: Number(form.jumlah),
        },
      });

      alert(response.data.message);

      // Reset form
      setForm({
        item_id: "",
        jumlah: "",
      });

      // Refresh daftar barang agar stok terbaru tampil
      await fetchItems();

    } catch (error) {
      console.error("Gagal menyimpan barang masuk:", error);

      alert(
        error.response?.data?.detail ||
        "Gagal menyimpan barang masuk"
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // Barang yang sedang dipilih
  // =========================
  const selectedItem = items.find(
    (item) => String(item.id) === String(form.item_id)
  );

  return (
    <div className="min-h-screen bg-slate-100 p-6">

      {/* ================= HEADER ================= */}
      <div className="mb-6 flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-blue-600 p-3 text-white shadow">
            <ArrowDownToLine size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Barang Masuk
            </h1>

            <p className="text-sm text-slate-500">
              Kelola transaksi barang yang masuk ke gudang
            </p>
          </div>

        </div>

        <button
          type="button"
          onClick={fetchItems}
          className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>

      </div>


      {/* ================= FORM ================= */}
      <div className="mb-6 rounded-xl bg-white p-6 shadow">

        <div className="mb-5 flex items-center gap-2">

          <Package
            size={20}
            className="text-blue-600"
          />

          <h2 className="text-lg font-semibold text-slate-800">
            Tambah Barang Masuk
          </h2>

        </div>

        <form onSubmit={handleSubmit}>

          <div className="grid gap-5 md:grid-cols-2">

            {/* Pilih Barang */}
            <div className="md:col-span-1">

              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Barang
              </label>

              <select
                name="item_id"
                value={form.item_id}
                onChange={handleChange}
                disabled={loadingItems || loading}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >

                <option value="">
                  {loadingItems
                    ? "Memuat barang..."
                    : "Pilih barang"}
                </option>

                {items.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.item_code} - {item.item_name}
                  </option>
                ))}

              </select>

            </div>


            {/* Jumlah */}
            <div>

              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Jumlah Barang
              </label>

              <input
                type="number"
                name="jumlah"
                value={form.jumlah}
                onChange={handleChange}
                min="1"
                disabled={loading}
                placeholder="Masukkan jumlah"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

          </div>


          {/* Informasi barang */}
          {selectedItem && (
            <div className="mt-5 rounded-lg bg-slate-50 p-4">

              <div className="grid gap-4 sm:grid-cols-3">

                <div>
                  <p className="text-xs text-slate-500">
                    Kode Barang
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {selectedItem.item_code}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Nama Barang
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {selectedItem.item_name}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Stok Saat Ini
                  </p>

                  <p className="mt-1 font-semibold text-blue-600">
                    {selectedItem.stock} {selectedItem.unit || ""}
                  </p>
                </div>

              </div>

            </div>
          )}


          {/* Button */}
          <div className="mt-6 flex justify-end">

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >

              <Save size={18} />

              {loading
                ? "Menyimpan..."
                : "Simpan Barang Masuk"}

            </button>

          </div>

        </form>

      </div>


      {/* ================= INFORMASI ================= */}
      <div className="rounded-xl bg-white p-6 shadow">

        <div className="mb-5">

          <h2 className="text-lg font-semibold text-slate-800">
            Informasi Stok
          </h2>

          <p className="text-sm text-slate-500">
            Data barang dan stok terbaru dari database
          </p>

        </div>


        {/* ================= TABLE ================= */}
        <div className="overflow-x-auto">

          <table className="w-full text-left text-sm">

            <thead className="border-b bg-slate-50">

              <tr>

                <th className="px-4 py-3 font-semibold text-slate-600">
                  No
                </th>

                <th className="px-4 py-3 font-semibold text-slate-600">
                  Kode
                </th>

                <th className="px-4 py-3 font-semibold text-slate-600">
                  Nama Barang
                </th>

                <th className="px-4 py-3 font-semibold text-slate-600">
                  Kategori
                </th>

                <th className="px-4 py-3 font-semibold text-slate-600">
                  Lokasi
                </th>

                <th className="px-4 py-3 text-right font-semibold text-slate-600">
                  Stok
                </th>

              </tr>

            </thead>

            <tbody>

              {loadingItems ? (

                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    Memuat data barang...
                  </td>
                </tr>

              ) : items.length === 0 ? (

                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    Belum ada barang di database
                  </td>
                </tr>

              ) : (

                items.map((item, index) => (

                  <tr
                    key={item.id}
                    className="border-b last:border-0 hover:bg-slate-50"
                  >

                    <td className="px-4 py-3">
                      {index + 1}
                    </td>

                    <td className="px-4 py-3 font-medium text-slate-800">
                      {item.item_code}
                    </td>

                    <td className="px-4 py-3">
                      {item.item_name}
                    </td>

                    <td className="px-4 py-3">
                      {item.category || "-"}
                    </td>

                    <td className="px-4 py-3">
                      {item.location || "-"}
                    </td>

                    <td className="px-4 py-3 text-right font-semibold text-blue-600">
                      {item.stock} {item.unit || ""}
                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}
