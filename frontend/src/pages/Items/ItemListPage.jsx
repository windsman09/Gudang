import { useEffect, useState } from "react";
import api from "../../services/api";

export default function ItemListPage() {
  const [ items, setItems ] = useState([]);

  async function loadData() {
    const res = await api.get("/items");
    setItems(res.data);
  }
  useEffect(() =>{
    loadData();
  }, []);

  return (
  <div>
    <h1> Daftar Barang</h1>

    <table>
      <thead>
        <tr>
          <th>Kode</th>
          <th>Nama</th>
          </tr>
        </thead>
      <tbody>
        {items.map((item)=>(
        <tr key={item.id}>
            <td>{item.item_code}</td>
            <td>{item.item_name}</td>
            <td>{item.stock}</td>
            </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
}
