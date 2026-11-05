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
  const categoryId = Number(id);
  const { name, type } = await request.json();

  if (!Number.isInteger(categoryId) || categoryId < 1 ||
      !name || !["INCOME", "EXPENSE"].includes(type)) {
    return NextResponse.json({ message: "Data tidak valid" }, { status: 400 });
  }

  const existing = await prisma.category.findFirst({
    where: { id: categoryId, userId }
  });

  if (!existing) {
    return NextResponse.json({ message: "Kategori tidak ditemukan" }, { status: 404 });
  }

  const data = await prisma.category.update({
    where: { id: categoryId },
    data: { name, type }
  });

  return NextResponse.json(data);
}

export async function DELETE(request: Request, { params }: Props) {
  const userId = await getUser();
  if (!userId) {
    return NextResponse.json({ message: "Silakan login" }, { status: 401 });
  }

  const { id } = await params;
  const categoryId = Number(id);

  const existing = await prisma.category.findFirst({
    where: { id: categoryId, userId }
  });

  if (!existing) {
    return NextResponse.json({ message: "Kategori tidak ditemukan" }, { status: 404 });
  }

  const used = await prisma.transaction.count({
    where: { categoryId }
  });

  if (used > 0) {
    return NextResponse.json(
      { message: "Kategori masih digunakan transaksi" },
      { status: 400 }
    );
  }

  await prisma.category.delete({
    where: { id: categoryId }
  });

  return NextResponse.json({ message: "Kategori berhasil dihapus" });
}