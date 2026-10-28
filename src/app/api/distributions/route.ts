import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get("movieId");
    const territoryId = searchParams.get("territoryId");
    const status = searchParams.get("status") || "ALL";

    const distributions = await prisma.distribution.findMany({
      where: {
        ...(movieId ? { movieId } : {}),
        ...(territoryId ? { territoryId } : {}),
        ...(status !== "ALL" ? { status } : {}),
      },
      include: {
        movie: true,
        distributor: true,
        territory: true,
        cityReleases: {
          include: {
            theater: true,
          },
        },
        _count: {
          select: {
            collections: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: distributions });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      movieId,
      distributorId,
      territoryId,
      releaseDate,
      totalScreens,
      totalTheatres,
      distributionCost,
      printsCost,
      pubCost,
      distributorSharePct,
      exhibitorSharePct,
    } = body;

    const company = await prisma.company.findFirst();
    if (!company) return NextResponse.json({ success: false, message: "Company not found" }, { status: 404 });

    const distCost = Number(distributionCost) || (Number(printsCost) || 0) + (Number(pubCost) || 0);

    const distribution = await prisma.distribution.create({
      data: {
        companyId: company.id,
        movieId,
        distributorId: distributorId || null,
        territoryId,
        releaseDate: new Date(releaseDate || Date.now()),
        totalScreens: Number(totalScreens) || 0,
        totalTheatres: Number(totalTheatres) || 0,
        distributionCost: distCost,
        printsCost: Number(printsCost) || 0,
        pubCost: Number(pubCost) || 0,
        distributorSharePct: Number(distributorSharePct) || 50,
        exhibitorSharePct: Number(exhibitorSharePct) || 50,
        status: "ACTIVE",
      },
      include: {
        movie: true,
        territory: true,
      },
    });

    // Update aggregate movie screen & theater counters
    const allMovieDists = await prisma.distribution.findMany({ where: { movieId } });
    const aggScreens = allMovieDists.reduce((acc, d) => acc + d.totalScreens, 0);
    const aggTheatres = allMovieDists.reduce((acc, d) => acc + d.totalTheatres, 0);
    const aggDistCost = allMovieDists.reduce((acc, d) => acc + d.distributionCost, 0);

    await prisma.movie.update({
      where: { id: movieId },
      data: {
        totalScreens: aggScreens,
        totalTheatres: aggTheatres,
        totalDistCost: aggDistCost,
      },
    });

    return NextResponse.json({ success: true, data: distribution, message: "Movie distribution registered successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
