"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

type TransactionType = "INCOME" | "EXPENSE" | "PURCHASE" | "SALE";

type Category = {
  id: number;
  name: string;
  type: TransactionType;
};

type Product = {
  id: number;
  name: string;
  stock: number;
  purchasePrice: number | string;
  sellingPrice: number | string;
};

type Transaction = {
  id: number;
  type: TransactionType;
  amount: number | string;
  quantity: number;
  description: string | null;
  categoryId: number | null;
  productId: number | null;
  category?: Category | null;
  product?: Product | null;
};

export default function Transactions() {
  const [data, setData] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [type, setType] = useState<TransactionType>("INCOME");
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

    setData(await transactions.json() as Transaction[]);
    setCategories(await cats.json() as Category[]);
    setProducts(await prods.json() as Product[]);
  }

  useEffect(() => {
    void Promise.resolve().then(loadData);
  }, []);

  function resetForm() {
    setEditingId(null);
    setType("INCOME");
    setAmount("");
    setQuantity("1");
    setDescription("");
    setCategoryId("");
    setProductId("");
  }

  function editTransaction(item: Transaction) {
    setEditingId(item.id);
    setType(item.type);
    setAmount(String(item.amount));
    setQuantity(String(item.quantity));
    setDescription(item.description ?? "");
    setCategoryId(item.categoryId ? String(item.categoryId) : "");
    setProductId(item.productId ? String(item.productId) : "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveTransaction(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const isProductTransaction = type === "PURCHASE" || type === "SALE";
    const body = {
      type,
      amount: Number(amount),
      description,
      quantity: Number(quantity),
      categoryId: isProductTransaction || !categoryId ? null : Number(categoryId),
      productId: isProductTransaction ? Number(productId) : null
    };

    const res = await fetch(
      editingId === null ? "/api/transactions" : `/api/transactions/${editingId}`,
      {
        method: editingId === null ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      }
    );

    const result = await res.json();
    alert(result.message || (
      res.ok
        ? editingId === null ? "Aktivitas berhasil ditambahkan" : "Aktivitas berhasil diperbarui"
        : "Gagal menyimpan aktivitas"
    ));

    if (res.ok) {
      resetForm();
      loadData();
    }
  }

  async function deleteTransaction(id: number) {
    if (!confirm("Yakin ingin menghapus aktivitas ini?")) return;

    const res = await fetch(`/api/transactions/${id}`, {
      method: "DELETE"
    });

    const result = await res.json();
    alert(result.message || (res.ok ? "Aktivitas berhasil dihapus" : "Gagal menghapus aktivitas"));

    if (res.ok) loadData();
  }

  const rupiah = (value: number | string) =>
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

        <h2>Aktivitas Keuangan</h2>
        <p style={{ margin: "10px 0 25px" }}>
          Tambah, lihat, ubah, dan hapus aktivitas keuangan kamu.
        </p>

        <form className="form" onSubmit={saveTransaction}>
          <h3>{editingId === null ? "Tambah Aktivitas" : "Ubah Aktivitas"}</h3>

          <label>Jenis Transaksi</label>
          <select value={type} onChange={e => {
            setType(e.target.value as TransactionType);
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

          <button className="btn">
            {editingId === null ? "Simpan Aktivitas" : "Simpan Perubahan"}
          </button>
          {editingId !== null && (
            <button type="button" className="btn" onClick={resetForm} style={{ marginLeft: 8 }}>
              Batal
            </button>
          )}
        </form>

        <div className="table-box" style={{ marginTop: 25 }}>
          <h3>Daftar Aktivitas</h3>

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
                  <td>{item.description || item.product?.name || item.category?.name || "-"}</td>
                  <td>
                    <button className="btn" onClick={() => editTransaction(item)} style={{ marginRight: 8 }}>
                      Ubah
                    </button>
                    <button className="btn-danger" onClick={() => deleteTransaction(item.id)}>
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={4}>Belum ada aktivitas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}