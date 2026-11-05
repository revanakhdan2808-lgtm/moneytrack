import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

type Props = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: Props) {
  const userId = await getUser();

  if (!userId) {
    return NextResponse.json({ message: "Silakan login" }, { status: 401 });
  }

  const { id } = await params;
  const productId = Number(id);
  const { name, purchasePrice, sellingPrice, stock } =
    await request.json();

  if (
    !Number.isInteger(productId) || productId < 1 ||
    !name ||
    !Number.isFinite(Number(purchasePrice)) ||
    !Number.isFinite(Number(sellingPrice)) ||
    !Number.isInteger(Number(stock)) ||
    Number(purchasePrice) < 0 ||
    Number(sellingPrice) < 0 ||
    Number(stock) < 0
  ) {
    return NextResponse.json({ message: "Data tidak valid" }, { status: 400 });
  }

  const existing = await prisma.product.findFirst({
    where: { id: productId, userId }
  });

  if (!existing) {
    return NextResponse.json({ message: "Produk tidak ditemukan" }, { status: 404 });
  }

  const data = await prisma.product.update({
    where: { id: productId },
    data: { name, purchasePrice, sellingPrice, stock: Number(stock) }
  });

  return NextResponse.json(data);
}

export async function DELETE(request: Request, { params }: Props) {
  const userId = await getUser();

  if (!userId) {
    return NextResponse.json({ message: "Silakan login" }, { status: 401 });
  }

  const { id } = await params;
  const productId = Number(id);

  const existing = await prisma.product.findFirst({
    where: { id: productId, userId }
  });

  if (!existing) {
    return NextResponse.json({ message: "Produk tidak ditemukan" }, { status: 404 });
  }

  const used = await prisma.transaction.count({
    where: { productId }
  });

  if (used > 0) {
    return NextResponse.json(
      { message: "Produk masih memiliki riwayat transaksi" },
      { status: 400 }
    );
  }

  await prisma.product.delete({
    where: { id: productId }
  });

  return NextResponse.json({ message: "Produk berhasil dihapus" });
}