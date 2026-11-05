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
  const savingsId = Number(id);
  const { name, target, initial } = await request.json();

  if (
    !Number.isInteger(savingsId) || savingsId < 1 ||
    !name ||
    !Number.isFinite(Number(target)) || Number(target) <= 0 ||
    !Number.isFinite(Number(initial)) || Number(initial) < 0
  ) {
    return NextResponse.json({ message: "Data tidak valid" }, { status: 400 });
  }

  const existing = await prisma.savings.findFirst({
    where: { id: savingsId, userId }
  });

  if (!existing) {
    return NextResponse.json({ message: "Tabungan tidak ditemukan" }, { status: 404 });
  }

  const data = await prisma.savings.update({
    where: { id: savingsId },
    data: { name, target, initial }
  });

  return NextResponse.json(data);
}

export async function DELETE(request: Request, { params }: Props) {
  const userId = await getUser();

  if (!userId) {
    return NextResponse.json({ message: "Silakan login" }, { status: 401 });
  }

  const { id } = await params;
  const savingsId = Number(id);

  const existing = await prisma.savings.findFirst({
    where: { id: savingsId, userId }
  });

  if (!existing) {
    return NextResponse.json({ message: "Tabungan tidak ditemukan" }, { status: 404 });
  }

  await prisma.savings.delete({
    where: { id: savingsId }
  });

  return NextResponse.json({ message: "Tabungan berhasil dihapus" });
}