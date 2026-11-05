import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo">MoneyTrack.</div>

      <nav className="menu">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/transactions">Transaksi</Link>
        <Link href="/products">Produk</Link>
        <Link href="/categories">Kategori</Link>
        <Link href="/savings">Tabungan</Link>
      </nav>
    </aside>
  );
}