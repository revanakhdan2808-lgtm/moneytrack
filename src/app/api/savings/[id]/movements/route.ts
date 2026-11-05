import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

type Props = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: Props) {
  const userId = await getUser();

  if (!userId) {
    return NextResponse.json({ message: "Silakan login" }, { status: 401 });
  }

  const { id } = await params;
  const savingsId = Number(id);
  const { type, amount, note } = await request.json();

  if (
    !Number.isInteger(savingsId) ||
    !["DEPOSIT", "WITHDRAW"].includes(type) ||
    !Number.isFinite(Number(amount)) ||
    Number(amount) <= 0
  ) {
    return NextResponse.json({ message: "Data tidak valid" }, { status: 400 });
  }

  const savings = await prisma.savings.findFirst({
    where: { id: savingsId, userId },
    include: { movements: true }
  });

  if (!savings) {
    return NextResponse.json({ message: "Tabungan tidak ditemukan" }, { status: 404 });
  }

  const balance = savings.movements.reduce((total, movement) => {
    return total + (movement.type === "DEPOSIT"
      ? Number(movement.amount)
      : -Number(movement.amount));
  }, Number(savings.initial));

  if (type === "WITHDRAW" && Number(amount) > balance) {
    return NextResponse.json({ message: "Saldo tabungan tidak cukup" }, { status: 400 });
  }

  const movement = await prisma.savingsMovement.create({
    data: {
      savingsId,
      type,
      amount,
      note
    }
  });

  return NextResponse.json({
    message: "Riwayat tabungan berhasil disimpan",
    movement
  }, { status: 201 });
}