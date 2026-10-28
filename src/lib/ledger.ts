import { prisma } from "./prisma";

/**
 * Precision round to 2 decimal places to prevent floating-point inaccuracies
 */
export function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export interface TaxAndShareCalculation {
  grossAmount: number;
  gstRate: number; // e.g. 18 for 18%
  gstAmount: number;
  deductions: number;
  netAmount: number;
  distributorSharePct: number;
  exhibitorSharePct: number;
  distributorAmt: number;
  exhibitorAmt: number;
}

/**
 * Calculates net collection and revenue splits using contractual sharing rules and taxes.
 * Formula:
 * 1. GST = Gross * (gstRate / (100 + gstRate)) or Gross * (gstRate/100) depending on ticket price inclusion.
 *    In Indian theatrical distribution, Net Box Office = Gross / (1 + GST/100) or Gross - GST.
 *    Here: Net = Gross - GST - Deductions.
 * 2. Distributor Share = Net * (distributorSharePct / 100)
 * 3. Exhibitor Share = Net - Distributor Share
 */
export function calculateTaxAndShares(
  gross: number,
  gstRate: number = 18,
  deductions: number = 0,
  distributorSharePct: number = 50
): TaxAndShareCalculation {
  const grossAmount = round2(gross);
  // Standard Indian Multiplex GST split (18% GST standard on tickets > Rs 100)
  // Effective GST deduction from gross:
  const gstAmount = round2((grossAmount * gstRate) / (100 + gstRate));
  const validDeductions = round2(deductions);
  const netAmount = Math.max(0, round2(grossAmount - gstAmount - validDeductions));

  const distPct = Math.min(100, Math.max(0, distributorSharePct));
  const exhPct = round2(100 - distPct);

  const distributorAmt = round2((netAmount * distPct) / 100);
  const exhibitorAmt = round2(netAmount - distributorAmt);

  return {
    grossAmount,
    gstRate,
    gstAmount,
    deductions: validDeductions,
    netAmount,
    distributorSharePct: distPct,
    exhibitorSharePct: exhPct,
    distributorAmt,
    exhibitorAmt,
  };
}

export interface PostLedgerEntryParams {
  companyId: string;
  distributorId: string;
  entryDate?: Date;
  entryType: "DEBIT" | "CREDIT";
  category: "OPENING_BALANCE" | "INVOICE" | "PAYMENT" | "SETTLEMENT" | "ADJUSTMENT";
  referenceNumber: string;
  description: string;
  amount: number;
  invoiceId?: string;
  paymentId?: string;
  settlementId?: string;
  createdBy?: string;
  notes?: string;
}

/**
 * Atomic Ledger Posting Engine:
 * Debits increase distributor receivable / outstanding (e.g. Invoiced distributor share)
 * Credits decrease distributor receivable (e.g. Verified payments received / settlement credits)
 */
export async function postLedgerEntry(
  tx: any, // Prisma client or Prisma transaction
  params: PostLedgerEntryParams
) {
  const db = tx || prisma;
  const amount = round2(params.amount);
  const debitAmount = params.entryType === "DEBIT" ? amount : 0;
  const creditAmount = params.entryType === "CREDIT" ? amount : 0;

  // Retrieve last running balance for this distributor
  const lastEntry = await db.distributorLedger.findFirst({
    where: {
      companyId: params.companyId,
      distributorId: params.distributorId,
    },
    orderBy: { entryDate: "desc" },
  });

  const previousBalance = lastEntry ? lastEntry.runningBalance : 0;
  // Positive balance represents amount receivable from distributor
  const newBalance = round2(previousBalance + debitAmount - creditAmount);

  return await db.distributorLedger.create({
    data: {
      companyId: params.companyId,
      distributorId: params.distributorId,
      entryDate: params.entryDate || new Date(),
      entryType: params.entryType,
      category: params.category,
      referenceNumber: params.referenceNumber,
      description: params.description,
      debitAmount,
      creditAmount,
      runningBalance: newBalance,
      invoiceId: params.invoiceId || null,
      paymentId: params.paymentId || null,
      settlementId: params.settlementId || null,
      createdBy: params.createdBy || "System",
      notes: params.notes || null,
    },
  });
}

/**
 * Recomputes all running balances for a distributor from beginning of time
 */
export async function recomputeDistributorLedger(companyId: string, distributorId: string) {
  return await prisma.$transaction(async (tx) => {
    const entries = await tx.distributorLedger.findMany({
      where: { companyId, distributorId },
      orderBy: { entryDate: "asc" },
    });

    let running = 0;
    for (const entry of entries) {
      running = round2(running + entry.debitAmount - entry.creditAmount);
      if (entry.runningBalance !== running) {
        await tx.distributorLedger.update({
          where: { id: entry.id },
          data: { runningBalance: running },
        });
      }
    }
    return running;
  });
}

/**
 * Calculates current ledger summary for a distributor
 */
export async function getDistributorFinancialSummary(companyId: string, distributorId: string) {
  const [invoices, payments, lastEntry, collections] = await Promise.all([
    prisma.invoice.findMany({
      where: { companyId, distributorId },
    }),
    prisma.payment.findMany({
      where: { companyId, distributorId, status: "COMPLETED" },
    }),
    prisma.distributorLedger.findFirst({
      where: { companyId, distributorId },
      orderBy: { entryDate: "desc" },
    }),
    prisma.collection.findMany({
      where: { companyId, distributorId },
    }),
  ]);

  const totalBilled = round2(invoices.reduce((sum, inv) => sum + inv.totalAmount, 0));
  const totalReceived = round2(payments.reduce((sum, pay) => sum + pay.amount, 0));
  const closingBalance = lastEntry ? lastEntry.runningBalance : round2(totalBilled - totalReceived);

  const now = new Date();
  let overdueAmount = 0;
  let upcomingDueDate: Date | null = null;

  for (const inv of invoices) {
    if (inv.status !== "PAID") {
      const balance = inv.balanceAmount > 0 ? inv.balanceAmount : inv.totalAmount - (inv.paidAmount || 0);
      if (new Date(inv.dueDate) < now) {
        overdueAmount += balance;
      } else {
        if (!upcomingDueDate || new Date(inv.dueDate) < upcomingDueDate) {
          upcomingDueDate = new Date(inv.dueDate);
        }
      }
    }
  }

  // Box office collection metrics
  const totalGrossCollection = round2(collections.reduce((sum, c) => sum + c.grossAmount, 0));
  const totalNetCollection = round2(collections.reduce((sum, c) => sum + c.netAmount, 0));
  const totalDistributorShare = round2(collections.reduce((sum, c) => sum + c.distributorAmt, 0));
  const totalExhibitorShare = round2(collections.reduce((sum, c) => sum + c.exhibitorAmt, 0));
  const totalAdmissions = collections.reduce((sum, c) => sum + c.admissions, 0);
  const totalShows = collections.reduce((sum, c) => sum + c.shows, 0);

  return {
    totalBilled,
    totalReceived,
    closingBalance: round2(closingBalance),
    overdueAmount: round2(overdueAmount),
    upcomingDueDate,
    totalGrossCollection,
    totalNetCollection,
    totalDistributorShare,
    totalExhibitorShare,
    totalAdmissions,
    totalShows,
    totalInvoices: invoices.length,
    totalPayments: payments.length,
  };
}
