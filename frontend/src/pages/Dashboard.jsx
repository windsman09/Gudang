import { useEffect, useMemo, useState } from "react";
import api from "../api/api";

function Dashboard() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/items");

      const result = Array.isArray(response.data)
        ? response.data
        : response.data.items || [];

      setItems(result);
    } catch (err) {
      console.error("Gagal mengambil data barang:", err);

      setError(
        err.response?.data?.detail ||
          "Data barang gagal diambil. Pastikan FastAPI berjalan."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) {
      return items;
    }

    return items.filter((item) => {
      const kode = String(
        item.kode || item.kode_barang || ""
      ).toLowerCase();

      const nama = String(
        item.nama || item.nama_barang || ""
      ).toLowerCase();

      const kategori = String(
        item.kategori || ""
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

  const totalStok = items.reduce((total, item) => {
    return total + Number(item.stok || 0);
  }, 0);

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
    <div className="dashboard">

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Dashboard Gudang</h1>
          <p>Ringkasan data persediaan barang.</p>
        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={fetchItems}
          disabled={loading}
        >
          {loading ? "Memuat..." : "Muat Ulang"}
        </button>
      </div>

      {/* Cards */}
      <div className="dashboard-cards">

        <div className="card">
          <h3>Jenis Barang</h3>
          <p className="card-number">
            {totalJenisBarang}
          </p>
          <span>Jumlah barang terdaftar</span>
        </div>

        <div className="card">
          <h3>Total Stok</h3>
          <p className="card-number">
            {totalStok}
          </p>
          <span>Total seluruh stok barang</span>
        </div>

        <div className="card">
          <h3>Stok Minimum</h3>
          <p className="card-number">
            {stokMinimum}
          </p>
          <span>Barang yang perlu diperiksa</span>
        </div>

        <div className="card">
          <h3>Status API</h3>
          <p className="card-status">
            {error
              ? "Terputus"
              : loading
                ? "Memuat"
                : "Terhubung"}
          </p>
          <span>Koneksi FastAPI</span>
        </div>

      </div>

      {/* Table */}
      <div className="table-container">

        <div className="table-header">
          <h2>Data Barang</h2>

          <input
            type="text"
            className="search-input"
            placeholder="Cari barang..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        {/* Error */}
        {error && (
          <div className="error-message">
            <strong>Terjadi kesalahan: </strong>
            {error}

            <button
              type="button"
              onClick={fetchItems}
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <p className="loading-message">
            Mengambil data barang...
          </p>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          filteredItems.length === 0 && (
            <p className="empty-message">
              {search
                ? "Barang yang dicari tidak ditemukan."
                : "Data barang masih kosong."}
            </p>
          )}

        {/* Table data */}
        {!loading &&
          !error &&
          filteredItems.length > 0 && (
            <div className="table-responsive">

              <table>
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Kode</th>
                    <th>Nama</th>
                    <th>Kategori</th>
                    <th>Stok</th>
                    <th>Lokasi</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredItems.map((item, index) => {
                    const stok = Number(
                      item.stok || 0
                    );

                    const minimum = Number(
                      item.stok_minimum ||
                        item.minimum_stok ||
                        10
                    );

                    const statusRendah =
                      stok <= minimum;

                    return (
                      <tr
                        key={
                          item.id ||
                          item.kode ||
                          index
                        }
                      >
                        <td>{index + 1}</td>

                        <td>
                          {item.kode ||
                            item.kode_barang ||
                            "_"}
                        </td>

                        <td>
                          {item.nama ||
                            item.nama_barang ||
                            "_"}
                        </td>

                        <td>
                          {item.kategori || "_"}
                        </td>

                        <td>{stok}</td>

                        <td>
                          {item.lokasi || "_"}
                        </td>

                        <td>
                          <span
                            className={
                              statusRendah
                                ? "status status-low"
                                : "status status-available"
                            }
                          >
                            {statusRendah
                              ? "Stok Rendah"
                              : "Tersedia"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

              </table>

            </div>
          )}

      </div>

    </div>
  );
}

export default Dashboard;
