import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth, recordAuditLog } from "@/lib/auth";
import { postLedgerEntry, round2 } from "@/lib/ledger";

export async function GET(request: Request) {
  try {
    const authResult = await requireTenantAuth(request);
    if ("response" in authResult) return authResult.response;
    const { context } = authResult;

    const invoices = await prisma.invoice.findMany({
      where: {
        companyId: context.companyId,
        ...(context.roles.includes("DISTRIBUTOR") && context.distributorId
          ? { distributorId: context.distributorId }
          : {}),
      },
      include: {
        deal: {
          include: {
            movie: true,
            theater: true,
          },
        },
        distributor: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const payments = await prisma.payment.findMany({
      where: {
        companyId: context.companyId,
        ...(context.roles.includes("DISTRIBUTOR") && context.distributorId
          ? { distributorId: context.distributorId }
          : {}),
      },
      include: {
        distributor: true,
        invoice: true,
      },
      orderBy: { paidAt: "desc" },
    });

    return NextResponse.json({ success: true, data: invoices, payments });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await requireTenantAuth(request, ["SUPER_ADMIN", "COMPANY_ADMIN", "FINANCE_MANAGER"]);
    if ("response" in authResult) return authResult.response;
    const { context } = authResult;

    const body = await request.json();
    const { dealId, distributorId, amountBeforeTax, isInterState = false } = body;

    const subTotal = round2(Number(amountBeforeTax) || 1000000);
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (isInterState) {
      igst = round2(subTotal * 0.18);
    } else {
      cgst = round2(subTotal * 0.09);
      sgst = round2(subTotal * 0.09);
    }
    const total = round2(subTotal + cgst + sgst + igst);

    const invCount = await prisma.invoice.count({ where: { companyId: context.companyId } });
    const invoiceNumber = `INV-2026-${String(invCount + 101).padStart(3, "0")}`;

    // Look up target distributor if not provided
    let resolvedDistributorId = distributorId;
    if (!resolvedDistributorId && dealId) {
      const deal = await prisma.deal.findUnique({ where: { id: dealId } });
      resolvedDistributorId = deal?.distributorId;
    }
    if (!resolvedDistributorId) {
      const defaultDist = await prisma.distributor.findFirst({ where: { companyId: context.companyId } });
      resolvedDistributorId = defaultDist?.id;
    }

    const result = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          companyId: context.companyId,
          dealId: dealId || null,
          distributorId: resolvedDistributorId || null,
          amountBeforeTax: subTotal,
          cgstAmount: cgst,
          sgstAmount: sgst,
          igstAmount: igst,
          totalAmount: total,
          paidAmount: 0,
          balanceAmount: total,
          dueDate: new Date(Date.now() + 86400000 * 14),
          status: "ISSUED",
        },
        include: {
          deal: {
            include: {
              movie: true,
              theater: true,
            },
          },
          distributor: true,
        },
      });

      if (resolvedDistributorId) {
        await postLedgerEntry(tx, {
          companyId: context.companyId,
          distributorId: resolvedDistributorId,
          entryType: "DEBIT",
          category: "INVOICE",
          referenceNumber: invoiceNumber,
          description: `Tax Invoice Issued #${invoiceNumber} for Theatrical Distribution`,
          amount: total,
          invoiceId: invoice.id,
          createdBy: context.email,
        });
      }

      return invoice;
    });

    await recordAuditLog({
      companyId: context.companyId,
      userId: context.userId,
      action: "GENERATE_TAX_INVOICE",
      entityName: "Invoice",
      entityId: result.id,
      details: { invoiceNumber, total, resolvedDistributorId },
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: "GST Tax Invoice generated and posted to distributor ledger.",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
