"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then(async res => {
        if (res.status === 401) {
          window.location.href = "/login";
          return null;
        }
        return res.json();
      })
      .then(result => {
        if (result) setData(result);
      });
  }, []);

  const rupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(value || 0);

  return (
    <div className="container">
      <Sidebar />

      <main className="main">
        <Navbar />

        <h2>Ringkasan Keuangan</h2>
        <p>Selamat datang di MoneyTrack.</p>

        <div className="cards">
          <div className="card">
            <p>Pemasukan</p>
            <h2 className="green">
              {rupiah(data?.totalIncome)}
            </h2>
          </div>

          <div className="card">
            <p>Pengeluaran</p>
            <h2 className="red">
              {rupiah(data?.totalExpense)}
            </h2>
          </div>

          <div className="card">
            <p>Saldo Bersih</p>
            <h2>{rupiah(data?.netCash)}</h2>
          </div>

          <div className="card">
            <p>Keuntungan Usaha</p>
            <h2 className="green">
              {rupiah(data?.businessProfit)}
            </h2>
          </div>

          <div className="card">
            <p>Total Tabungan</p>
            <h2>{rupiah(data?.totalSavings)}</h2>
          </div>
        </div>

        <div className="table-box">
          <h3>Informasi Keuangan</h3>
          <p style={{ marginTop: 15 }}>
            Pantau seluruh pemasukan, pengeluaran,
            tabungan, dan keuntungan jual beli
            melalui menu di sebelah kiri.
          </p>
        </div>
      </main>
    </div>
  );
}