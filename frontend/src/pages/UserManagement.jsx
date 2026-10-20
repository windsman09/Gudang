import { useEffect, useState } from "react";
import {
  UserPlus,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Wrench,
  User as UserIcon,
  Trash2,
  X,
} from "lucide-react";

import api from "../api/api";


//agar git terima pebaruan

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  // ==========================================
  // Ambil daftar user
  // ==========================================
  async function fetchUsers() {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/users/");
      setUsers(response.data);
    } catch (error) {
      console.error("Gagal mengambil user:", error);
      if (error.response?.status === 403) {
        setError("Anda tidak memiliki akses ke halaman User Management.");
      } else {
        setError("Gagal mengambil daftar user.");
      }
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // Tambah user
  // ==========================================
  async function handleCreateUser(e) {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError("Username dan password wajib diisi.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await api.post("/users/", {
        username: username.trim(),
        password: password,
        full_name: fullName.trim() || username.trim(),
      });

      setUsername("");
      setFullName("");
      setPassword("");
      setShowForm(false);

      await fetchUsers();
    } catch (error) {
      console.error("Gagal membuat user:", error);
      setError(error.response?.data?.detail || "Gagal membuat user.");
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // Ubah role (Menggunakan Dropdown)
  // ==========================================
  async function handleChangeRole(user, newRole) {
    // Jika role tidak berubah, batalkan
    if (user.role === newRole) return;

    const confirmed = window.confirm(
      `Ubah role ${user.username} menjadi ${newRole}?`
    );

    if (!confirmed) {
      // Refresh state lokal agar dropdown kembali ke posisi semula jika dibatalkan
      setUsers([...users]); 
      return;
    }

    try {
      setError("");

      await api.put(`/users/${user.id}/role`, null, {
        params: {
          role: newRole,
        },
      });

      await fetchUsers();
    } catch (error) {
      console.error("Gagal mengubah role:", error);
      setError(error.response?.data?.detail || "Gagal mengubah role.");
      // Kembalikan UI jika gagal
      setUsers([...users]);
    }
  }

  // ==========================================
  // Hapus user
  // ==========================================
  async function handleDeleteUser(user) {
    const confirmed = window.confirm(
      `Yakin ingin menghapus user "${user.username}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      await api.delete(`/users/${user.id}`);
      await fetchUsers();
    } catch (error) {
      console.error("Gagal menghapus user:", error);
      setError(error.response?.data?.detail || "Gagal menghapus user.");
    }
  }

  // Helper untuk merender badge role
  const renderRoleBadge = (role) => {
    switch (role) {
      case "superuser":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
            <ShieldCheck size={14} />
            Superuser
          </span>
        );
      case "admin":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
            <ShieldAlert size={14} />
            Admin
          </span>
        );
      case "operator":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
            <Wrench size={14} />
            Operator
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            <UserIcon size={14} />
            User
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
          <p className="mt-1 text-sm text-slate-500">Kelola akun dan hak akses pengguna</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowForm(true);
            setError("");
          }}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <UserPlus size={18} />
          Tambah User
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Form Tambah User */}
      {showForm && (
        <div className="mb-6 rounded-xl bg-white p-6 shadow">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Tambah User</h2>
              <p className="text-sm text-slate-500">User baru otomatis memiliki role User</p>
            </div>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleCreateUser} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label htmlFor="full_name" className="block text-sm font-medium mb-1.5 text-slate-700">
                Full Name
              </label>
              <input
                id="full_name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

            <div className="flex items-end justify-end gap-3 md:col-span-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Simpan User"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabel User */}
      <div className="overflow-hidden rounded-xl bg-white shadow">
        {loading ? (
          <div className="py-12 text-center text-slate-500">Memuat data user...</div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-slate-500">Belum ada user.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="px-5 py-4">No</th>
                  <th className="px-5 py-4">Username / Nama</th>
                  <th className="px-5 py-4">Role Saat Ini</th>
                  <th className="px-5 py-4 text-right">Ubah Role & Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-4 text-slate-500">{index + 1}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">
                          {user.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800">{user.username}</span>
                          <span className="text-xs text-slate-500">{user.full_name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {renderRoleBadge(user.role)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-3">
                        {/* Dropdown untuk mengubah role */}
                        <select
                          value={user.role}
                          onChange={(e) => handleChangeRole(user, e.target.value)}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 hover:border-slate-400"
                        >
                          <option value="superuser">Super User</option>
                          <option value="admin">Admin</option>
                          <option value="operator">Operator</option>
                          <option value="user">User</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user)}
                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                          title="Hapus user"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
