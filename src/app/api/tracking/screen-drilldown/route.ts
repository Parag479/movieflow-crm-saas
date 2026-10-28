import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth } from "@/lib/auth";
import { round2 } from "@/lib/ledger";

export async function GET(request: Request) {
  try {
    const authResult = await requireTenantAuth(request);
    if ("response" in authResult) return authResult.response;
    const { context } = authResult;

    const { searchParams } = new URL(request.url);
    const distributorId = searchParams.get("distributorId");
    const movieId = searchParams.get("movieId");
    const state = searchParams.get("state");
    const city = searchParams.get("city");
    const theaterId = searchParams.get("theaterId");
    const screenId = searchParams.get("screenId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // RBAC: If caller is a DISTRIBUTOR, restrict to their distributorId
    const effectiveDistributorId =
      context.roles.includes("DISTRIBUTOR") && context.distributorId
        ? context.distributorId
        : distributorId;

    // RBAC: If caller is STATE_MANAGER, restrict to their state
    const effectiveState =
      context.roles.includes("STATE_MANAGER") && context.assignedState
        ? context.assignedState
        : state;

    const where: any = {
      companyId: context.companyId,
      ...(effectiveDistributorId ? { distributorId: effectiveDistributorId } : {}),
      ...(movieId ? { movieId } : {}),
      ...(effectiveState ? { state: effectiveState } : {}),
      ...(city ? { city } : {}),
      ...(theaterId ? { theaterId } : {}),
      ...(screenId ? { screenId } : {}),
    };

    if (startDate || endDate) {
      where.collectionDate = {};
      if (startDate) where.collectionDate.gte = new Date(startDate);
      if (endDate) where.collectionDate.lte = new Date(endDate);
    }

    // 1. Fetch filtered collection records with full relational data
    const collections = await prisma.collection.findMany({
      where,
      include: {
        movie: true,
        distributor: true,
        theater: true,
        screen: true,
        show: true,
      },
      orderBy: { collectionDate: "desc" },
    });

    // 2. Fetch all operational screens for the company to detect missing reports
    const allScreens = await prisma.screen.findMany({
      where: {
        theater: {
          companyId: context.companyId,
          ...(effectiveState ? { state: effectiveState } : {}),
          ...(city ? { city } : {}),
          ...(theaterId ? { id: theaterId } : {}),
        },
      },
      include: {
        theater: true,
        shows: {
          include: { movie: true },
          take: 1,
        },
      },
    });

    const reportedScreenIds = new Set(collections.map((c) => c.screenId).filter(Boolean));
    const missingReports: any[] = [];

    allScreens.forEach((scr) => {
      if (!reportedScreenIds.has(scr.id)) {
        missingReports.push({
          screenId: scr.id,
          screenNumber: scr.screenNumber,
          screenName: scr.name,
          theaterName: scr.theater.name,
          city: scr.theater.city,
          state: scr.theater.state,
          seatingCapacity: scr.seatingCapacity,
          format: scr.screenFormat,
          status: "COLLECTION_REPORT_MISSING",
          alertMessage: `No collection logged for ${scr.theater.name} - ${scr.name} (${scr.theater.city})`,
        });
      }
    });

    // 3. Build detailed records with performance indicators (high yield vs low occupancy)
    const records = collections.map((c) => {
      const isHighYield = c.occupancyRate >= 80;
      const isLowOccupancy = c.occupancyRate < 45;

      return {
        id: c.id,
        distributorId: c.distributorId,
        distributorName: c.distributor?.name || "Independent Distributor",
        distributorCode: c.distributor?.code || "DIST",
        movieId: c.movieId,
        movieTitle: c.movie?.title || "Untitled",
        movieLanguage: c.movie?.language || "Hindi",
        moviePoster: c.movie?.posterUrl,
        state: c.state || c.theater?.state || "Maharashtra",
        city: c.city || c.theater?.city || "Mumbai",
        theaterId: c.theaterId,
        theaterName: c.theater?.name || "Theatre Venue",
        theaterCircuit: c.theater?.circuit || "Single Screen",
        screenId: c.screenId,
        screenName: c.screen?.name || `Screen ${c.screen?.screenNumber || 1}`,
        screenNumber: c.screen?.screenNumber || 1,
        screenFormat: c.screen?.screenFormat || "2D",
        soundSystem: c.screen?.soundSystem || "Dolby 7.1",
        seatingCapacity: c.screen?.seatingCapacity || 250,
        showId: c.showId,
        showTime: c.show?.startTime || "18:00",
        collectionDate: c.collectionDate,
        week: c.week,
        dayOfWeek: c.dayOfWeek,
        showsCount: c.shows,
        admissions: c.admissions,
        occupancyRate: c.occupancyRate,
        grossAmount: c.grossAmount,
        gstRate: c.gstRate,
        gstAmount: c.gstAmount,
        deductions: c.deductions,
        netAmount: c.netAmount,
        distributorSharePct: c.distributorSharePct,
        distributorAmt: c.distributorAmt,
        exhibitorAmt: c.exhibitorAmt,
        isHighYield,
        isLowOccupancy,
        status: c.status,
        notes: c.notes,
      };
    });

    // 4. Aggregations across dimensions for cross-comparison:
    // By Movie
    const byMovieMap: Record<string, any> = {};
    // By Theatre
    const byTheaterMap: Record<string, any> = {};
    // By City
    const byCityMap: Record<string, any> = {};
    // By State
    const byStateMap: Record<string, any> = {};

    records.forEach((r) => {
      // Movie
      if (!byMovieMap[r.movieTitle]) {
        byMovieMap[r.movieTitle] = {
          title: r.movieTitle,
          gross: 0,
          net: 0,
          distShare: 0,
          exhShare: 0,
          admissions: 0,
          shows: 0,
          screens: new Set(),
        };
      }
      byMovieMap[r.movieTitle].gross += r.grossAmount;
      byMovieMap[r.movieTitle].net += r.netAmount;
      byMovieMap[r.movieTitle].distShare += r.distributorAmt;
      byMovieMap[r.movieTitle].exhShare += r.exhibitorAmt;
      byMovieMap[r.movieTitle].admissions += r.admissions;
      byMovieMap[r.movieTitle].shows += r.showsCount;
      if (r.screenId) byMovieMap[r.movieTitle].screens.add(r.screenId);

      // Theatre
      if (!byTheaterMap[r.theaterName]) {
        byTheaterMap[r.theaterName] = {
          name: r.theaterName,
          circuit: r.theaterCircuit,
          city: r.city,
          state: r.state,
          gross: 0,
          distShare: 0,
          admissions: 0,
          screens: new Set(),
        };
      }
      byTheaterMap[r.theaterName].gross += r.grossAmount;
      byTheaterMap[r.theaterName].distShare += r.distributorAmt;
      byTheaterMap[r.theaterName].admissions += r.admissions;
      if (r.screenId) byTheaterMap[r.theaterName].screens.add(r.screenId);

      // City
      if (!byCityMap[r.city]) {
        byCityMap[r.city] = { city: r.city, state: r.state, gross: 0, distShare: 0, admissions: 0 };
      }
      byCityMap[r.city].gross += r.grossAmount;
      byCityMap[r.city].distShare += r.distributorAmt;
      byCityMap[r.city].admissions += r.admissions;

      // State
      if (!byStateMap[r.state]) {
        byStateMap[r.state] = { state: r.state, gross: 0, distShare: 0, admissions: 0 };
      }
      byStateMap[r.state].gross += r.grossAmount;
      byStateMap[r.state].distShare += r.distributorAmt;
      byStateMap[r.state].admissions += r.admissions;
    });

    const movieComparison = Object.values(byMovieMap).map((m: any) => ({
      ...m,
      gross: round2(m.gross),
      net: round2(m.net),
      distShare: round2(m.distShare),
      exhShare: round2(m.exhShare),
      screenCount: m.screens.size,
    }));

    const theaterComparison = Object.values(byTheaterMap).map((t: any) => ({
      ...t,
      gross: round2(t.gross),
      distShare: round2(t.distShare),
      screenCount: t.screens.size,
    }));

    const cityComparison = Object.values(byCityMap).map((c: any) => ({
      ...c,
      gross: round2(c.gross),
      distShare: round2(c.distShare),
    }));

    const stateComparison = Object.values(byStateMap).map((s: any) => ({
      ...s,
      gross: round2(s.gross),
      distShare: round2(s.distShare),
    }));

    // Overall Totals
    const summary = {
      totalCollectionsLogged: records.length,
      totalGross: round2(records.reduce((acc, r) => acc + r.grossAmount, 0)),
      totalNet: round2(records.reduce((acc, r) => acc + r.netAmount, 0)),
      totalDistributorShare: round2(records.reduce((acc, r) => acc + r.distributorAmt, 0)),
      totalExhibitorShare: round2(records.reduce((acc, r) => acc + r.exhibitorAmt, 0)),
      totalAdmissions: records.reduce((acc, r) => acc + r.admissions, 0),
      totalShows: records.reduce((acc, r) => acc + r.showsCount, 0),
      highYieldScreensCount: records.filter((r) => r.isHighYield).length,
      lowOccupancyScreensCount: records.filter((r) => r.isLowOccupancy).length,
      missingReportsCount: missingReports.length,
    };

    return NextResponse.json({
      success: true,
      data: {
        records,
        missingReports,
        comparisons: {
          movies: movieComparison,
          theaters: theaterComparison,
          cities: cityComparison,
          states: stateComparison,
        },
        summary,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
