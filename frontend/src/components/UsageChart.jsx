import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import api from "../api/api";

export default function UsageChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChartData() {
      try {
        setLoading(true);
        const response = await api.get("/analytics/monthly-trend");
        setData(response.data);
      } catch (err) {
        console.error("Gagal mengambil data tren pemakaian:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchChartData();
  }, []);

  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <h2 className="text-xl font-semibold text-slate-800 mb-1">
        Grafik Total Pemakain Barang
      </h2>
      <p className="text-sm text-slate-500 mb-6">
        Total barang keluar dalam 6 bulan terakhir
      </p>

      {loading ? (
        <div className="h-[300px] flex items-center justify-center text-slate-400">
          Memuat grafik...
        </div>
      ) : (
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <LineChart
              data={data}
              margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                itemStyle={{ color: "#38bdf8" }}
              />
              <Line
                type="monotone"
                dataKey="total_used"
                name="Total Barang Keluar"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 5, fill: "#3b82f6" }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
