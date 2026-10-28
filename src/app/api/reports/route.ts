import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const movies = await prisma.movie.findMany({ include: { deals: true } });
    const theaters = await prisma.theater.findMany({ include: { screens: true } });

    const totalRevenue = 14200000;
    const distributorPayouts = 7810000;
    const theaterEarnings = 6390000;
    const totalGstTaxes = 2556000;

    const moviePerformance = movies.map((m) => ({
      title: m.title,
      genre: m.genre,
      grossRevenue: Math.floor(Math.random() * 5000000) + 1500000,
      showsCount: Math.floor(Math.random() * 50) + 20,
      occupancyRate: Math.floor(Math.random() * 25) + 70,
    }));

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          distributorPayouts,
          theaterEarnings,
          totalGstTaxes,
        },
        moviePerformance,
        theaterYield: theaters.map((t) => ({
          name: t.name,
          city: t.city,
          screens: t.totalScreens,
          avgOccupancy: 86,
          revenueGenerated: 4200000,
        })),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
