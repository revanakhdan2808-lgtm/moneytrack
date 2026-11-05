"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function Products() {
  const [data, setData] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [stock, setStock] = useState("0");

  async function loadData() {
    const res = await fetch("/api/products");

    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }

    setData(await res.json());
  }

  useEffect(() => {
    loadData();
  }, []);

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        purchasePrice: Number(purchasePrice),
        sellingPrice: Number(sellingPrice),
        stock: Number(stock)
      })
    });

    const result = await res.json();
    alert(result.message || (res.ok ? "Produk ditambahkan" : "Gagal menambahkan produk"));

    if (res.ok) {
      setName("");
      setPurchasePrice("");
      setSellingPrice("");
      setStock("0");
      loadData();
    }
  }

  async function deleteProduct(id: number) {
    if (!confirm("Hapus produk ini?")) return;

    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE"
    });

    const result = await res.json();
    alert(result.message);

    if (res.ok) loadData();
  }

  return (
    <div className="container">
      <Sidebar />

      <main className="main">
        <Navbar />

        <h2>Manajemen Produk</h2>

        <form className="form" onSubmit={addProduct} style={{ marginTop: 25 }}>
          <h3>Tambah Produk</h3>

          <label>Nama Produk</label>
          <input value={name} onChange={e => setName(e.target.value)} required />

          <label>Harga Beli</label>
          <input type="number" min="0" value={purchasePrice}
            onChange={e => setPurchasePrice(e.target.value)} required />

          <label>Harga Jual</label>
          <input type="number" min="0" value={sellingPrice}
            onChange={e => setSellingPrice(e.target.value)} required />

          <label>Stok Awal</label>
          <input type="number" min="0" value={stock}
            onChange={e => setStock(e.target.value)} required />

          <button className="btn">Tambah Produk</button>
        </form>

        <div className="table-box" style={{ marginTop: 25 }}>
          <h3>Daftar Produk</h3>

          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Harga Beli</th>
                <th>Harga Jual</th>
                <th>Stok</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {data.map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>Rp{Number(p.purchasePrice).toLocaleString("id-ID")}</td>
                  <td>Rp{Number(p.sellingPrice).toLocaleString("id-ID")}</td>
                  <td>{p.stock}</td>
                  <td>
                    <button className="btn-danger" onClick={() => deleteProduct(p.id)}>
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}