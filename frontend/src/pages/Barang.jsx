import { useEffect, useMemo, useState } from "react";
import {
  Package,
  Plus,
  Save,
  Search,
  Trash2,
  X,
  RefreshCw,
} from "lucide-react";
import api from "../api/api";

export default function Barang() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    item_code: "",
    item_name: "",
    category: "",
    unit: "",
    min_stock: "",
    location: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(true);

  async function fetchItems() {
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
  }

  useEffect(() => {
    fetchItems();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function resetForm() {
    setForm({
      item_code: "",
      item_name: "",
      category: "",
      unit: "",
      min_stock: "",
      location: "",
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.item_code.trim()) {
      alert("Kode barang wajib diisi.");
      return;
    }

    if (!form.item_name.trim()) {
      alert("Nama barang wajib diisi.");
      return;
    }

    if (!form.unit.trim()) {
      alert("Satuan wajib diisi.");
      return;
    }

    try {
      setLoading(true);

      const data = {
        item_code: form.item_code.trim(),
        item_name: form.item_name.trim(),
        category: form.category.trim(),
        unit: form.unit.trim(),
        min_stock: Number(form.min_stock || 0),
        location: form.location.trim(),
      };

      const response = await api.post("/items", data);

      alert(
        response.data?.message ||
          "Barang berhasil ditambahkan."
      );

      resetForm();

      await fetchItems();
    } catch (error) {
      console.error("Gagal menambahkan barang:", error);

      alert(
        error.response?.data?.detail ||
          "Gagal menambahkan barang."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(item) {
    const yakin = window.confirm(
      `Hapus barang "${item.item_name}" (${item.item_code})?`
    );

    if (!yakin) {
      return;
    }

    try {
      await api.delete(`/items/${item.id}`);

      alert("Barang berhasil dihapus.");

      await fetchItems();
    } catch (error) {
      console.error("Gagal menghapus barang:", error);

      alert(
        error.response?.data?.detail ||
          "Gagal menghapus barang."
      );
    }
  }

  const filteredItems = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) {
      return items;
    }

    return items.filter((item) => {
      const kode = String(item.item_code || "").toLowerCase();
      const nama = String(item.item_name || "").toLowerCase();
      const kategori = String(item.category || "").toLowerCase();
      const lokasi = String(item.location || "").toLowerCase();

      return (
        kode.includes(keyword) ||
        nama.includes(keyword) ||
        kategori.includes(keyword) ||
        lokasi.includes(keyword)
      );
    });
  }, [items, search]);

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Master Barang
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Kelola daftar barang gudang
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 shadow-sm">
          <Package size={20} className="text-blue-600" />

          <span className="font-semibold text-slate-700">
            {items.length} Barang
          </span>
        </div>
      </div>

      {/* Form Tambah Barang */}
      <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-blue-100 p-3">
            <Plus className="text-blue-600" size={22} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Tambah Barang
            </h2>

            <p className="text-sm text-slate-500">
              Tambahkan barang baru ke master gudang
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {/* Kode */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Kode Barang
              </label>

              <input
                type="text"
                name="item_code"
                value={form.item_code}
                onChange={handleChange}
                placeholder="Contoh: ATK-001"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            {/* Nama */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Nama Barang
              </label>

              <input
                type="text"
                name="item_name"
                value={form.item_name}
                onChange={handleChange}
                placeholder="Contoh: Kabel HDMI"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            {/* Kategori */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Kategori
              </label>

              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Contoh: Elektronik"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            {/* Satuan */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Satuan
              </label>

              <select
                name="unit"
                value={form.unit}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="">Pilih satuan</option>
                <option value="pcs">PCS</option>
                <option value="unit">Unit</option>
                <option value="box">Box</option>
                <option value="set">Set</option>
                <option value="meter">Meter</option>
                <option value="roll">Roll</option>
                <option value="buah">Buah</option>
              </select>
            </div>

            {/* Minimum */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Stok Minimum
              </label>

              <input
                type="number"
                name="min_stock"
                value={form.min_stock}
                onChange={handleChange}
                min="0"
                placeholder="Contoh: 5"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            {/* Lokasi */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Lokasi
              </label>

              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Contoh: Rak A-01"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
          </div>

          {/* Tombol */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <X size={18} />
              Reset
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} />

              {loading ? "Menyimpan..." : "Simpan Barang"}
            </button>
          </div>
        </form>
      </div>

      {/* Daftar Barang */}
      <div className="rounded-2xl bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-slate-100 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Daftar Barang
            </h2>

            <p className="text-sm text-slate-500">
              Barang yang tersedia di master gudang
            </p>
          </div>

          <div className="flex gap-3">
            {/* Search */}
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari barang..."
                className="w-64 rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            {/* Refresh */}
            <button
              type="button"
              onClick={fetchItems}
              disabled={loadingItems}
              className="rounded-xl border border-slate-200 bg-white px-4 text-slate-600 transition hover:bg-slate-50"
              title="Refresh"
            >
              <RefreshCw
                size={18}
                className={loadingItems ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 text-left text-sm text-slate-600">
                <th className="px-6 py-4 font-semibold">No</th>
                <th className="px-6 py-4 font-semibold">Kode</th>
                <th className="px-6 py-4 font-semibold">Nama Barang</th>
                <th className="px-6 py-4 font-semibold">Kategori</th>
                <th className="px-6 py-4 font-semibold">Satuan</th>
                <th className="px-6 py-4 text-center font-semibold">
                  Stok
                </th>
                <th className="px-6 py-4 text-center font-semibold">
                  Min. Stok
                </th>
                <th className="px-6 py-4 font-semibold">Lokasi</th>
                <th className="px-6 py-4 text-center font-semibold">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loadingItems ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    Memuat data barang...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-6 py-12 text-center"
                  >
                    <Package
                      size={40}
                      className="mx-auto mb-3 text-slate-300"
                    />

                    <p className="font-semibold text-slate-600">
                      Belum ada barang
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Tambahkan barang menggunakan form di atas.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => {
                  const stock = Number(item.stock || 0);
                  const minStock = Number(item.min_stock || 0);

                  const lowStock =
                    stock <= minStock;

                  return (
                    <tr
                      key={item.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {index + 1}
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
                          {item.item_code}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {item.item_name}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {item.category || "-"}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {item.unit || "-"}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span
                          className={`font-bold ${
                            lowStock
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {stock}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center text-sm text-slate-600">
                        {minStock}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {item.location || "-"}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700"
                          title="Hapus barang"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loadingItems && filteredItems.length > 0 && (
          <div className="border-t border-slate-100 px-6 py-4 text-sm text-slate-500">
            Menampilkan{" "}
            <span className="font-semibold text-slate-700">
              {filteredItems.length}
            </span>{" "}
            dari{" "}
            <span className="font-semibold text-slate-700">
              {items.length}
            </span>{" "}
            barang
          </div>
        )}
      </div>
    </div>
  );
}
