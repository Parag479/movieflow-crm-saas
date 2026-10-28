import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { requireTenantAuth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const authResult = await requireTenantAuth(request);
    if ("response" in authResult) return authResult.response;
    const { context } = authResult;

    const isDistributor = context.roles.includes("DISTRIBUTOR") && !!context.distributorId;

    const deals = await prisma.deal.findMany({
      where: {
        companyId: context.companyId,
        ...(isDistributor ? { distributorId: context.distributorId! } : {}),
      },
      include: {
        movie: true,
        theater: true,
        distributor: true,
        agreements: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: deals });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { movieId, theaterId, distributorId, agreementType, mgAmount, revenueSharePercent, distributorCommission, territory, startDate, endDate } = body;

    const company = await prisma.company.findFirst();
    if (!company) return NextResponse.json({ success: false, message: "Company not found" }, { status: 404 });

    const dealCount = await prisma.deal.count();
    const dealNumber = `DEAL-2026-${String(dealCount + 1).padStart(3, "0")}`;
    const agreementNumber = `AGR-2026-${String(dealCount + 1).padStart(3, "0")}`;

    const newDeal = await prisma.deal.create({
      data: {
        dealNumber,
        companyId: company.id,
        movieId,
        theaterId,
        distributorId: distributorId || null,
        agreementType: agreementType || "REVENUE_SHARE",
        mgAmount: Number(mgAmount) || 0,
        revenueSharePercent: Number(revenueSharePercent) || 50,
        distributorCommission: Number(distributorCommission) || 10,
        territory: territory || "Pan India",
        startDate: new Date(startDate || Date.now()),
        endDate: new Date(endDate || Date.now() + 86400000 * 30),
        status: "EXECUTED",
        agreements: {
          create: {
            agreementNumber,
            companyId: company.id,
            signedDate: new Date(),
            terms: `Standard ${revenueSharePercent || 50}% revenue share split after GST deduction. MG Guarantee: ₹${mgAmount || 0}`,
            status: "ACTIVE",
          },
        },
      },
      include: {
        movie: true,
        theater: true,
        agreements: true,
      },
    });

    return NextResponse.json({ success: true, data: newDeal, message: "Deal executed & PDF agreement generated" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
