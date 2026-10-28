import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get("movieId");

    const expenses = await prisma.expense.findMany({
      where: movieId ? { movieId } : {},
      include: {
        movie: true,
      },
      orderBy: { expenseDate: "desc" },
    });

    return NextResponse.json({ success: true, data: expenses });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { movieId, category, description, amount, territory, invoiceRef, status } = body;

    const company = await prisma.company.findFirst();
    if (!company) return NextResponse.json({ success: false, message: "Company not found" }, { status: 404 });

    const expense = await prisma.expense.create({
      data: {
        companyId: company.id,
        movieId,
        category: category || "MISC",
        description: description || "Distribution Expense",
        amount: Number(amount) || 0,
        territory: territory || "Pan India",
        invoiceRef,
        status: status || "PAID",
      },
    });

    // Update total dist cost on Movie
    const allExp = await prisma.expense.findMany({ where: { movieId } });
    const totalExp = allExp.reduce((acc, e) => acc + e.amount, 0);

    await prisma.movie.update({
      where: { id: movieId },
      data: { totalDistCost: totalExp },
    });

    return NextResponse.json({ success: true, data: expense, message: "Expense logged successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
