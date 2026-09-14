import { useState } from "react";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import BarangMasuk from "./pages/BarangMasuk";
import BarangKeluar from "./pages/BarangKeluar";

function App() {
  const [activePage, setActivePage] = useState("dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;

      case "barang-masuk":
        return <BarangMasuk />;

      case "barang-keluar":
        return <BarangKeluar />;

      case "home":
        return <Home />;

      default:
        return <Dashboard />;
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
