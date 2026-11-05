import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET() {
  const userId = await getUser();

  if (!userId) {
    return NextResponse.json({ message: "Silakan login" }, { status: 401 });
  }

  const data = await prisma.product.findMany({
    where: { userId },
    orderBy: { id: "desc" }
  });

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const userId = await getUser();

  if (!userId) {
    return NextResponse.json({ message: "Silakan login" }, { status: 401 });
  }

  const { name, purchasePrice, sellingPrice, stock } =
    await request.json();

  if (
    !name ||
    !Number.isFinite(Number(purchasePrice)) ||
    !Number.isFinite(Number(sellingPrice)) ||
    !Number.isInteger(Number(stock)) ||
    Number(purchasePrice) < 0 ||
    Number(sellingPrice) < 0 ||
    Number(stock) < 0
  ) {
    return NextResponse.json({ message: "Data produk tidak valid" }, { status: 400 });
  }

  const data = await prisma.product.create({
    data: {
      name,
      purchasePrice,
      sellingPrice,
      stock: Number(stock),
      userId
    }
  });

  return NextResponse.json(data, { status: 201 });
}