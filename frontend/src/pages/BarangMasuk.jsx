import { useState } from "react";
import { ArrowDownToLine, Save } from "lucide-react";

export default function BarangMasuk() {
  const [form, setForm] = useState({
    kode_barang: "",
    nama_barang: "",
    jumlah: "",
    supplier: "",
    tanggal: "",
    keterangan: "",
  });

  const [dataBarangMasuk, setDataBarangMasuk] = useState([]);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (
      !form.kode_barang ||
      !form.nama_barang ||
      !form.jumlah ||
      !form.tanggal
    ) {
      alert("Kode, nama barang, jumlah, dan tanggal wajib diisi.");
      return;
    }

    const dataBaru = {
      id: Date.now(),
      ...form,
    };

    setDataBarangMasuk((prev) => [
      dataBaru,
      ...prev,
    ]);

    setForm({
      kode_barang: "",
      nama_barang: "",
      jumlah: "",
      supplier: "",
      tanggal: "",
      keterangan: "",
    });
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-blue-600 p-3 text-white">
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

      {/* Form */}
      <div className="mb-6 rounded-xl bg-white p-6 shadow">

        <h2 className="mb-5 text-lg font-semibold text-slate-800">
          Tambah Barang Masuk
        </h2>

        <form onSubmit={handleSubmit}>

          <div className="grid gap-4 md:grid-cols-2">

            {/* Kode Barang */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Kode Barang
              </label>

              <input
                type="text"
                name="kode_barang"
                value={form.kode_barang}
                onChange={handleChange}
                placeholder="Contoh: BRG-001"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>

            {/* Nama Barang */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Nama Barang
              </label>

              <input
                type="text"
                name="nama_barang"
                value={form.nama_barang}
                onChange={handleChange}
                placeholder="Nama barang"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>

            {/* Jumlah */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Jumlah
              </label>

              <input
                type="number"
                name="jumlah"
                value={form.jumlah}
                onChange={handleChange}
                min="1"
                placeholder="Jumlah barang"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>

            {/* Supplier */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Supplier
              </label>

              <input
                type="text"
                name="supplier"
                value={form.supplier}
                onChange={handleChange}
                placeholder="Nama supplier"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>

            {/* Tanggal */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Tanggal Masuk
              </label>

              <input
                type="date"
                name="tanggal"
                value={form.tanggal}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>

            {/* Keterangan */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Keterangan
              </label>

              <input
                type="text"
                name="keterangan"
                value={form.keterangan}
                onChange={handleChange}
                placeholder="Keterangan"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>

          </div>

          {/* Button */}
          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-white hover:bg-blue-700"
            >
              <Save size={18} />
              Simpan
            </button>
          </div>

        </form>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white p-6 shadow">

        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-800">
            Riwayat Barang Masuk
          </h2>

          <p className="text-sm text-slate-500">
            Daftar transaksi barang yang telah dimasukkan
          </p>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-left text-sm">

            <thead className="border-b bg-slate-50">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Kode</th>
                <th className="px-4 py-3">Nama Barang</th>
                <th className="px-4 py-3">Jumlah</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Keterangan</th>
              </tr>
            </thead>

            <tbody>

              {dataBarangMasuk.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    Belum ada data barang masuk
                  </td>
                </tr>
              ) : (
                dataBarangMasuk.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      {index + 1}
                    </td>

                    <td className="px-4 py-3 font-medium">
                      {item.kode_barang}
                    </td>

                    <td className="px-4 py-3">
                      {item.nama_barang}
                    </td>

                    <td className="px-4 py-3">
                      {item.jumlah}
                    </td>

                    <td className="px-4 py-3">
                      {item.supplier || "-"}
                    </td>

                    <td className="px-4 py-3">
                      {item.tanggal}
                    </td>

                    <td className="px-4 py-3">
                      {item.keterangan || "-"}
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
