import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settlements = await prisma.settlement.findMany({
      include: {
        distributor: true,
        theater: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: settlements });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { distributorId, theaterId, movieTitle, territory, week, grossCollection, distributorAmt, exhibitorAmt, status } = body;

    const company = await prisma.company.findFirst();
    if (!company) return NextResponse.json({ success: false, message: "Company not found" }, { status: 404 });

    const gross = Number(grossCollection) || 0;
    const dist = Number(distributorAmt) || gross * 0.5;
    const exh = Number(exhibitorAmt) || gross * 0.5;
    const gst = gross * 0.18;
    const tds = dist * 0.02;
    const net = dist - tds;

    const settlement = await prisma.settlement.create({
      data: {
        companyId: company.id,
        distributorId: distributorId || null,
        theaterId: theaterId || null,
        movieTitle: movieTitle || "Untitled Movie",
        territory: territory || "Mumbai Circuit",
        week: Number(week) || 1,
        grossCollection: gross,
        distributorAmt: dist,
        exhibitorAmt: exh,
        gstAmount: gst,
        tdsAmount: tds,
        netPayable: net,
        status: status || "PENDING",
        settledAt: status === "PAID" ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, data: settlement, message: "Settlement record created" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
