import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MoneyTrack",
  description: "Sistem Rekap Keuangan dan Jual Beli"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}