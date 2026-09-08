import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";

function App() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Home />
      </div>
    </div>
  );
}

export default App;
