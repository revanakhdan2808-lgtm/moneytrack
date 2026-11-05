import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

type Props = {
  params: Promise<{ id: string }>;
};

export async function DELETE(request: Request, { params }: Props) {
  const userId = await getUser();

  if (!userId) {
    return NextResponse.json({ message: "Silakan login" }, { status: 401 });
  }

  const { id } = await params;
  const transactionId = Number(id);

  if (!Number.isInteger(transactionId) || transactionId < 1) {
    return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });
  }

  const existing = await prisma.transaction.findFirst({
    where: { id: transactionId, userId }
  });

  if (!existing) {
    return NextResponse.json({ message: "Transaksi tidak ditemukan" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    if (existing.productId && existing.type === "PURCHASE") {
      await tx.product.updateMany({
        where: { id: existing.productId, userId },
        data: { stock: { decrement: existing.quantity } }
      });
    }

    if (existing.productId && existing.type === "SALE") {
      await tx.product.updateMany({
        where: { id: existing.productId, userId },
        data: { stock: { increment: existing.quantity } }
      });
    }

    await tx.transaction.delete({
      where: { id: transactionId }
    });
  });

  return NextResponse.json({ message: "Transaksi berhasil dihapus" });
}