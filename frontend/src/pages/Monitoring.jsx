import { useEffect, useState } from "react";
import {
  Cpu,
  Power,
  RefreshCw,
  Activity,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle2,
  Sliders,
} from "lucide-react";

import api from "../services/api";

export default function Kontrol() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Mengambil status perangkat IoT dari backend FastAPI
  const fetchDevices = async () => {
    try {
      setLoading(true);
      // Sesuaikan endpoint backend Anda nantinya (contoh: /iot/devices)
      const response = await api.get("/iot/devices");
      setDevices(response.data);
      setError("");
    } catch (err) {
      console.error("Gagal mengambil data IoT:", err);
      setError("Gagal terhubung ke server IoT / Backend.");
      
      // Data dummy untuk pratinjau jika backend belum siap
      setDevices([
        {
          id: 1,
          name: "AC J1A",
          register: "0x0001",
          status: "ON",
          sensor_value: "28.5 °C",
          sensor_label: "Suhu Ruangan",
          is_online: true,
        },
        {
          id: 2,
          name: "Exhaust Fan / Kipas Ventilasi",
          register: "0x0002",
          status: "OFF",
          sensor_value: "65 %",
          sensor_label: "Kelembapan (RH)",
          is_online: true,
        },
        {
          id: 3,
          name: "Lampu J1A",
          register: "0x0003",
          status: "Menyala",
          sensor_value: "250 lumen",
          sensor_label: "Tegangan Listrik",
          is_online: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    // Auto refresh setiap 5 detik untuk pemantauan real-time
    const interval = setInterval(fetchDevices, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fungsi untuk mengirim perintah kontrol (ON/OFF) ke perangkat via ESP32/Modbus
  const handleToggleControl = async (deviceId, currentStatus) => {
    const newStatus = currentStatus === "ON" ? "OFF" : "ON";
    setActionLoading(deviceId);
    setMessage("");
    setError("");

    try {
      // Sesuaikan endpoint backend Anda (contoh: /iot/control)
      await api.post("/iot/control", {
        device_id: deviceId,
        command: newStatus,
      });

      setMessage(`Berhasil mengubah status perangkat ke ${newStatus}`);
      
      // Update state lokal secara instan
      setDevices((prev) =>
        prev.map((dev) =>
          dev.id === deviceId ? { ...dev, status: newStatus } : dev
        )
      );
    } catch (err) {
      console.error("Gagal mengontrol perangkat:", err);
      setError("Gagal mengirim perintah ke perangkat IoT.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Kontrol & Monitoring IoT
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitoring dan Kontrol Kelistrikan Kelas Binus Syahdan
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDevices}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:bg-blue-300"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          Sinkronisasi
        </button>
      </div>

      {/* Pesan Sukses / Error */}
      {message && (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={18} />
          <span>{error} (Menampilkan mode simulasi data lokal)</span>
        </div>
      )}

      {/* Grid Kartu Perangkat */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {devices.map((device) => (
          <div
            key={device.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            {/* Bagian Atas Kartu */}
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                    <Cpu size={22} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {device.name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Modbus Register: {device.register}
                    </p>
                  </div>
                </div>

                {/* Indikator Online/Offline */}
                <div title={device.is_online ? "Perangkat Terhubung" : "Perangkat Offline"}>
                  {device.is_online ? (
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                      <Wifi size={14} /> Online
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600">
                      <WifiOff size={14} /> Offline
                    </span>
                  )}
                </div>
              </div>

              {/* Box Pembacaan Sensor / Telemetri */}
              <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <Activity size={20} className="text-indigo-500" />
                  <div>
                    <p className="text-xs text-slate-500">{device.sensor_label}</p>
                    <p className="text-lg font-bold text-slate-800">
                      {device.sensor_value}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Status Relay</span>
                  <p className={`font-semibold ${device.status === "ON" ? "text-emerald-600" : "text-slate-500"}`}>
                    {device.status}
                  </p>
                </div>
              </div>
            </div>

            {/* Tombol Kontrol Aksi */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleToggleControl(device.id, device.status)}
                disabled={actionLoading === device.id || !device.is_online}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 font-medium text-white transition ${
                  device.status === "ON"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                } disabled:bg-slate-300`}
              >
                {actionLoading === device.id ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Power size={18} />
                    {device.status === "ON" ? "Matikan (OFF)" : "Nyalakan (ON)"}
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
