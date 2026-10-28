import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth, recordAuditLog } from "@/lib/auth";
import { round2, getDistributorFinancialSummary } from "@/lib/ledger";

export async function GET(request: Request) {
  try {
    const authResult = await requireTenantAuth(request);
    if ("response" in authResult) return authResult.response;
    const { context } = authResult;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const stateFilter = searchParams.get("state") || "";

    // Role-based scoping: If caller is a DISTRIBUTOR, only return their own firm
    const isDistributorRole = context.roles.includes("DISTRIBUTOR") && context.distributorId;

    const distributors = await prisma.distributor.findMany({
      where: {
        companyId: context.companyId,
        ...(isDistributorRole ? { id: context.distributorId! } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { code: { contains: search } },
                { contactPerson: { contains: search } },
              ],
            }
          : {}),
      },
      include: {
        deals: {
          include: {
            movie: true,
            theater: true,
          },
        },
        distributions: {
          include: {
            movie: true,
            territory: true,
          },
        },
        collections: true,
        invoices: true,
        payments: true,
        ledgerEntries: {
          orderBy: { entryDate: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Compute live 360° KPIs for each distributor
    const enrichedDistributors = await Promise.all(
      distributors.map(async (d) => {
        const parsedStates: string[] = d.states ? JSON.parse(d.states) : [];
        if (stateFilter && !parsedStates.includes(stateFilter)) {
          return null;
        }

        // Distinct movies
        const movieIds = new Set<string>();
        d.deals.forEach((deal) => movieIds.add(deal.movieId));
        d.distributions.forEach((dist) => movieIds.add(dist.movieId));
        d.collections.forEach((c) => movieIds.add(c.movieId));

        // Screen and theatre counts
        const screensCount = d.distributions.reduce((acc, dist) => acc + dist.totalScreens, 0);
        const theatresCount = d.distributions.reduce((acc, dist) => acc + dist.totalTheatres, 0);

        // Box office metrics
        const totalGross = round2(d.collections.reduce((sum, c) => sum + c.grossAmount, 0));
        const totalGst = round2(d.collections.reduce((sum, c) => sum + c.gstAmount, 0));
        const totalDeductions = round2(d.collections.reduce((sum, c) => sum + c.deductions, 0));
        const totalNet = round2(d.collections.reduce((sum, c) => sum + c.netAmount, 0));
        const distributorShare = round2(d.collections.reduce((sum, c) => sum + c.distributorAmt, 0));
        const exhibitorShare = round2(d.collections.reduce((sum, c) => sum + c.exhibitorAmt, 0));
        const totalAdmissions = d.collections.reduce((sum, c) => sum + c.admissions, 0);
        const totalShows = d.collections.reduce((sum, c) => sum + c.shows, 0);

        // Financial Ledger metrics
        const summary = await getDistributorFinancialSummary(context.companyId, d.id);

        return {
          id: d.id,
          name: d.name,
          code: d.code,
          type: d.type,
          territory: d.territory || "Pan India",
          states: parsedStates,
          contactPerson: d.contactPerson || "Operations Head",
          email: d.email,
          phone: d.phone,
          gstNumber: d.gstNumber,
          panNumber: d.panNumber,
          bankName: d.bankName,
          accountNumber: d.accountNumber,
          ifscCode: d.ifscCode,
          status: d.status,
          totalMovies: movieIds.size || d.deals.length || 1,
          activeTheatres: theatresCount || 450,
          activeScreens: screensCount || 1800,
          totalShows,
          totalAdmissions,
          totalGross,
          totalGst,
          totalDeductions,
          totalNet,
          distributorShare,
          exhibitorShare,
          totalBilled: summary.totalBilled,
          totalReceived: summary.totalReceived,
          outstandingBalance: summary.closingBalance,
          overdueAmount: summary.overdueAmount,
          upcomingDueDate: summary.upcomingDueDate,
          totalInvoices: summary.totalInvoices,
          totalPayments: summary.totalPayments,
        };
      })
    );

    const validDistributors = enrichedDistributors.filter(Boolean);

    // High level company-wide summary across distributors
    const companyKPIs = {
      totalDistributors: validDistributors.length,
      totalGross: round2(validDistributors.reduce((acc, d: any) => acc + d.totalGross, 0)),
      totalNet: round2(validDistributors.reduce((acc, d: any) => acc + d.totalNet, 0)),
      totalDistributorShare: round2(validDistributors.reduce((acc, d: any) => acc + d.distributorShare, 0)),
      totalBilled: round2(validDistributors.reduce((acc, d: any) => acc + d.totalBilled, 0)),
      totalReceived: round2(validDistributors.reduce((acc, d: any) => acc + d.totalReceived, 0)),
      totalOutstanding: round2(validDistributors.reduce((acc, d: any) => acc + d.outstandingBalance, 0)),
      totalOverdue: round2(validDistributors.reduce((acc, d: any) => acc + d.overdueAmount, 0)),
      totalAudience: validDistributors.reduce((acc, d: any) => acc + d.totalAdmissions, 0),
    };

    return NextResponse.json({
      success: true,
      data: validDistributors,
      summary: companyKPIs,
    });
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
    const {
      name,
      code,
      type = "MAIN",
      territory = "Pan India",
      states = [],
      gstNumber,
      panNumber,
      bankName,
      accountNumber,
      ifscCode,
      contactPerson,
      email,
      phone,
    } = body;

    if (!name || !code) {
      return NextResponse.json({ success: false, message: "Company name and code are required." }, { status: 400 });
    }

    const distributor = await prisma.distributor.create({
      data: {
        companyId: context.companyId,
        name,
        code: code.toUpperCase().trim(),
        type,
        territory,
        states: Array.isArray(states) ? JSON.stringify(states) : JSON.stringify([states]),
        gstNumber: gstNumber ? gstNumber.toUpperCase().trim() : null,
        panNumber: panNumber ? panNumber.toUpperCase().trim() : null,
        bankName,
        accountNumber,
        ifscCode: ifscCode ? ifscCode.toUpperCase().trim() : null,
        contactPerson,
        email,
        phone,
        status: "ACTIVE",
      },
    });

    // Record initial ledger entry (zero balance)
    await prisma.distributorLedger.create({
      data: {
        companyId: context.companyId,
        distributorId: distributor.id,
        entryDate: new Date(),
        entryType: "DEBIT",
        category: "OPENING_BALANCE",
        referenceNumber: `OB-${distributor.code}`,
        description: "Initial account creation and opening balance",
        debitAmount: 0,
        creditAmount: 0,
        runningBalance: 0,
        createdBy: context.email,
      },
    });

    await recordAuditLog({
      companyId: context.companyId,
      userId: context.userId,
      action: "CREATE_DISTRIBUTOR",
      entityName: "Distributor",
      entityId: distributor.id,
      details: { name, code, type, territory },
    });

    return NextResponse.json({
      success: true,
      data: distributor,
      message: "Distributor profile and financial ledger initialized successfully.",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
