import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query(
      "SELECT 1 AS koneksi"
    );

    return NextResponse.json({
      success: true,
      message: "Database berhasil terhubung",
      data: rows,
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message,
    }, { status: 500 });
  }
}