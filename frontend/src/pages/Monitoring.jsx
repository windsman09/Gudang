import { useState, useEffect } from "react";
import { Thermometer, Sun, Power, RefreshCw, AlertCircle } from "lucide-react";
import api from "../api/api";

export default function Monitoring() {
  const [selectedClass, setSelectedClass] = useState("kelas-1");
  const [sensors, setSensors] = useState({
    temperature: null,
    light_level: null,
    recorded_at: null,
  });
  const [relays, setRelays] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sensorError, setSensorError] = useState(null);

  const fetchDeviceStatus = async () => {
    setIsLoading(true);
    setError(null);
    setSensorError(null);

    const [relayResult, sensorResult] = await Promise.allSettled([
      api.get(`/api/modbus/${selectedClass}/status`),
      api.get(`/api/sensors/${selectedClass}/latest`),
    ]);

    if (relayResult.status === "fulfilled") {
      setRelays(relayResult.value.data.data.relays || []);
    } else {
      setError(
        relayResult.reason.response?.data?.detail ||
        "Gagal mengambil status perangkat Modbus"
      );
    }

    if (sensorResult.status === "fulfilled") {
      setSensors(sensorResult.value.data);
    } else {
      setSensors({ temperature: null, light_level: null, recorded_at: null });
      setSensorError(
        sensorResult.reason.response?.data?.detail ||
        "Gagal mengambil data sensor"
      );
    }

    setIsLoading(false);
  };

  const toggleRelay = async (index, currentState) => {
    const previousRelays = [...relays];
    const updatedRelays = [...relays];
    updatedRelays[index] = { ...updatedRelays[index], is_on: !currentState };
    setRelays(updatedRelays);

    try {
      await api.post(`/api/modbus/${selectedClass}/relay/${index}`, {
        state: !currentState,
      });
    } catch (err) {
      setRelays(previousRelays);
      alert(err.response?.data?.detail || "Gagal mengubah status relay");
    }
  };

  useEffect(() => {
    fetchDeviceStatus();
    const intervalId = setInterval(fetchDeviceStatus, 10000);
    return () => clearInterval(intervalId);
  }, [selectedClass]);

  const getDeviceName = (classId, index, defaultChannel) => {
    const deviceNames = {
      "kelas-1": ["Lampu J1A", "J1A AC no.1", "J1A AC no.2", "J1A AC no.3", "J2A Lampu", "J2A AC no.1", "J2A AC no.2", "J2A AC no.3", "Lampu J3A", "J3A AC no.1", "J3A AC no.2", "J3A AC no.3"],
      "kelas-2": ["AC K1B", "Lampu K1B", "Belum", "Belum", "Belum", "Cadangan"],
      "kelas-3": ["Lampu J1B", "J1B AC no.1", "J1B AC no.2", "J1B AC no.3", "Lampu J2B", "J2B AC no.1", "J2B AC no.2", "J2B AC no.3", "Lampu J3B", "J3B AC no.1", "J3B AC no.2", "J3B AC no.3"],
      "kelas-4": ["Lampu K2A", "K2A AC no.1", "K2A AC no.2", "K2A AC no.3", "Lampu K2B", "K2B AC no.1", "K2B AC no.2", "Hall Kecil no.1", "Hall Kecil no.2", "AHU H2 1", "AHU H2 2"],
      "kelas-5": ["Lampu K2C", "K2C AC no.1", "K2C AC no.2", "Lampu K2D", "K2D AC no.1", "K2D AC no.2", "AHU LSC", "AHU Rektorat", "Spare"],
    };
    return deviceNames[classId]?.[index] || `Channel ${defaultChannel ?? index + 1}`;
  };

  const formatRecordedAt = (value) => {
    if (!value) return "Belum ada data";
    return new Date(value).toLocaleString("id-ID");
  };

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Monitoring Kelas</h1>
          <p className="text-slate-500">Pantau suhu, cahaya, dan kontrol perangkat ruangan</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium focus:border-blue-500 focus:outline-none"
          >
            <option value="kelas-1">Kelas J (A)</option>
            <option value="kelas-2">Kelas K1</option>
            <option value="kelas-3">Kelas J (B)</option>
            <option value="kelas-4">Kelas K2 & Hall</option>
            <option value="kelas-5">Kelas K2 & AHU</option>
            <option value="kelas-6">Kelas 6 (sementara)</option>
          </select>

          <button
            onClick={fetchDeviceStatus}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-600">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}
      {sensorError && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-amber-50 p-4 text-amber-700">
          <AlertCircle size={20} />
          <p>{sensorError}</p>
        </div>
      )}

      <h2 className="mb-4 text-lg font-semibold text-slate-700">Kondisi Ruangan</h2>
      <div className="mb-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="rounded-full bg-orange-100 p-3 text-orange-600">
            <Thermometer size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Suhu Ruangan</p>
            <p className="text-2xl font-bold text-slate-800">
              {sensors.temperature == null ? "--" : `${sensors.temperature}°C`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="rounded-full bg-yellow-100 p-3 text-yellow-600">
            <Sun size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Intensitas Cahaya</p>
            <p className="text-2xl font-bold text-slate-800">
              {sensors.light_level == null ? "--" : `${sensors.light_level} Lux`}
            </p>
          </div>
        </div>
      </div>
      <p className="mb-8 text-xs text-slate-500">
        Data sensor terakhir: {formatRecordedAt(sensors.recorded_at)}
      </p>

      <h2 className="mb-4 text-lg font-semibold text-slate-700">Kontrol Perangkat</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {relays.map((relay, index) => (
          <button
            key={index}
            onClick={() => toggleRelay(index, relay.is_on)}
            className={`flex flex-col items-center justify-center gap-3 rounded-xl border p-4 transition-all duration-200 ${
              relay.is_on
                ? "border-green-200 bg-green-50 shadow-inner"
                : "border-slate-200 bg-white shadow-sm hover:border-blue-300"
            }`}
          >
            <div className={`rounded-full p-3 ${
              relay.is_on ? "bg-green-500 text-white" : "bg-slate-100 text-slate-400"
            }`}>
              <Power size={24} />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-700">
                {getDeviceName(selectedClass, index, relay.channel)}
              </p>
              <p className={`text-xs ${relay.is_on ? "font-bold text-green-600" : "text-slate-400"}`}>
                {relay.is_on ? "MENYALA" : "MATI"}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
