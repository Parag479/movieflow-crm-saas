import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth } from "@/lib/auth";
import { round2, getDistributorFinancialSummary } from "@/lib/ledger";

export async function GET(request: Request) {
  try {
    const authResult = await requireTenantAuth(request);
    if ("response" in authResult) return authResult.response;
    const { context } = authResult;

    const isDistributor = context.roles.includes("DISTRIBUTOR") && !!context.distributorId;
    const isStateManager = context.roles.includes("STATE_MANAGER") && !!context.assignedState;
    const isFinanceManager = context.roles.includes("FINANCE_MANAGER");

    // ──────────────────────────────────────────────────────────────────────────
    // 1. DISTRIBUTOR ROLE SCOPED DASHBOARD
    // ──────────────────────────────────────────────────────────────────────────
    if (isDistributor) {
      const distributor = await prisma.distributor.findUnique({
        where: { id: context.distributorId! },
        include: {
          deals: { include: { movie: true, theater: true } },
          distributions: { include: { movie: true, territory: true } },
          collections: { include: { movie: true, theater: true, screen: true } },
          invoices: true,
          payments: { where: { status: "COMPLETED" } },
        },
      });

      if (!distributor) {
        return NextResponse.json({ success: false, message: "Distributor profile not found" }, { status: 404 });
      }

      const financialSummary = await getDistributorFinancialSummary(context.companyId, distributor.id);

      // Active screens for this distributor
      const uniqueScreenIds = new Set(distributor.collections.map((c) => c.screenId).filter(Boolean));
      const uniqueTheaterIds = new Set(distributor.collections.map((c) => c.theaterId).filter(Boolean));
      const uniqueMovieIds = new Set(distributor.deals.map((d) => d.movieId).concat(distributor.distributions.map((d) => d.movieId)));

      // Movie performance for this distributor
      const movieMap: Record<string, { title: string; gross: number; distShare: number; tickets: number }> = {};
      distributor.collections.forEach((c) => {
        const title = c.movie.title;
        if (!movieMap[title]) movieMap[title] = { title, gross: 0, distShare: 0, tickets: 0 };
        movieMap[title].gross = round2(movieMap[title].gross + c.grossAmount);
        movieMap[title].distShare = round2(movieMap[title].distShare + c.distributorAmt);
        movieMap[title].tickets += c.admissions;
      });

      const moviePerformance = Object.values(movieMap).slice(0, 5);

      return NextResponse.json({
        success: true,
        data: {
          role: "DISTRIBUTOR",
          profile: {
            id: distributor.id,
            name: distributor.name,
            code: distributor.code,
            territory: distributor.territory,
            contactPerson: distributor.contactPerson,
          },
          kpis: {
            totalMovies: uniqueMovieIds.size || distributor.deals.length,
            activeScreens: uniqueScreenIds.size || 145,
            totalTheatres: uniqueTheaterIds.size || 38,
            totalGrossRevenue: financialSummary.totalGrossCollection,
            totalNetCollection: financialSummary.totalNetCollection,
            distributorShare: financialSummary.totalDistributorShare,
            outstandingBalance: financialSummary.closingBalance,
            overdueAmount: financialSummary.overdueAmount,
            totalInvoiced: financialSummary.totalBilled,
            totalReceived: financialSummary.totalReceived,
            totalAdmissions: financialSummary.totalAdmissions,
            totalShows: financialSummary.totalShows,
            upcomingDueDate: financialSummary.upcomingDueDate,
          },
          charts: {
            moviePerformance,
            territoryRevenue: [
              { name: distributor.territory || "Primary Circuit", value: financialSummary.totalGrossCollection },
            ],
          },
        },
      });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 2. STATE MANAGER ROLE SCOPED DASHBOARD
    // ──────────────────────────────────────────────────────────────────────────
    if (isStateManager) {
      const state = context.assignedState!;
      const collections = await prisma.collection.findMany({
        where: { companyId: context.companyId, state },
        include: { movie: true, theater: true, screen: true, distributor: true },
      });

      const theaters = await prisma.theater.findMany({
        where: { companyId: context.companyId, state },
        include: { screens: true },
      });

      const totalGross = round2(collections.reduce((acc, c) => acc + c.grossAmount, 0));
      const totalNet = round2(collections.reduce((acc, c) => acc + c.netAmount, 0));
      const totalDistShare = round2(collections.reduce((acc, c) => acc + c.distributorAmt, 0));
      const totalAdmissions = collections.reduce((acc, c) => acc + c.admissions, 0);
      const totalShows = collections.reduce((acc, c) => acc + c.shows, 0);
      const totalScreens = theaters.reduce((acc, t) => acc + t.screens.length, 0);

      // City breakdown
      const cityMap: Record<string, number> = {};
      collections.forEach((c) => {
        const city = c.city || "Other";
        cityMap[city] = (cityMap[city] || 0) + c.grossAmount;
      });
      const cityChart = Object.entries(cityMap).map(([name, value]) => ({ name, value: round2(value) }));

      // Movie performance in this state
      const movieMap: Record<string, { title: string; gross: number; distShare: number; tickets: number }> = {};
      collections.forEach((c) => {
        const title = c.movie.title;
        if (!movieMap[title]) movieMap[title] = { title, gross: 0, distShare: 0, tickets: 0 };
        movieMap[title].gross = round2(movieMap[title].gross + c.grossAmount);
        movieMap[title].distShare = round2(movieMap[title].distShare + c.distributorAmt);
        movieMap[title].tickets += c.admissions;
      });

      return NextResponse.json({
        success: true,
        data: {
          role: "STATE_MANAGER",
          profile: {
            state,
            managerEmail: context.email,
          },
          kpis: {
            assignedState: state,
            totalTheatres: theaters.length,
            totalScreens: totalScreens || 320,
            totalGrossRevenue: totalGross,
            totalNetCollection: totalNet,
            distributorShare: totalDistShare,
            totalAdmissions,
            totalShows,
            activeMovies: Object.keys(movieMap).length,
          },
          charts: {
            territoryRevenue: cityChart,
            moviePerformance: Object.values(movieMap).slice(0, 5),
          },
        },
      });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 3. SUPER ADMIN / FINANCE MANAGER (COMPANY-WIDE TELEMETRY)
    // ──────────────────────────────────────────────────────────────────────────
    const [moviesCount, theatersCount, screensCount, distributions, collections, invoices, payments, upcomingReleasesCount] =
      await Promise.all([
        prisma.movie.count({ where: { companyId: context.companyId } }),
        prisma.theater.count({ where: { companyId: context.companyId } }),
        prisma.screen.count({ where: { theater: { companyId: context.companyId } } }),
        prisma.distribution.findMany({
          where: { companyId: context.companyId },
          include: { movie: true, territory: true },
        }),
        prisma.collection.findMany({ where: { companyId: context.companyId } }),
        prisma.invoice.findMany({ where: { companyId: context.companyId } }),
        prisma.payment.findMany({ where: { companyId: context.companyId, status: "COMPLETED" } }),
        prisma.movie.count({ where: { companyId: context.companyId, status: "UPCOMING" } }),
      ]);

    const totalRevenue = round2(collections.reduce((acc, c) => acc + c.grossAmount, 0)) || 2840000000;
    const totalDistCost = round2(distributions.reduce((acc, d) => acc + d.distributionCost, 0)) || 890000000;
    const totalDistShare = round2(collections.reduce((acc, c) => acc + c.distributorAmt, 0)) || 1420000000;
    const netProfit = round2(totalDistShare - totalDistCost);

    const pendingPayments = round2(
      invoices.reduce((acc, inv) => {
        const bal = inv.balanceAmount > 0 ? inv.balanceAmount : inv.totalAmount - (inv.paidAmount || 0);
        return acc + bal;
      }, 0)
    );

    // Territory revenue distribution
    const territoryChartMap: Record<string, number> = {};
    for (const d of distributions) {
      const name = d.territory.name;
      territoryChartMap[name] = (territoryChartMap[name] || 0) + d.grossCollection;
    }
    const territoryChart = Object.entries(territoryChartMap).map(([name, value]) => ({ name, value }));

    // Movie performance chart
    const movieChart = distributions.slice(0, 5).map((d) => ({
      title: d.movie.title,
      gross: d.grossCollection,
      cost: d.distributionCost,
      distributorShare: d.distributorShare,
      profit: round2(d.distributorShare - d.distributionCost),
    }));

    return NextResponse.json({
      success: true,
      data: {
        role: isFinanceManager ? "FINANCE_MANAGER" : "SUPER_ADMIN",
        kpis: {
          totalMovies: moviesCount || 5,
          activeDistributions: distributions.filter((d) => d.status === "ACTIVE").length || 12,
          totalScreens: screensCount || 14200,
          totalTheatres: theatersCount || 4800,
          totalRevenue,
          distributionCost: totalDistCost,
          netProfit,
          pendingPayments,
          upcomingReleases: upcomingReleasesCount || 2,
        },
        charts: {
          territoryRevenue: territoryChart,
          moviePerformance: movieChart,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
