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
} from "lucide-react";

import api from "../services/api";

export default function Kontrol() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Mengambil status perangkat dari backend FastAPI (Modbus)
  const fetchDevices = async () => {
    try {
      setLoading(true);
      // Memanggil endpoint GET /device/channels
      const response = await api.get("/device/channels");
      
      // Backend mengembalikan: { "channels": [ { channel_id: 0, status: true }, ... ] }
      // Kita mapping data dari backend agar sesuai dengan format UI Anda
      const mappedDevices = response.data.channels.map((ch) => ({
        id: ch.channel_id,
        // Anda bisa mengkustomisasi nama berdasarkan ID channel
        name: ch.channel_id === 0 ? "AC J1A" : 
              ch.channel_id === 1 ? "Lampu Utama" : 
              `Relay Channel ${ch.channel_id + 1}`,
        register: `CH-${ch.channel_id}`,
        status: ch.status ? "ON" : "OFF", // Konversi boolean ke string
        sensor_value: ch.status ? "Aktif" : "Mati", // Sementara pakai status, karena Modbus ETD8A12 baru baca relay
        sensor_label: "Status Output",
        is_online: true, 
      }));

      setDevices(mappedDevices);
      setError("");
    } catch (err) {
      console.error("Gagal mengambil data IoT:", err);
      setError("Gagal terhubung ke server FastAPI / Modbus.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 5000);
    return () => clearInterval(interval);
  }, []);

  // Mengirim perintah kontrol ke FastAPI
  const handleToggleControl = async (deviceId, currentStatus) => {
    // Tentukan boolean status yang baru (Jika saat ini ON, maka kirim false)
    const isCurrentlyOn = currentStatus === "ON";
    const payloadStatus = !isCurrentlyOn; 
    const newStatusText = payloadStatus ? "ON" : "OFF";

    setActionLoading(deviceId);
    setMessage("");
    setError("");

    try {
      // Memanggil endpoint POST /device/channels/{channel_id}
      // Payload sesuai Pydantic FastAPI: { "status": true/false }
      await api.post(`/device/channels/${deviceId}`, {
        status: payloadStatus,
      });

      setMessage(`Berhasil mengubah status perangkat ke ${newStatusText}`);
      
      // Update state lokal secara instan
      setDevices((prev) =>
        prev.map((dev) =>
          dev.id === deviceId ? { ...dev, status: newStatusText, sensor_value: payloadStatus ? "Aktif" : "Mati" } : dev
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
            Kontrol & Monitoring Kelistrikan Syahdan
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitoring dan Kontrol Kelistrikan Kelas Binus Syahdan (Modbus ETD8A12)
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
          <span>{error}</span>
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
