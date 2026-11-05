import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET() {
  const userId = await getUser();

  if (!userId) {
    return NextResponse.json({ message: "Silakan login" }, { status: 401 });
  }

  const data = await prisma.savings.findMany({
    where: { userId },
    include: { movements: true },
    orderBy: { id: "desc" }
  });

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const userId = await getUser();

  if (!userId) {
    return NextResponse.json({ message: "Silakan login" }, { status: 401 });
  }

  const { name, target, initial } = await request.json();

  if (
    !name ||
    !Number.isFinite(Number(target)) ||
    Number(target) <= 0 ||
    !Number.isFinite(Number(initial ?? 0)) ||
    Number(initial ?? 0) < 0
  ) {
    return NextResponse.json({ message: "Data tabungan tidak valid" }, { status: 400 });
  }

  const data = await prisma.savings.create({
    data: {
      name,
      target,
      initial: initial ?? 0,
      userId
    }
  });

  return NextResponse.json(data, { status: 201 });
}