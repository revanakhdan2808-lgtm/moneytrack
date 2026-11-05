"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function Transactions() {
  const [data, setData] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [type, setType] = useState("INCOME");
  const [amount, setAmount] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [productId, setProductId] = useState("");

  async function loadData() {
    const [transactions, cats, prods] = await Promise.all([
      fetch("/api/transactions"),
      fetch("/api/categories"),
      fetch("/api/products")
    ]);

    if (transactions.status === 401) {
      window.location.href = "/login";
      return;
    }

    setData(await transactions.json());
    setCategories(await cats.json());
    setProducts(await prods.json());
  }

  useEffect(() => {
    loadData();
  }, []);

  async function addTransaction(e: React.FormEvent) {
    e.preventDefault();

    const body: any = {
      type,
      amount: Number(amount),
      description,
      quantity: Number(quantity)
    };

    if (type === "PURCHASE" || type === "SALE") {
      body.productId = Number(productId);
    } else if (categoryId) {
      body.categoryId = Number(categoryId);
    }

    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const result = await res.json();
    alert(result.message || (res.ok ? "Transaksi berhasil ditambahkan" : "Gagal menyimpan"));

    if (res.ok) {
      setAmount("");
      setDescription("");
      setQuantity("1");
      loadData();
    }
  }

  async function deleteTransaction(id: number) {
    if (!confirm("Yakin ingin menghapus transaksi?")) return;

    const res = await fetch(`/api/transactions/${id}`, {
      method: "DELETE"
    });

    const result = await res.json();
    alert(result.message);

    if (res.ok) loadData();
  }

  const rupiah = (value: any) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(Number(value));

  return (
    <div className="container">
      <Sidebar />

      <main className="main">
        <Navbar />

        <h2>Data Transaksi</h2>
        <p style={{ margin: "10px 0 25px" }}>
          Kelola seluruh transaksi keuangan kamu.
        </p>

        <form className="form" onSubmit={addTransaction}>
          <h3>Tambah Transaksi</h3>

          <label>Jenis Transaksi</label>
          <select value={type} onChange={e => {
            setType(e.target.value);
            setCategoryId("");
            setProductId("");
            setAmount("");
          }}>
            <option value="INCOME">Pemasukan</option>
            <option value="EXPENSE">Pengeluaran</option>
            <option value="PURCHASE">Pembelian Barang</option>
            <option value="SALE">Penjualan Barang</option>
          </select>

          {type === "INCOME" || type === "EXPENSE" ? (
            <>
              <label>Kategori</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                <option value="">Pilih kategori</option>
                {categories
                  .filter(c => c.type === type)
                  .map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
              </select>
            </>
          ) : (
            <>
              <label>Produk</label>
              <select value={productId} onChange={e => {
                const id = e.target.value;
                setProductId(id);
                const product = products.find(p => p.id === Number(id));

                if (product) {
                  const price = type === "SALE"
                    ? Number(product.sellingPrice)
                    : Number(product.purchasePrice);

                  setAmount(String(price * Number(quantity)));
                }
              }}>
                <option value="">Pilih produk</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Stok: {p.stock})
                  </option>
                ))}
              </select>

              <label>Jumlah Barang</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={e => {
                  setQuantity(e.target.value);
                  const product = products.find(p => p.id === Number(productId));

                  if (product) {
                    const price = type === "SALE"
                      ? Number(product.sellingPrice)
                      : Number(product.purchasePrice);

                    setAmount(String(price * Number(e.target.value)));
                  }
                }}
                required
              />
            </>
          )}

          <label>Nominal (Rp)</label>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
          />

          <label>Keterangan</label>
          <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Contoh: Penjualan sepatu"
          />

          <button className="btn">Simpan Transaksi</button>
        </form>

        <div className="table-box" style={{ marginTop: 25 }}>
          <h3>Riwayat Transaksi</h3>

          <table>
            <thead>
              <tr>
                <th>Jenis</th>
                <th>Nominal</th>
                <th>Keterangan</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {data.map(item => (
                <tr key={item.id}>
                  <td>{item.type}</td>
                  <td>{rupiah(item.amount)}</td>
                  <td>{item.description || item.product?.name || "-"}</td>
                  <td>
                    <button
                      className="btn-danger"
                      onClick={() => deleteTransaction(item.id)}
                    >
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