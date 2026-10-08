import { useEffect, useState } from "react";

import Sidebar from "./components/Sidebar";
import api from "./api/api";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Barang from "./pages/Barang";
import Home from "./pages/Home";
import BarangMasuk from "./pages/BarangMasuk";
import BarangKeluar from "./pages/BarangKeluar";
import UserManagement from "./pages/UserManagement";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("access_token")
  );

  const [activePage, setActivePage] = useState("dashboard");

  const [user, setUser] = useState(null);

  const [loadingUser, setLoadingUser] = useState(true);

  // =====================================================
  // Ambil profil user yang sedang login
  // =====================================================
  useEffect(() => {
    async function fetchProfile() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setUser(null);
        setLoadingUser(false);
        return;
      }

      try {
        const response = await api.get("/users/me");

        console.log("USER LOGIN:", response.data);

        setUser(response.data);
      } catch (error) {
        console.error(
          "Gagal mengambil profil user:",
          error
        );

        if (error.response?.status === 401) {
          localStorage.removeItem("access_token");
          setUser(null);
          setIsLoggedIn(false);
          setActivePage("dashboard");
        }
      } finally {
        setLoadingUser(false);
      }
    }

    if (isLoggedIn) {
      setLoadingUser(true);
      fetchProfile();
    } else {
      setUser(null);
      setLoadingUser(false);
    }
  }, [isLoggedIn]);

  // =====================================================
  // Logout
  // =====================================================
  const handleLogout = () => {
    localStorage.removeItem("access_token");

    setUser(null);
    setIsLoggedIn(false);
    setActivePage("dashboard");
  };

  // =====================================================
  // Belum login
  // =====================================================
  if (!isLoggedIn) {
    return (
      <Login
        onLogin={() => {
          setIsLoggedIn(true);
          setActivePage("dashboard");
        }}
      />
    );
  }

  // =====================================================
  // Tunggu profile user
  // =====================================================
  if (loadingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-sm text-slate-500">
          Memuat profil user...
        </div>
      </div>
    );
  }

  // =====================================================
  // Render halaman
  // =====================================================
  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <Dashboard
            onLogout={handleLogout}
            user={user}
          />
        );

      case "barang":
        return <Barang />;

      case "barang-masuk":
        return <BarangMasuk />;

      case "barang-keluar":
        return <BarangKeluar />;

      case "home":
        return <Home />;

      case "users":
        // Hanya Super Admin yang boleh membuka halaman ini
        if (user?.role !== "superuser") {
          return (
            <Dashboard
              onLogout={handleLogout}
              user={user}
            />
          );
        }

        return <UserManagement />;

      default:
        return (
          <Dashboard
            onLogout={handleLogout}
            user={user}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        user={user}
      />

      <main className="flex-1">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
