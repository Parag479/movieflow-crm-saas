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

    const payments = await prisma.payment.findMany({
      where: {
        companyId: context.companyId,
        distributorId,
      },
      include: {
        invoice: true,
      },
      orderBy: { paidAt: "desc" },
    });

    return NextResponse.json({ success: true, data: payments });
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
    const {
      amount,
      invoiceId,
      paymentMethod = "BANK_TRANSFER",
      paymentType = "INVOICE_PAYMENT",
      transactionRef,
      receiptUrl,
      notes,
      paidAt,
    } = body;

    const paymentAmount = round2(Number(amount));
    if (!paymentAmount || paymentAmount <= 0) {
      return NextResponse.json({ success: false, message: "Payment amount must be greater than zero." }, { status: 400 });
    }

    const payCount = await prisma.payment.count({ where: { companyId: context.companyId } });
    const paymentNumber = `PAY-2026-${String(payCount + 101).padStart(4, "0")}`;

    // Execute payment and ledger entry atomically
    const result = await prisma.$transaction(async (tx) => {
      let targetInvoice = null;
      if (invoiceId) {
        targetInvoice = await tx.invoice.findFirst({
          where: { id: invoiceId, companyId: context.companyId },
        });
      }

      // 1. Create Payment Record (Never treated as collection money until this record is created)
      const payment = await tx.payment.create({
        data: {
          paymentNumber,
          companyId: context.companyId,
          distributorId,
          invoiceId: targetInvoice?.id || null,
          dealId: targetInvoice?.dealId || null,
          amount: paymentAmount,
          paymentType,
          paymentMethod,
          transactionRef: transactionRef || `UTR-${Date.now().toString().slice(-8)}`,
          receiptUrl: receiptUrl || null,
          notes: notes || null,
          status: "COMPLETED",
          verifiedAt: new Date(),
          verifiedBy: context.email,
          paidAt: paidAt ? new Date(paidAt) : new Date(),
        },
      });

      // 2. If paid against an invoice, update invoice paidAmount & balanceAmount
      if (targetInvoice) {
        const newPaidAmount = round2((targetInvoice.paidAmount || 0) + paymentAmount);
        const newBalanceAmount = Math.max(0, round2(targetInvoice.totalAmount - newPaidAmount));
        const newStatus = newBalanceAmount === 0 ? "PAID" : "PARTIALLY_PAID";

        await tx.invoice.update({
          where: { id: targetInvoice.id },
          data: {
            paidAmount: newPaidAmount,
            balanceAmount: newBalanceAmount,
            status: newStatus,
            paidAt: newStatus === "PAID" ? new Date() : targetInvoice.paidAt,
          },
        });
      }

      // 3. Post Immutable Credit to Distributor Financial Ledger
      const ledger = await postLedgerEntry(tx, {
        companyId: context.companyId,
        distributorId,
        entryType: "CREDIT",
        category: "PAYMENT",
        referenceNumber: paymentNumber,
        description: `Payment Received via ${paymentMethod} (${transactionRef || "Bank Transfer"})${targetInvoice ? ` against ${targetInvoice.invoiceNumber}` : ""}`,
        amount: paymentAmount,
        paymentId: payment.id,
        invoiceId: targetInvoice?.id || undefined,
        createdBy: context.email,
        notes: notes || undefined,
      });

      return { payment, ledger };
    });

    await recordAuditLog({
      companyId: context.companyId,
      userId: context.userId,
      action: "RECORD_PAYMENT",
      entityName: "Payment",
      entityId: result.payment.id,
      details: { distributorId, amount: paymentAmount, paymentNumber, invoiceId },
    });

    return NextResponse.json({
      success: true,
      data: result.payment,
      ledger: result.ledger,
      message: `Verified payment of ₹${paymentAmount.toLocaleString("en-IN")} recorded and credited to ledger.`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
