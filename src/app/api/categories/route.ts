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

  const data = await prisma.category.findMany({
    where: { userId },
    orderBy: { id: "desc" }
  });

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const userId = await getUser();

  if (!userId) {
    return NextResponse.json(
      { message: "Silakan login" },
      { status: 401 }
    );
  }

  const { name, type } = await request.json();

  if (!name || !["INCOME", "EXPENSE"].includes(type)) {
    return NextResponse.json(
      { message: "Nama atau tipe kategori tidak valid" },
      { status: 400 }
    );
  }

  const data = await prisma.category.create({
    data: {
      name,
      type,
      userId
    }
  });

  return NextResponse.json(data, { status: 201 });
}