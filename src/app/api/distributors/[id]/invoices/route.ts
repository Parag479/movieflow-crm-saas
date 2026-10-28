import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth, recordAuditLog } from "@/lib/auth";
import { postLedgerEntry, round2 } from "@/lib/ledger";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const authResult = await requireTenantAuth(request);
    if ("response" in authResult) return authResult.response;
    const { context } = authResult;

    const distributorId = params.id;
    if (context.roles.includes("DISTRIBUTOR") && context.distributorId && context.distributorId !== distributorId) {
      return NextResponse.json({ success: false, message: "Forbidden." }, { status: 403 });
    }

    const invoices = await prisma.invoice.findMany({
      where: {
        companyId: context.companyId,
        distributorId,
      },
      include: {
        deal: {
          include: { movie: true, theater: true },
        },
        payments: true,
      },
      orderBy: { dueDate: "asc" },
    });

    return NextResponse.json({ success: true, data: invoices });
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
    const { dealId, amountBeforeTax, dueDate, notes, isInterState = false } = body;

    const subTotal = round2(Number(amountBeforeTax));
    if (!subTotal || subTotal <= 0) {
      return NextResponse.json({ success: false, message: "Base amount before tax must be greater than zero." }, { status: 400 });
    }

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (isInterState) {
      igst = round2(subTotal * 0.18);
    } else {
      cgst = round2(subTotal * 0.09);
      sgst = round2(subTotal * 0.09);
    }
    const totalAmount = round2(subTotal + cgst + sgst + igst);

    const invCount = await prisma.invoice.count({ where: { companyId: context.companyId } });
    const invoiceNumber = `INV-2026-DIST-${String(invCount + 101).padStart(4, "0")}`;

    const result = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          companyId: context.companyId,
          distributorId,
          dealId: dealId || null,
          amountBeforeTax: subTotal,
          cgstAmount: cgst,
          sgstAmount: sgst,
          igstAmount: igst,
          totalAmount,
          paidAmount: 0,
          balanceAmount: totalAmount,
          dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 86400000 * 14),
          status: "ISSUED",
          notes: notes || "Box Office Theatrical Revenue Share Settlement Billing",
        },
      });

      // Post debit entry in distributor ledger
      const ledger = await postLedgerEntry(tx, {
        companyId: context.companyId,
        distributorId,
        entryType: "DEBIT",
        category: "INVOICE",
        referenceNumber: invoiceNumber,
        description: `Tax Invoice Issued: ${notes || "Theatrical Revenue Share Settlement"}`,
        amount: totalAmount,
        invoiceId: invoice.id,
        createdBy: context.email,
        notes: `CGST: ₹${cgst}, SGST: ₹${sgst}, IGST: ₹${igst}`,
      });

      return { invoice, ledger };
    });

    await recordAuditLog({
      companyId: context.companyId,
      userId: context.userId,
      action: "ISSUE_INVOICE",
      entityName: "Invoice",
      entityId: result.invoice.id,
      details: { distributorId, invoiceNumber, totalAmount },
    });

    return NextResponse.json({
      success: true,
      data: result.invoice,
      ledger: result.ledger,
      message: `Tax Invoice #${invoiceNumber} issued for ₹${totalAmount.toLocaleString("en-IN")} and debited to ledger.`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
