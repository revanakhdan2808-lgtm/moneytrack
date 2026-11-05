import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

const types = ["INCOME", "EXPENSE", "PURCHASE", "SALE"];

export async function GET() {
  const userId = await getUser();

  if (!userId) {
    return NextResponse.json({ message: "Silakan login" }, { status: 401 });
  }

  const data = await prisma.transaction.findMany({
    where: { userId },
    include: {
      category: true,
      product: true
    },
    orderBy: { date: "desc" }
  });

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const userId = await getUser();

  if (!userId) {
    return NextResponse.json({ message: "Silakan login" }, { status: 401 });
  }

  const body = await request.json();
  const { type, amount, quantity = 1, description, categoryId, productId } = body;

  if (
    !types.includes(type) ||
    !Number.isFinite(Number(amount)) ||
    Number(amount) <= 0 ||
    !Number.isInteger(Number(quantity)) ||
    Number(quantity) <= 0
  ) {
    return NextResponse.json({ message: "Data transaksi tidak valid" }, { status: 400 });
  }

  if (type === "PURCHASE" || type === "SALE") {
    if (!Number.isInteger(Number(productId))) {
      return NextResponse.json({ message: "Produk wajib dipilih" }, { status: 400 });
    }

    const product = await prisma.product.findFirst({
      where: { id: Number(productId), userId }
    });

    if (!product) {
      return NextResponse.json({ message: "Produk tidak ditemukan" }, { status: 404 });
    }

    if (type === "SALE" && product.stock < Number(quantity)) {
      return NextResponse.json({ message: "Stok produk tidak cukup" }, { status: 400 });
    }

    if (type === "PURCHASE" && Number(amount) !== Number(product.purchasePrice) * Number(quantity)) {
      return NextResponse.json({ message: "Total pembelian harus sesuai harga beli produk" }, { status: 400 });
    }

    if (type === "SALE" && Number(amount) !== Number(product.sellingPrice) * Number(quantity)) {
      return NextResponse.json({ message: "Total penjualan harus sesuai harga jual produk" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          type,
          amount,
          quantity: Number(quantity),
          description,
          productId: product.id,
          userId
        }
      });

      await tx.product.update({
        where: { id: product.id },
        data: {
          stock: type === "PURCHASE"
            ? { increment: Number(quantity) }
            : { decrement: Number(quantity) }
        }
      });

      return transaction;
    });

    return NextResponse.json(result, { status: 201 });
  }

  if (categoryId) {
    const category = await prisma.category.findFirst({
      where: {
        id: Number(categoryId),
        userId,
        type
      }
    });

    if (!category) {
      return NextResponse.json({ message: "Kategori tidak valid" }, { status: 400 });
    }
  }

  const data = await prisma.transaction.create({
    data: {
      type,
      amount,
      description,
      quantity: 1,
      categoryId: categoryId ? Number(categoryId) : null,
      userId
    }
  });

  return NextResponse.json(data, { status: 201 });
}