import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET() {
  const userId = await getUser();

  if (!userId) {
    return NextResponse.json(
      { message: "Silakan login" },
      { status: 401 }
    );
  }

  const transactions = await prisma.transaction.findMany({
    where: { userId },
    include: { product: true }
  });

  let income = 0;
  let expense = 0;
  let businessIncome = 0;
  let businessCost = 0;

  for (const item of transactions) {
    const amount = Number(item.amount);

    if (item.type === "INCOME") {
      income += amount;
    }

    if (item.type === "EXPENSE") {
      expense += amount;
    }

    if (item.type === "SALE") {
      businessIncome += amount;
    }

    if (item.type === "PURCHASE") {
      // Pembelian stok bukan langsung biaya keuntungan.
      // Harga pokok dihitung berdasarkan jumlah barang terjual.
    }

    if (item.type === "SALE" && item.product) {
      businessCost +=
        Number(item.product.purchasePrice) * item.quantity;
    }
  }

  const totalIncome = income + businessIncome;
  const totalExpense = expense;
  const netCash = totalIncome - totalExpense;

  const savings = await prisma.savings.findMany({
    where: { userId },
    include: { movements: true }
  });

  const totalSavings = savings.reduce((total, item) => {
    const deposits = item.movements
      .filter(m => m.type === "DEPOSIT")
      .reduce((sum, m) => sum + Number(m.amount), 0);

    const withdrawals = item.movements
      .filter(m => m.type === "WITHDRAW")
      .reduce((sum, m) => sum + Number(m.amount), 0);

    return total + Number(item.initial) + deposits - withdrawals;
  }, 0);

  return NextResponse.json({
    income,
    businessIncome,
    expense,
    totalIncome,
    totalExpense,
    netCash,
    businessProfit: businessIncome - businessCost,
    totalSavings
  });
}