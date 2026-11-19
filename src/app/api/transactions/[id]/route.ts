import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

type Props = {
  params: Promise<{ id: string }>;
};

const types = ["INCOME", "EXPENSE", "PURCHASE", "SALE"];

class TransactionMutationError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

export async function PUT(request: Request, { params }: Props) {
  const userId = await getUser();

  if (!userId) {
    return NextResponse.json({ message: "Silakan login" }, { status: 401 });
  }

  const { id } = await params;
  const transactionId = Number(id);

  if (!Number.isInteger(transactionId) || transactionId < 1) {
    return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });
  }

  const body = await request.json();
  const { type, amount, quantity = 1, description, categoryId, productId } = body;
  const amountValue = Number(amount);
  const quantityValue = Number(quantity);
  const isProductTransaction = type === "PURCHASE" || type === "SALE";

  if (
    typeof type !== "string" ||
    !types.includes(type) ||
    !Number.isFinite(amountValue) ||
    amountValue <= 0 ||
    !Number.isInteger(quantityValue) ||
    quantityValue <= 0 ||
    (description !== undefined && description !== null && typeof description !== "string")
  ) {
    return NextResponse.json({ message: "Data transaksi tidak valid" }, { status: 400 });
  }

  const normalizedCategoryId =
    categoryId === undefined || categoryId === null || categoryId === ""
      ? null
      : Number(categoryId);
  const normalizedProductId =
    productId === undefined || productId === null || productId === ""
      ? null
      : Number(productId);

  if (
    (!isProductTransaction && normalizedCategoryId !== null &&
      (!Number.isInteger(normalizedCategoryId) || normalizedCategoryId < 1)) ||
    (isProductTransaction &&
      (normalizedProductId === null ||
        !Number.isInteger(normalizedProductId) ||
        normalizedProductId < 1))
  ) {
    return NextResponse.json(
      { message: isProductTransaction ? "Produk wajib dipilih" : "Kategori tidak valid" },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.transaction.findFirst({
        where: { id: transactionId, userId }
      });

      if (!existing) {
        throw new TransactionMutationError("Transaksi tidak ditemukan", 404);
      }

      if (existing.productId && existing.type === "PURCHASE") {
        const reverted = await tx.product.updateMany({
          where: {
            id: existing.productId,
            userId,
            stock: { gte: existing.quantity }
          },
          data: { stock: { decrement: existing.quantity } }
        });

        if (reverted.count === 0) {
          throw new TransactionMutationError(
            "Transaksi tidak bisa diubah karena stok pembelian sudah terpakai",
            400
          );
        }
      } else if (existing.productId && existing.type === "SALE") {
        await tx.product.updateMany({
          where: { id: existing.productId, userId },
          data: { stock: { increment: existing.quantity } }
        });
      }

      let nextProductId: number | null = null;
      let nextCategoryId: number | null = null;

      if (isProductTransaction) {
        const product = normalizedProductId === null
          ? null
          : await tx.product.findFirst({
              where: { id: normalizedProductId, userId }
            });

        if (!product) {
          throw new TransactionMutationError("Produk tidak ditemukan", 404);
        }

        const price = type === "SALE" ? product.sellingPrice : product.purchasePrice;
        if (amountValue !== Number(price) * quantityValue) {
          throw new TransactionMutationError(
            type === "SALE"
              ? "Total penjualan harus sesuai harga jual produk"
              : "Total pembelian harus sesuai harga beli produk",
            400
          );
        }

        if (type === "SALE" && product.stock < quantityValue) {
          throw new TransactionMutationError("Stok produk tidak cukup", 400);
        }

        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: type === "PURCHASE"
              ? { increment: quantityValue }
              : { decrement: quantityValue }
          }
        });
        nextProductId = product.id;
      } else if (normalizedCategoryId !== null) {
        const category = await tx.category.findFirst({
          where: {
            id: normalizedCategoryId,
            userId,
            type
          }
        });

        if (!category) {
          throw new TransactionMutationError("Kategori tidak valid", 400);
        }
        nextCategoryId = category.id;
      }

      return tx.transaction.update({
        where: { id: transactionId },
        data: {
          type,
          amount: amountValue,
          quantity: isProductTransaction ? quantityValue : 1,
          description: typeof description === "string" && description.trim()
            ? description.trim()
            : null,
          categoryId: nextCategoryId,
          productId: nextProductId
        },
        include: { category: true, product: true }
      });
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof TransactionMutationError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    throw error;
  }
}

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

  try {
    await prisma.$transaction(async (tx) => {
      if (existing.productId && existing.type === "PURCHASE") {
        const reverted = await tx.product.updateMany({
          where: {
            id: existing.productId,
            userId,
            stock: { gte: existing.quantity }
          },
          data: { stock: { decrement: existing.quantity } }
        });

        if (reverted.count === 0) {
          throw new TransactionMutationError(
            "Transaksi tidak bisa dihapus karena stok pembelian sudah terpakai",
            400
          );
        }
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
  } catch (error) {
    if (error instanceof TransactionMutationError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    throw error;
  }

  return NextResponse.json({ message: "Transaksi berhasil dihapus" });
}