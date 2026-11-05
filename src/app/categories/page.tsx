"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function Categories() {
  const [data, setData] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("INCOME");

  async function loadData() {
    const res = await fetch("/api/categories");

    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }

    setData(await res.json());
  }

  useEffect(() => {
    loadData();
  }, []);

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type })
    });

    const result = await res.json();
    alert(result.message || (res.ok ? "Kategori ditambahkan" : "Gagal"));

    if (res.ok) {
      setName("");
      loadData();
    }
  }

  async function deleteCategory(id: number) {
    if (!confirm("Hapus kategori?")) return;

    const res = await fetch(`/api/categories/${id}`, {
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

        <h2>Manajemen Kategori</h2>

        <form className="form" onSubmit={addCategory} style={{ marginTop: 25 }}>
          <h3>Tambah Kategori</h3>

          <label>Nama Kategori</label>
          <input value={name} onChange={e => setName(e.target.value)} required />

          <label>Jenis Kategori</label>
          <select value={type} onChange={e => setType(e.target.value)}>
            <option value="INCOME">Pemasukan</option>
            <option value="EXPENSE">Pengeluaran</option>
          </select>

          <button className="btn">Tambah Kategori</button>
        </form>

        <div className="table-box" style={{ marginTop: 25 }}>
          <h3>Daftar Kategori</h3>

          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Jenis</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {data.map(c => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.type}</td>
                  <td>
                    <button className="btn-danger"
                      onClick={() => deleteCategory(c.id)}>
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