import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get("movieId");
    const territoryId = searchParams.get("territoryId");

    const distributions = await prisma.distribution.findMany({
      where: {
        ...(movieId ? { movieId } : {}),
        ...(territoryId ? { territoryId } : {}),
      },
      include: {
        movie: true,
        territory: true,
        distributor: true,
      },
    });

    const totalGross = distributions.reduce((acc, d) => acc + d.grossCollection, 0);
    const totalNet = distributions.reduce((acc, d) => acc + d.netCollection, 0);
    const totalDistributorShare = distributions.reduce((acc, d) => acc + d.distributorShare, 0);
    const totalExhibitorShare = distributions.reduce((acc, d) => acc + d.exhibitorShare, 0);
    const totalDistCost = distributions.reduce((acc, d) => acc + d.distributionCost, 0);
    const totalProfit = totalDistributorShare - totalDistCost;
    const avgOccupancy = distributions.length
      ? Math.round(distributions.reduce((acc, d) => acc + d.occupancyRate, 0) / distributions.length)
      : 0;

    // Group by territory
    const territorySummaryMap: Record<string, any> = {};
    for (const d of distributions) {
      const tName = d.territory.name;
      if (!territorySummaryMap[tName]) {
        territorySummaryMap[tName] = {
          territory: tName,
          region: d.territory.region,
          screens: 0,
          theatres: 0,
          distributionCost: 0,
          grossCollection: 0,
          netCollection: 0,
          distributorShare: 0,
          exhibitorShare: 0,
          occupancy: 0,
          count: 0,
        };
      }
      territorySummaryMap[tName].screens += d.totalScreens;
      territorySummaryMap[tName].theatres += d.totalTheatres;
      territorySummaryMap[tName].distributionCost += d.distributionCost;
      territorySummaryMap[tName].grossCollection += d.grossCollection;
      territorySummaryMap[tName].netCollection += d.netCollection;
      territorySummaryMap[tName].distributorShare += d.distributorShare;
      territorySummaryMap[tName].exhibitorShare += d.exhibitorShare;
      territorySummaryMap[tName].occupancy += d.occupancyRate;
      territorySummaryMap[tName].count += 1;
    }

    const territoryBreakdown = Object.values(territorySummaryMap).map((t: any) => ({
      ...t,
      avgOccupancy: Math.round(t.occupancy / (t.count || 1)),
      netProfit: t.distributorShare - t.distributionCost,
    }));

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalGross,
          totalNet,
          totalDistributorShare,
          totalExhibitorShare,
          totalDistCost,
          totalProfit,
          avgOccupancy,
        },
        territoryBreakdown,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
