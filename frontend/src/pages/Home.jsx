import { useEffect, useState } from "react";
import api from "../api/api";

export default function Home() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get("/items")
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>Data Barang</h1>

      {data.map((item) => (
        <div key={item.id}>
          {item.name}
        </div>
      ))}
    </div>
  );
}
