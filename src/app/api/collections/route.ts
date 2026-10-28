import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth, recordAuditLog } from "@/lib/auth";
import { calculateTaxAndShares, round2 } from "@/lib/ledger";

export async function GET(request: Request) {
  try {
    const authResult = await requireTenantAuth(request);
    if ("response" in authResult) return authResult.response;
    const { context } = authResult;

    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get("movieId");
    const distributorId = searchParams.get("distributorId");
    const territoryId = searchParams.get("territoryId");
    const theaterId = searchParams.get("theaterId");
    const screenId = searchParams.get("screenId");
    const state = searchParams.get("state");
    const week = searchParams.get("week");

    // RBAC: If caller is a DISTRIBUTOR role, only show their own collections
    const effectiveDistId =
      context.roles.includes("DISTRIBUTOR") && context.distributorId
        ? context.distributorId
        : distributorId;

    // RBAC: If caller is STATE_MANAGER, restrict to assignedState
    const effectiveState =
      context.roles.includes("STATE_MANAGER") && context.assignedState
        ? context.assignedState
        : state;

    const collections = await prisma.collection.findMany({
      where: {
        companyId: context.companyId,
        ...(movieId ? { movieId } : {}),
        ...(effectiveDistId ? { distributorId: effectiveDistId } : {}),
        ...(territoryId ? { territoryId } : {}),
        ...(theaterId ? { theaterId } : {}),
        ...(screenId ? { screenId } : {}),
        ...(effectiveState ? { state: effectiveState } : {}),
        ...(week ? { week: Number(week) } : {}),
      },
      include: {
        movie: true,
        distributor: true,
        territory: true,
        theater: true,
        screen: true,
        show: true,
      },
      orderBy: { collectionDate: "desc" },
    });

    return NextResponse.json({ success: true, data: collections });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await requireTenantAuth(request, [
      "SUPER_ADMIN",
      "COMPANY_ADMIN",
      "FINANCE_MANAGER",
      "STATE_MANAGER",
      "DATA_ENTRY",
    ]);
    if ("response" in authResult) return authResult.response;
    const { context } = authResult;

    const body = await request.json();
    const {
      movieId,
      distributorId,
      distributionId,
      territoryId,
      theaterId,
      screenId,
      showId,
      state,
      city,
      collectionDate,
      week = 1,
      dayOfWeek,
      grossAmount,
      gstRate = 18,
      deductions = 0,
      distributorSharePct = 50,
      admissions = 0,
      occupancyRate = 75,
      shows = 4,
      notes,
    } = body;

    if (!movieId) {
      return NextResponse.json({ success: false, message: "Movie selection is required." }, { status: 400 });
    }

    const cDate = new Date(collectionDate || Date.now());
    // Normalize to date (start of day)
    cDate.setHours(0, 0, 0, 0);

    // Duplicate check: prevent duplicate collection reports for same screen on same date
    if (screenId) {
      const existing = await prisma.collection.findFirst({
        where: {
          companyId: context.companyId,
          movieId,
          screenId,
          collectionDate: {
            gte: new Date(cDate.getTime()),
            lt: new Date(cDate.getTime() + 86400000),
          },
        },
      });

      if (existing) {
        return NextResponse.json(
          {
            success: false,
            message: `A collection report has already been logged for this screen on ${cDate.toISOString().split("T")[0]}. Duplicate entries are prevented.`,
          },
          { status: 409 }
        );
      }
    }

    // Determine state and city from theater if not supplied
    let resolvedState = state;
    let resolvedCity = city;
    if (theaterId && (!resolvedState || !resolvedCity)) {
      const theater = await prisma.theater.findUnique({ where: { id: theaterId } });
      if (theater) {
        resolvedState = resolvedState || theater.state;
        resolvedCity = resolvedCity || theater.city;
      }
    }

    // Determine distributor from distribution or movie if not supplied
    let resolvedDistributorId = distributorId;
    if (!resolvedDistributorId && distributionId) {
      const dist = await prisma.distribution.findUnique({ where: { id: distributionId } });
      resolvedDistributorId = dist?.distributorId;
    }
    if (!resolvedDistributorId) {
      const defaultDist = await prisma.distributor.findFirst({ where: { companyId: context.companyId } });
      resolvedDistributorId = defaultDist?.id;
    }

    // Perform contractual precision tax & share calculations
    const calc = calculateTaxAndShares(
      Number(grossAmount) || 0,
      Number(gstRate) || 18,
      Number(deductions) || 0,
      Number(distributorSharePct) || 50
    );

    const collection = await prisma.collection.create({
      data: {
        companyId: context.companyId,
        movieId,
        distributorId: resolvedDistributorId || null,
        distributionId: distributionId || null,
        territoryId: territoryId || null,
        theaterId: theaterId || null,
        screenId: screenId || null,
        showId: showId || null,
        state: resolvedState || "Maharashtra",
        city: resolvedCity || "Mumbai",
        collectionDate: cDate,
        week: Number(week) || 1,
        dayOfWeek: dayOfWeek || "Friday",
        grossAmount: calc.grossAmount,
        gstRate: calc.gstRate,
        gstAmount: calc.gstAmount,
        deductions: calc.deductions,
        netAmount: calc.netAmount,
        distributorSharePct: calc.distributorSharePct,
        exhibitorSharePct: calc.exhibitorSharePct,
        distributorAmt: calc.distributorAmt,
        exhibitorAmt: calc.exhibitorAmt,
        admissions: Number(admissions) || 0,
        occupancyRate: Number(occupancyRate) || 75,
        shows: Number(shows) || 4,
        notes: notes || null,
        status: "VERIFIED",
      },
    });

    // Update cumulative movie lifetime gross & weekly gross
    const allCollections = await prisma.collection.findMany({ where: { movieId, companyId: context.companyId } });
    const lifetimeGross = allCollections.reduce((acc, c) => acc + c.grossAmount, 0);
    const latestWeek = Number(week) || 1;
    const currentWeekCollections = allCollections.filter((c) => c.week === latestWeek);
    const weeklyGross = currentWeekCollections.reduce((acc, c) => acc + c.grossAmount, 0);

    await prisma.movie.update({
      where: { id: movieId },
      data: {
        lifetimeGross,
        weeklyGross,
      },
    });

    await recordAuditLog({
      companyId: context.companyId,
      userId: context.userId,
      action: "RECORD_BOX_OFFICE_COLLECTION",
      entityName: "Collection",
      entityId: collection.id,
      details: {
        movieId,
        gross: calc.grossAmount,
        net: calc.netAmount,
        distributorAmt: calc.distributorAmt,
        screenId,
        cDate,
      },
    });

    return NextResponse.json({
      success: true,
      data: collection,
      message: `Daily box office collection of ₹${calc.grossAmount.toLocaleString("en-IN")} recorded successfully with precision tax split.`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
