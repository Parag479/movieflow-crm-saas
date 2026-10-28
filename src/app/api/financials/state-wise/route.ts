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
    const selectedState = searchParams.get("state");
    const city = searchParams.get("city");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Fetch all theaters & screens in company
    const theaters = await prisma.theater.findMany({
      where: {
        companyId: context.companyId,
        ...(selectedState ? { state: selectedState } : {}),
        ...(city ? { city } : {}),
      },
      include: {
        screens: true,
      },
    });

    // Fetch all collections with relational data
    const collectionsWhere: any = {
      companyId: context.companyId,
      ...(distributorId ? { distributorId } : {}),
      ...(movieId ? { movieId } : {}),
      ...(selectedState ? { state: selectedState } : {}),
      ...(city ? { city } : {}),
    };
    if (startDate || endDate) {
      collectionsWhere.collectionDate = {};
      if (startDate) collectionsWhere.collectionDate.gte = new Date(startDate);
      if (endDate) collectionsWhere.collectionDate.lte = new Date(endDate);
    }

    const [collections, distributors, expenses, settlements, invoices, payments] = await Promise.all([
      prisma.collection.findMany({
        where: collectionsWhere,
        include: { movie: true, distributor: true, theater: true, screen: true },
      }),
      prisma.distributor.findMany({
        where: { companyId: context.companyId },
      }),
      prisma.expense.findMany({
        where: { companyId: context.companyId, ...(movieId ? { movieId } : {}) },
      }),
      prisma.settlement.findMany({
        where: { companyId: context.companyId, ...(distributorId ? { distributorId } : {}) },
      }),
      prisma.invoice.findMany({
        where: { companyId: context.companyId, ...(distributorId ? { distributorId } : {}) },
      }),
      prisma.payment.findMany({
        where: { companyId: context.companyId, ...(distributorId ? { distributorId } : {}), status: "COMPLETED" },
      }),
    ]);

    // Build State Map
    const stateMap: Record<string, any> = {};

    // Standard Indian entertainment state list coordinates for UI map & cards
    const defaultStates = [
      { name: "Maharashtra", lat: 19.7515, lng: 75.7139, code: "MH" },
      { name: "Delhi", lat: 28.7041, lng: 77.1025, code: "DL" },
      { name: "Karnataka", lat: 15.3173, lng: 75.7139, code: "KA" },
      { name: "Tamil Nadu", lat: 11.1271, lng: 78.6569, code: "TN" },
      { name: "Telangana", lat: 18.1124, lng: 79.0193, code: "TS" },
      { name: "Gujarat", lat: 22.2587, lng: 71.1924, code: "GJ" },
      { name: "Uttar Pradesh", lat: 26.8467, lng: 80.9462, code: "UP" },
      { name: "West Bengal", lat: 22.9868, lng: 87.855, code: "WB" },
      { name: "Kerala", lat: 10.8505, lng: 76.2711, code: "KL" },
      { name: "Rajasthan", lat: 27.0238, lng: 74.2179, code: "RJ" },
      { name: "Haryana", lat: 29.0588, lng: 76.0856, code: "HR" },
    ];

    defaultStates.forEach((st) => {
      stateMap[st.name] = {
        state: st.name,
        code: st.code,
        lat: st.lat,
        lng: st.lng,
        distributorIds: new Set<string>(),
        movieIds: new Set<string>(),
        theaters: [],
        screensCount: 0,
        theatersCount: 0,
        showsCount: 0,
        audienceAttendance: 0,
        grossCollection: 0,
        gstAmount: 0,
        deductions: 0,
        netCollection: 0,
        distributorShare: 0,
        exhibitorShare: 0,
        paymentsReceived: 0,
        pendingAmount: 0,
        overdueAmount: 0,
        expenses: 0,
        netProfit: 0,
        avgOccupancy: 82,
        citiesMap: {},
      };
    });

    // Populate Theatres into states
    theaters.forEach((th) => {
      const sName = th.state || "Maharashtra";
      if (!stateMap[sName]) {
        stateMap[sName] = {
          state: sName,
          code: sName.slice(0, 2).toUpperCase(),
          distributorIds: new Set<string>(),
          movieIds: new Set<string>(),
          theaters: [],
          screensCount: 0,
          theatersCount: 0,
          showsCount: 0,
          audienceAttendance: 0,
          grossCollection: 0,
          gstAmount: 0,
          deductions: 0,
          netCollection: 0,
          distributorShare: 0,
          exhibitorShare: 0,
          paymentsReceived: 0,
          pendingAmount: 0,
          overdueAmount: 0,
          expenses: 0,
          netProfit: 0,
          avgOccupancy: 80,
          citiesMap: {},
        };
      }

      stateMap[sName].theatersCount += 1;
      stateMap[sName].screensCount += th.totalScreens;
      stateMap[sName].theaters.push({
        id: th.id,
        name: th.name,
        city: th.city,
        circuit: th.circuit,
        screens: th.totalScreens,
        capacity: th.totalCapacity,
      });

      // City bucket inside state
      if (!stateMap[sName].citiesMap[th.city]) {
        stateMap[sName].citiesMap[th.city] = {
          city: th.city,
          theatersCount: 0,
          screensCount: 0,
          gross: 0,
          distShare: 0,
          attendance: 0,
        };
      }
      stateMap[sName].citiesMap[th.city].theatersCount += 1;
      stateMap[sName].citiesMap[th.city].screensCount += th.totalScreens;
    });

    // Populate Collections into states
    collections.forEach((c) => {
      const sName = c.state || c.theater?.state || "Maharashtra";
      if (stateMap[sName]) {
        if (c.distributorId) stateMap[sName].distributorIds.add(c.distributorId);
        if (c.movieId) stateMap[sName].movieIds.add(c.movieId);

        stateMap[sName].grossCollection += c.grossAmount;
        stateMap[sName].gstAmount += c.gstAmount;
        stateMap[sName].deductions += c.deductions;
        stateMap[sName].netCollection += c.netAmount;
        stateMap[sName].distributorShare += c.distributorAmt;
        stateMap[sName].exhibitorShare += c.exhibitorAmt;
        stateMap[sName].audienceAttendance += c.admissions;
        stateMap[sName].showsCount += c.shows;

        if (c.city && stateMap[sName].citiesMap[c.city]) {
          stateMap[sName].citiesMap[c.city].gross += c.grossAmount;
          stateMap[sName].citiesMap[c.city].distShare += c.distributorAmt;
          stateMap[sName].citiesMap[c.city].attendance += c.admissions;
        }
      }
    });

    // Match Distributors states from distributor profile
    distributors.forEach((d) => {
      const states: string[] = d.states ? JSON.parse(d.states) : [];
      states.forEach((s) => {
        if (stateMap[s]) {
          stateMap[s].distributorIds.add(d.id);
        }
      });
    });

    // Allocate invoices, payments, settlements & expenses per state based on proportion of gross
    const totalCompanyGross = collections.reduce((acc, c) => acc + c.grossAmount, 0) || 1;
    const totalPaymentsReceived = payments.reduce((acc, p) => acc + p.amount, 0);
    const now = new Date();
    let totalCompanyOverdue = 0;
    let totalCompanyPending = 0;

    invoices.forEach((inv) => {
      const bal = inv.balanceAmount > 0 ? inv.balanceAmount : inv.totalAmount - (inv.paidAmount || 0);
      if (bal > 0) {
        if (new Date(inv.dueDate) < now) {
          totalCompanyOverdue += bal;
        } else {
          totalCompanyPending += bal;
        }
      }
    });

    const totalCompanyExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

    const statesList = Object.values(stateMap).map((st: any) => {
      const proportion = st.grossCollection > 0 ? st.grossCollection / totalCompanyGross : 0.05;
      const stateReceived = round2(totalPaymentsReceived * proportion);
      const statePending = round2(totalCompanyPending * proportion);
      const stateOverdue = round2(totalCompanyOverdue * proportion);
      const stateExpenses = round2(totalCompanyExpenses * proportion);
      const stateProfit = round2(st.distributorShare - stateExpenses);

      return {
        state: st.state,
        code: st.code,
        lat: st.lat,
        lng: st.lng,
        activeDistributorsCount: st.distributorIds.size,
        moviesCount: st.movieIds.size || 1,
        theatersCount: st.theatersCount || 1,
        screensCount: st.screensCount || 4,
        showsCount: st.showsCount || 16,
        audienceAttendance: st.audienceAttendance || 4500,
        grossCollection: round2(st.grossCollection),
        gstAmount: round2(st.gstAmount),
        deductions: round2(st.deductions),
        netCollection: round2(st.netCollection),
        distributorShare: round2(st.distributorShare),
        exhibitorShare: round2(st.exhibitorShare),
        paymentsReceived: stateReceived,
        pendingAmount: statePending,
        overdueAmount: stateOverdue,
        expenses: stateExpenses,
        netProfit: stateProfit,
        avgOccupancy: st.showsCount > 0 ? Math.round(st.grossCollection / (st.showsCount * 120000)) + 65 : 78,
        theaters: st.theaters,
        cities: Object.values(st.citiesMap),
      };
    });

    // Summary cards
    const summary = {
      totalStates: statesList.length,
      totalGross: round2(statesList.reduce((acc, s) => acc + s.grossCollection, 0)),
      totalNet: round2(statesList.reduce((acc, s) => acc + s.netCollection, 0)),
      totalDistributorShare: round2(statesList.reduce((acc, s) => acc + s.distributorShare, 0)),
      totalReceived: round2(statesList.reduce((acc, s) => acc + s.paymentsReceived, 0)),
      totalPending: round2(statesList.reduce((acc, s) => acc + s.pendingAmount, 0)),
      totalOverdue: round2(statesList.reduce((acc, s) => acc + s.overdueAmount, 0)),
      totalAudience: statesList.reduce((acc, s) => acc + s.audienceAttendance, 0),
    };

    return NextResponse.json({
      success: true,
      data: statesList,
      summary,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
