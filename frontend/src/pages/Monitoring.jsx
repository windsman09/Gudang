import { useState, useEffect } from "react";
import { Thermometer, Sun, Power, RefreshCw, AlertCircle } from "lucide-react";

export default function Monitoring() {
  // State untuk memilih kelas mana yang sedang dilihat
  const [selectedClass, setSelectedClass] = useState("kelas-1");
  
  // State untuk menyimpan data dari backend
  const [sensors, setSensors] = useState({ temperature: 0, light_level: 0 });
  const [relays, setRelays] = useState([]);
  
  // State untuk loading dan error handling
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fungsi untuk mengambil semua data (Sensor + Relay) sekaligus
  const fetchDeviceStatus = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Sesuaikan URL dengan alamat backend FastAPI Anda
      const response = await fetch(`http://localhost:8000/api/modbus/${selectedClass}/status`);
      if (!response.ok) throw new Error("Gagal mengambil data dari server");
      
      const result = await response.json();
      setSensors(result.data.sensors);
      setRelays(result.data.relays);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk menyalakan/mematikan alat
  const toggleRelay = async (index, currentState) => {
    try {
      // Optimistic update: Ubah UI duluan agar terasa cepat
      const newRelays = [...relays];
      newRelays[index].is_on = !currentState;
      setRelays(newRelays);

      // Kirim perintah ke backend
      const response = await fetch(`http://localhost:8000/api/modbus/${selectedClass}/relay/${index}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: !currentState }),
      });

      if (!response.ok) {
        throw new Error("Gagal mengubah status relay");
      }
    } catch (err) {
      alert(err.message);
      // Rollback jika gagal
      fetchDeviceStatus();
    }
  };

  // Otomatis ambil data setiap kali dropdown kelas diubah
  useEffect(() => {
    fetchDeviceStatus();
    
    // (Opsional) Auto-refresh setiap 5 detik
    // const interval = setInterval(fetchDeviceStatus, 5000);
    // return () => clearInterval(interval);
  }, [selectedClass]);

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
            <option value="kelas-1"> Kelas J (A)</option>
            <option value="kelas-2">Kelas J (B)</option>
            <option value="kelas-3">Kelas 3</option>
            <option value="kelas-4">Kelas 4</option>
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
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-600">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* --- BAGIAN SENSOR --- */}
      <h2 className="mb-4 text-lg font-semibold text-slate-700">Kondisi Ruangan</h2>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card Suhu */}
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="rounded-full bg-orange-100 p-3 text-orange-600">
            <Thermometer size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Suhu Ruangan</p>
            <p className="text-2xl font-bold text-slate-800">
              {sensors.temperature ? `${sensors.temperature}°C` : "--"}
            </p>
          </div>
        </div>

        {/* Card Cahaya */}
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="rounded-full bg-yellow-100 p-3 text-yellow-600">
            <Sun size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Intensitas Cahaya</p>
            <p className="text-2xl font-bold text-slate-800">
              {sensors.light_level ? `${sensors.light_level} Lux` : "--"}
            </p>
          </div>
        </div>
      </div>

      {/* --- BAGIAN KONTROL RELAY --- */}
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
            <div
              className={`rounded-full p-3 ${
                relay.is_on ? "bg-green-500 text-white" : "bg-slate-100 text-slate-400"
              }`}
            >
              <Power size={24} />
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-700">Channel {relay.channel}</p>
              <p className={`text-xs ${relay.is_on ? "text-green-600 font-bold" : "text-slate-400"}`}>
                {relay.is_on ? "MENYALA" : "MATI"}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
