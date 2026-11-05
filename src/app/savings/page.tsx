"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function SavingsPage() {
  const [data, setData] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [initial, setInitial] = useState("0");

  async function loadData() {
    const res = await fetch("/api/savings");

    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }

    setData(await res.json());
  }

  useEffect(() => {
    loadData();
  }, []);

  async function addSavings(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/savings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        target: Number(target),
        initial: Number(initial)
      })
    });

    const result = await res.json();
    alert(result.message || (res.ok ? "Tabungan ditambahkan" : "Gagal"));

    if (res.ok) {
      setName("");
      setTarget("");
      setInitial("0");
      loadData();
    }
  }

  async function movement(id: number, type: string) {
    const input = prompt(
      type === "DEPOSIT" ? "Nominal setoran:" : "Nominal penarikan:"
    );

    if (!input || !Number.isFinite(Number(input)) || Number(input) <= 0) return;

    const res = await fetch(`/api/savings/${id}/movements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        amount: Number(input)
      })
    });

    const result = await res.json();
    alert(result.message);

    if (res.ok) loadData();
  }

  async function deleteSavings(id: number) {
    if (!confirm("Hapus tabungan ini beserta riwayatnya?")) return;

    const res = await fetch(`/api/savings/${id}`, {
      method: "DELETE"
    });

    const result = await res.json();
    alert(result.message);

    if (res.ok) loadData();
  }

  function getBalance(item: any) {
    return item.movements.reduce((total: number, movement: any) => {
      return total + (movement.type === "DEPOSIT"
        ? Number(movement.amount)
        : -Number(movement.amount));
    }, Number(item.initial));
  }

  return (
    <div className="container">
      <Sidebar />

      <main className="main">
        <Navbar />

        <h2>Tabungan Saya</h2>

        <form className="form" onSubmit={addSavings} style={{ marginTop: 25 }}>
          <h3>Buat Tabungan</h3>

          <label>Nama Tabungan</label>
          <input value={name} onChange={e => setName(e.target.value)} required />

          <label>Target Tabungan</label>
          <input type="number" min="1" value={target}
            onChange={e => setTarget(e.target.value)} required />

          <label>Saldo Awal</label>
          <input type="number" min="0" value={initial}
            onChange={e => setInitial(e.target.value)} required />

          <button className="btn">Buat Tabungan</button>
        </form>

        <div className="cards">
          {data.map(item => {
            const balance = getBalance(item);
            const percentage = Math.min(
              100,
              (balance / Number(item.target)) * 100
            );

            return (
              <div className="card" key={item.id}>
                <h3>{item.name}</h3>

                <p style={{ marginTop: 15 }}>Saldo saat ini</p>
                <h2>Rp{balance.toLocaleString("id-ID")}</h2>

                <p style={{ marginTop: 15 }}>
                  Target: Rp{Number(item.target).toLocaleString("id-ID")}
                </p>

                <div style={{
                  background: "#e5e7eb",
                  height: 9,
                  borderRadius: 10,
                  margin: "15px 0"
                }}>
                  <div style={{
                    width: `${percentage}%`,
                    height: 9,
                    background: "#2563eb",
                    borderRadius: 10
                  }} />
                </div>

                <p>{percentage.toFixed(1)}% tercapai</p>

                <button className="btn"
                  onClick={() => movement(item.id, "DEPOSIT")}>
                  Setor
                </button>

                {" "}

                <button className="btn"
                  onClick={() => movement(item.id, "WITHDRAW")}>
                  Tarik
                </button>

                {" "}

                <button className="btn-danger"
                  onClick={() => deleteSavings(item.id)}>
                  Hapus
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}