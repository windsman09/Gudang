import { useState } from "react";

import Sidebar from "./components/Sidebar";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Barang from "./pages/Barang"
import Home from "./pages/Home";
import BarangMasuk from "./pages/BarangMasuk";
import BarangKeluar from "./pages/BarangKeluar";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("access_token")
  );

  const [activePage, setActivePage] = useState("dashboard");

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
  };

  // Kalau belum login, tampilkan Login
  if (!isLoggedIn) {
    return (
      <Login
        onLogin={() => setIsLoggedIn(true)}
      />
    );
  }

  
  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <Dashboard
            onLogout={handleLogout}
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

      default:
        return <Dashboard onLogout={handleLogout} />;
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main className="flex-1">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
