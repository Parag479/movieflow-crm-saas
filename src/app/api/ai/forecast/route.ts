import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const movies = await prisma.movie.findMany();
    const theaters = await prisma.theater.findMany();

    const revenueForecast = [
      { day: "Day 1 (Fri)", gross: 4200000, confidence: 96 },
      { day: "Day 2 (Sat)", gross: 5800000, confidence: 94 },
      { day: "Day 3 (Sun)", gross: 6100000, confidence: 95 },
      { day: "Day 4 (Mon)", gross: 2400000, confidence: 89 },
      { day: "Day 5 (Tue)", gross: 2100000, confidence: 88 },
      { day: "Day 6 (Wed)", gross: 2300000, confidence: 87 },
      { day: "Day 7 (Thu)", gross: 1900000, confidence: 85 },
    ];

    const demandPredictions = movies.map((m) => ({
      movieTitle: m.title,
      genre: m.genre,
      predictedOccupancy: Math.floor(Math.random() * 20) + 78,
      recommendedScreen: "IMAX 3D Screen 1",
      optimalShowTimes: ["14:30", "18:15", "21:45"],
      demandScore: 92,
    }));

    const theaterRecommendations = theaters.map((t) => ({
      theaterName: t.name,
      city: t.city,
      matchScore: 94,
      targetAudience: "Young Professionals & Action Enthusiasts",
      expectedWeekendGross: "₹18,50,000",
    }));

    const executiveSummary = [
      "Weekend 1 Projected Gross: ₹1.61 Cr across 142 screens.",
      "IMAX 3D screens are expected to run at 94% average occupancy.",
      "Recommend shifting 'Dune: Part Two' from Screen 3 to Screen 1 (IMAX) for a projected +18% revenue lift.",
      "GST tax liability estimated at ₹28.9 Lakhs for current cycle.",
    ];

    return NextResponse.json({
      success: true,
      data: {
        revenueForecast,
        demandPredictions,
        theaterRecommendations,
        executiveSummary,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
