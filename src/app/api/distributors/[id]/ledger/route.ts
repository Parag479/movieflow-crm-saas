import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth, recordAuditLog } from "@/lib/auth";
import { postLedgerEntry, round2, recomputeDistributorLedger } from "@/lib/ledger";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const authResult = await requireTenantAuth(request);
    if ("response" in authResult) return authResult.response;
    const { context } = authResult;

    const distributorId = params.id;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const category = searchParams.get("category");

    // RBAC check
    if (context.roles.includes("DISTRIBUTOR") && context.distributorId && context.distributorId !== distributorId) {
      return NextResponse.json({ success: false, message: "Forbidden." }, { status: 403 });
    }

    const where: any = {
      companyId: context.companyId,
      distributorId,
    };

    if (category) {
      where.category = category;
    }

    if (startDate || endDate) {
      where.entryDate = {};
      if (startDate) where.entryDate.gte = new Date(startDate);
      if (endDate) where.entryDate.lte = new Date(endDate);
    }

    const ledgerEntries = await prisma.distributorLedger.findMany({
      where,
      include: {
        invoice: true,
        payment: true,
        settlement: true,
      },
      orderBy: { entryDate: "asc" },
    });

    const totalDebits = round2(ledgerEntries.reduce((acc, e) => acc + e.debitAmount, 0));
    const totalCredits = round2(ledgerEntries.reduce((acc, e) => acc + e.creditAmount, 0));
    const closingBalance = ledgerEntries.length > 0 ? ledgerEntries[ledgerEntries.length - 1].runningBalance : 0;

    return NextResponse.json({
      success: true,
      data: {
        entries: ledgerEntries,
        summary: {
          totalEntries: ledgerEntries.length,
          totalDebits,
          totalCredits,
          netBalance: closingBalance,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const authResult = await requireTenantAuth(request, ["SUPER_ADMIN", "COMPANY_ADMIN", "FINANCE_MANAGER"]);
    if ("response" in authResult) return authResult.response;
    const { context } = authResult;

    const distributorId = params.id;
    const body = await request.json();
    const { entryType, category = "ADJUSTMENT", referenceNumber, description, amount, notes } = body;

    if (!entryType || !amount || !description) {
      return NextResponse.json({ success: false, message: "Entry type, amount, and description are required." }, { status: 400 });
    }

    const refNo = referenceNumber || `ADJ-${Date.now().toString().slice(-6)}`;

    const entry = await prisma.$transaction(async (tx) => {
      return await postLedgerEntry(tx, {
        companyId: context.companyId,
        distributorId,
        entryType,
        category,
        referenceNumber: refNo,
        description,
        amount: Number(amount),
        createdBy: context.email,
        notes,
      });
    });

    await recordAuditLog({
      companyId: context.companyId,
      userId: context.userId,
      action: "MANUAL_LEDGER_ADJUSTMENT",
      entityName: "DistributorLedger",
      entityId: entry.id,
      details: { distributorId, entryType, amount, description, referenceNumber: refNo },
    });

    return NextResponse.json({ success: true, data: entry, message: "Ledger entry posted successfully." });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
