import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  Search,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";

import api from "../api/api";

export default function Dashboard() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    fetchItems();
    fetchProfile();
  }, []);

  async function fetchItems() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/items");

      setItems(response.data);
    } catch (error) {
      console.error("Gagal mengambil data barang:", error);

      if (error.response?.status === 401) {
        setError("Sesi login sudah tidak valid.");
        handleLogout();
      } else {
        setError("Gagal mengambil data barang.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function fetchProfile() {
    try {
      const response = await api.get("/users/me");

      setUser(response.data);
    } catch (error) {
      console.error("Gagal mengambil profil:", error);

      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  }

  function handleLogout() {
    localStorage.removeItem("access_token");
    navigate("/login");
  }

  const filteredItems = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) {
      return items;
    }

    return items.filter((item) => {
      const kode = String(
        item.item_code ||
          item.kode_barang ||
          item.kode ||
          ""
      ).toLowerCase();

      const nama = String(
        item.item_name ||
          item.nama_barang ||
          item.nama ||
          ""
      ).toLowerCase();

      const kategori = String(
        item.category ||
          item.kategori ||
          ""
      ).toLowerCase();

      const lokasi = String(
        item.lokasi || ""
      ).toLowerCase();

      return (
        kode.includes(keyword) ||
        nama.includes(keyword) ||
        kategori.includes(keyword) ||
        lokasi.includes(keyword)
      );
    });
  }, [items, search]);

  const totalJenisBarang = items.length;

  const totalStok = items.reduce(
    (total, item) =>
      total + Number(item.stok || 0),
    0
  );

  const stokMinimum = items.filter((item) => {
    const stok = Number(item.stok || 0);

    const minimum = Number(
      item.stok_minimum ||
        item.minimum_stok ||
        10
    );

    return stok <= minimum;
  }).length;

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Header */}
      <header className="flex items-center justify-between border-b bg-white px-6 py-4 shadow-sm">

        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Dashboard Gudang
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Ringkasan dan daftar barang gudang
          </p>
        </div>

        {/* User */}
        <div className="relative">

          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-slate-100"
          >

            {/* Avatar */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
              {user?.username ? (
                user.username.charAt(0).toUpperCase()
              ) : (
                <User size={20} />
              )}
            </div>

            {/* Username */}
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {user?.username || "User"}
              </p>

              <p className="text-xs text-slate-500">
                {user?.role || "user"}
              </p>
            </div>

            <ChevronDown
              size={18}
              className="text-slate-400"
            />

          </button>

          {/* Dropdown Profile */}
          {showProfile && (
            <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">

              <div className="mb-4 flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-semibold text-white">
                  {user?.username
                    ? user.username.charAt(0).toUpperCase()
                    : "U"}
                </div>

                <div>
                  <p className="font-semibold text-slate-800">
                    {user?.username || "User"}
                  </p>

                  <p className="text-sm text-slate-500">
                    {user?.role || "user"}
                  </p>
                </div>

              </div>

              <div className="border-t pt-3">

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                >
                  <LogOut size={18} />

                  <span>
                    Logout
                  </span>
                </button>

              </div>

            </div>
          )}

        </div>

      </header>

      {/* Content */}
      <main className="p-6">

        {/* Cards */}
        <div className="mb-6 grid gap-6 md:grid-cols-3">

          <div className="rounded-xl bg-white p-6 shadow">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Total Jenis Barang
                </p>

                <p className="mt-1 text-3xl font-bold">
                  {totalJenisBarang}
                </p>
              </div>

              <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
                <Package size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Total Stok
                </p>

                <p className="mt-1 text-3xl font-bold">
                  {totalStok}
                </p>
              </div>

              <div className="rounded-lg bg-green-100 p-3 text-green-600">
                <ArrowDownToLine size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Stok Minimum
                </p>

                <p className="mt-1 text-3xl font-bold">
                  {stokMinimum}
                </p>
              </div>

              <div className="rounded-lg bg-orange-100 p-3 text-orange-600">
                <ArrowUpFromLine size={24} />
              </div>
            </div>
          </div>

        </div>

        {/* Daftar Barang */}
        <div className="rounded-xl bg-white p-6 shadow">

          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                Daftar Barang
              </h2>

              <p className="text-sm text-slate-500">
                Cari barang berdasarkan kode, nama, kategori, atau lokasi
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-80">

              <Search
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari barang..."
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="py-10 text-center text-slate-500">
              Memuat data barang...
            </div>
          ) : (

            <div className="overflow-x-auto">

              <table className="w-full text-left text-sm">

                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="px-4 py-3">
                      No
                    </th>

                    <th className="px-4 py-3">
                      Kode Barang
                    </th>

                    <th className="px-4 py-3">
                      Nama Barang
                    </th>

                    <th className="px-4 py-3">
                      Kategori
                    </th>

                    <th className="px-4 py-3">
                      Stok
                    </th>

                    <th className="px-4 py-3">
                      Satuan
                    </th>

                    <th className="px-4 py-3">
                      Lokasi
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {filteredItems.length === 0 ? (

                    <tr>
                      <td
                        colSpan="7"
                        className="px-4 py-10 text-center text-slate-500"
                      >
                        {search
                          ? `Barang "${search}" tidak ditemukan`
                          : "Belum ada data barang"}
                      </td>
                    </tr>

                  ) : (

                    filteredItems.map((item, index) => {

                      const kode =
                        item.item_code ||
                        item.kode_barang ||
                        item.kode ||
                        "-";

                      const nama =
                        item.item_name ||
                        item.nama_barang ||
                        item.nama ||
                        "-";

                      const kategori =
                        item.category ||
                        item.kategori ||
                        "-";

                      const stok =
                        Number(item.stok || 0);

                      const unit =
                        item.unit ||
                        item.satuan ||
                        "-";

                      const lokasi =
                        item.lokasi ||
                        "-";

                      const minimum =
                        Number(
                          item.stok_minimum ||
                            item.minimum_stok ||
                            10
                        );

                      const stokRendah =
                        stok <= minimum;

                      return (
                        <tr
                          key={item.id}
                          className="border-b hover:bg-slate-50"
                        >

                          <td className="px-4 py-3">
                            {index + 1}
                          </td>

                          <td className="px-4 py-3 font-medium">
                            {kode}
                          </td>

                          <td className="px-4 py-3">
                            {nama}
                          </td>

                          <td className="px-4 py-3">
                            {kategori}
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={
                                stokRendah
                                  ? "font-semibold text-red-600"
                                  : "text-slate-700"
                              }
                            >
                              {stok}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            {unit}
                          </td>

                          <td className="px-4 py-3">
                            {lokasi}
                          </td>

                        </tr>
                      );
                    })

                  )}

                </tbody>

              </table>

            </div>

          )}

          {/* Jumlah hasil */}
          {!loading && (
            <div className="mt-4 text-sm text-slate-500">
              Menampilkan {filteredItems.length} dari{" "}
              {items.length} barang
            </div>
          )}

        </div>

      </main>

    </div>
  );
}
