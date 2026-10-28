import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get("movieId");

    const territories = await prisma.territory.findMany({
      include: {
        cityReleases: {
          where: movieId ? { distribution: { movieId } } : {},
          include: {
            theater: {
              include: {
                screens: true,
              },
            },
            distribution: {
              include: {
                movie: true,
              },
            },
          },
        },
      },
    });

    const allTheaters = await prisma.theater.findMany({
      include: {
        screens: true,
      },
    });

    // Group theatres by city
    const cityMap: Record<string, any> = {};

    for (const theater of allTheaters) {
      const city = theater.city;
      if (!cityMap[city]) {
        cityMap[city] = {
          city,
          state: theater.state,
          theatersCount: 0,
          screensCount: 0,
          capacity: 0,
          distributionCost: 0,
          grossCollection: 0,
          netCollection: 0,
          distributorShare: 0,
          exhibitorShare: 0,
          netProfit: 0,
          avgOccupancy: 82,
          theatres: [],
          lat: theater.latitude || 19.076,
          lng: theater.longitude || 72.877,
        };
      }

      cityMap[city].theatersCount += 1;
      cityMap[city].screensCount += theater.totalScreens;
      cityMap[city].capacity += theater.totalCapacity;

      cityMap[city].theatres.push({
        id: theater.id,
        name: theater.name,
        circuit: theater.circuit || "Independent",
        screens: theater.totalScreens,
        capacity: theater.totalCapacity,
        ownerName: theater.ownerName,
        ownerPhone: theater.ownerPhone,
      });
    }

    // Accumulate collections & costs per city
    const distributions = await prisma.distribution.findMany({
      where: movieId ? { movieId } : {},
      include: {
        territory: true,
        movie: true,
        cityReleases: {
          include: {
            theater: true,
          },
        },
      },
    });

    for (const dist of distributions) {
      const citiesInTerritory = JSON.parse(dist.territory.cities || "[]");
      const cityCount = citiesInTerritory.length || 1;

      for (const city of citiesInTerritory) {
        if (!cityMap[city]) {
          cityMap[city] = {
            city,
            state: dist.territory.name,
            theatersCount: Math.round(dist.totalTheatres / cityCount) || 5,
            screensCount: Math.round(dist.totalScreens / cityCount) || 18,
            capacity: Math.round((dist.totalScreens / cityCount) * 200),
            distributionCost: 0,
            grossCollection: 0,
            netCollection: 0,
            distributorShare: 0,
            exhibitorShare: 0,
            netProfit: 0,
            avgOccupancy: dist.occupancyRate || 80,
            theatres: [],
            lat: dist.territory.latitude || 20.0,
            lng: dist.territory.longitude || 78.0,
          };
        }

        const cityDistCost = dist.distributionCost / cityCount;
        const cityGross = dist.grossCollection / cityCount;
        const cityNet = dist.netCollection / cityCount;
        const cityDistShare = dist.distributorShare / cityCount;
        const cityExhShare = dist.exhibitorShare / cityCount;

        cityMap[city].distributionCost += cityDistCost;
        cityMap[city].grossCollection += cityGross;
        cityMap[city].netCollection += cityNet;
        cityMap[city].distributorShare += cityDistShare;
        cityMap[city].exhibitorShare += cityExhShare;
        cityMap[city].netProfit = cityMap[city].distributorShare - cityMap[city].distributionCost;
        cityMap[city].avgOccupancy = dist.occupancyRate || cityMap[city].avgOccupancy;
      }
    }

    const cityDataList = Object.values(cityMap);

    return NextResponse.json({
      success: true,
      data: {
        cities: cityDataList,
        territories: territories.map((t) => ({
          id: t.id,
          name: t.name,
          code: t.code,
          region: t.region,
          svgX: t.svgX,
          svgY: t.svgY,
          latitude: t.latitude,
          longitude: t.longitude,
        })),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
