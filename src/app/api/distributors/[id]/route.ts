import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth, recordAuditLog } from "@/lib/auth";
import { round2, getDistributorFinancialSummary } from "@/lib/ledger";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const authResult = await requireTenantAuth(request);
    if ("response" in authResult) return authResult.response;
    const { context } = authResult;

    const distributorId = params.id;

    // RBAC: If caller is a DISTRIBUTOR role, they cannot access other distributors
    if (context.roles.includes("DISTRIBUTOR") && context.distributorId && context.distributorId !== distributorId) {
      return NextResponse.json({ success: false, message: "Forbidden. Access restricted to own distributor data." }, { status: 403 });
    }

    const distributor = await prisma.distributor.findFirst({
      where: {
        id: distributorId,
        companyId: context.companyId,
      },
      include: {
        deals: {
          include: {
            movie: true,
            theater: true,
            agreements: true,
          },
        },
        distributions: {
          include: {
            movie: true,
            territory: true,
          },
        },
        collections: {
          include: {
            movie: true,
            theater: true,
            screen: true,
          },
          orderBy: { collectionDate: "desc" },
        },
        invoices: {
          include: {
            payments: true,
          },
          orderBy: { dueDate: "asc" },
        },
        payments: {
          orderBy: { paidAt: "desc" },
        },
        settlements: {
          orderBy: { createdAt: "desc" },
        },
        ledgerEntries: {
          orderBy: { entryDate: "asc" },
        },
      },
    });

    if (!distributor) {
      return NextResponse.json({ success: false, message: "Distributor not found." }, { status: 404 });
    }

    const summary = await getDistributorFinancialSummary(context.companyId, distributor.id);
    const parsedStates: string[] = distributor.states ? JSON.parse(distributor.states) : [];

    // Trend calculations: Monthly Collections & Invoices vs Payments
    const monthlyTrendsMap: Record<string, { month: string; gross: number; distShare: number; paymentsReceived: number; invoiced: number }> = {};
    const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
    months.forEach((m) => {
      monthlyTrendsMap[m] = { month: m, gross: 0, distShare: 0, paymentsReceived: 0, invoiced: 0 };
    });

    distributor.collections.forEach((c) => {
      const date = new Date(c.collectionDate);
      const monthName = date.toLocaleString("en-US", { month: "short" });
      if (monthlyTrendsMap[monthName]) {
        monthlyTrendsMap[monthName].gross += c.grossAmount;
        monthlyTrendsMap[monthName].distShare += c.distributorAmt;
      }
    });

    distributor.payments.forEach((p) => {
      const date = new Date(p.paidAt || p.createdAt);
      const monthName = date.toLocaleString("en-US", { month: "short" });
      if (monthlyTrendsMap[monthName]) {
        monthlyTrendsMap[monthName].paymentsReceived += p.amount;
      }
    });

    distributor.invoices.forEach((inv) => {
      const date = new Date(inv.dueDate);
      const monthName = date.toLocaleString("en-US", { month: "short" });
      if (monthlyTrendsMap[monthName]) {
        monthlyTrendsMap[monthName].invoiced += inv.totalAmount;
      }
    });

    const monthlyTrends = Object.values(monthlyTrendsMap);

    // Group assigned movies
    const assignedMoviesMap: Record<string, any> = {};
    distributor.deals.forEach((d) => {
      if (d.movie && !assignedMoviesMap[d.movie.id]) {
        assignedMoviesMap[d.movie.id] = {
          id: d.movie.id,
          title: d.movie.title,
          posterUrl: d.movie.posterUrl,
          releaseDate: d.movie.releaseDate,
          status: d.movie.status,
          territory: d.territory,
          distributorSharePct: d.distributorSharePct,
          mgAmount: d.mgAmount,
        };
      }
    });
    distributor.distributions.forEach((dist) => {
      if (dist.movie && !assignedMoviesMap[dist.movie.id]) {
        assignedMoviesMap[dist.movie.id] = {
          id: dist.movie.id,
          title: dist.movie.title,
          posterUrl: dist.movie.posterUrl,
          releaseDate: dist.movie.releaseDate,
          status: dist.movie.status,
          territory: dist.territory.name,
          distributorSharePct: dist.distributorSharePct,
          mgAmount: 0,
        };
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          id: distributor.id,
          name: distributor.name,
          code: distributor.code,
          type: distributor.type,
          territory: distributor.territory,
          states: parsedStates,
          gstNumber: distributor.gstNumber,
          panNumber: distributor.panNumber,
          bankName: distributor.bankName,
          accountNumber: distributor.accountNumber,
          ifscCode: distributor.ifscCode,
          contactPerson: distributor.contactPerson,
          email: distributor.email,
          phone: distributor.phone,
          status: distributor.status,
          createdAt: distributor.createdAt,
        },
        financialSummary: summary,
        assignedMovies: Object.values(assignedMoviesMap),
        collections: distributor.collections.map((c) => ({
          id: c.id,
          movieId: c.movieId,
          movieTitle: c.movie.title,
          theaterName: c.theater?.name || "Venue",
          screenName: c.screen?.name || `Screen ${c.screen?.screenNumber || 1}`,
          state: c.state || "Maharashtra",
          city: c.city || "Mumbai",
          collectionDate: c.collectionDate,
          week: c.week,
          dayOfWeek: c.dayOfWeek,
          grossAmount: c.grossAmount,
          gstRate: c.gstRate,
          gstAmount: c.gstAmount,
          deductions: c.deductions,
          netAmount: c.netAmount,
          distributorSharePct: c.distributorSharePct,
          distributorAmt: c.distributorAmt,
          exhibitorAmt: c.exhibitorAmt,
          admissions: c.admissions,
          occupancyRate: c.occupancyRate,
          shows: c.shows,
          status: c.status,
          notes: c.notes,
        })),
        ledger: distributor.ledgerEntries,
        invoices: distributor.invoices.map((inv) => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          amountBeforeTax: inv.amountBeforeTax,
          cgstAmount: inv.cgstAmount,
          sgstAmount: inv.sgstAmount,
          igstAmount: inv.igstAmount,
          totalAmount: inv.totalAmount,
          paidAmount: inv.paidAmount,
          balanceAmount: inv.balanceAmount > 0 ? inv.balanceAmount : inv.totalAmount - (inv.paidAmount || 0),
          dueDate: inv.dueDate,
          paidAt: inv.paidAt,
          status: inv.status,
          notes: inv.notes,
          paymentsCount: inv.payments.length,
        })),
        payments: distributor.payments,
        settlements: distributor.settlements,
        monthlyTrends,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const authResult = await requireTenantAuth(request, ["SUPER_ADMIN", "COMPANY_ADMIN", "FINANCE_MANAGER"]);
    if ("response" in authResult) return authResult.response;
    const { context } = authResult;

    const distributorId = params.id;
    const body = await request.json();

    const updated = await prisma.distributor.update({
      where: {
        id: distributorId,
        companyId: context.companyId,
      },
      data: {
        name: body.name,
        contactPerson: body.contactPerson,
        email: body.email,
        phone: body.phone,
        territory: body.territory,
        states: body.states ? JSON.stringify(body.states) : undefined,
        bankName: body.bankName,
        accountNumber: body.accountNumber,
        ifscCode: body.ifscCode,
        gstNumber: body.gstNumber,
        panNumber: body.panNumber,
        status: body.status,
      },
    });

    await recordAuditLog({
      companyId: context.companyId,
      userId: context.userId,
      action: "UPDATE_DISTRIBUTOR",
      entityName: "Distributor",
      entityId: distributorId,
      details: body,
    });

    return NextResponse.json({ success: true, data: updated, message: "Distributor details updated." });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
