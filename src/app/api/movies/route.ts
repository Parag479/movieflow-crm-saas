import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "ALL";

    const movies = await prisma.movie.findMany({
      where: {
        ...(search
          ? {
              OR: [
                { title: { contains: search } },
                { genre: { contains: search } },
                { language: { contains: search } },
              ],
            }
          : {}),
        ...(status !== "ALL" ? { status } : {}),
      },
      include: {
        deals: true,
      },
      orderBy: { releaseDate: "asc" },
    });

    return NextResponse.json({ success: true, data: movies });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      posterUrl,
      trailerUrl,
      language,
      genre,
      durationMinutes,
      rating,
      castMembers,
      crewMembers,
      producer,
      distributorName,
      territoryRights,
      releaseDate,
      status,
    } = body;

    const company = await prisma.company.findFirst();
    if (!company) return NextResponse.json({ success: false, message: "Company not found" }, { status: 404 });

    const movie = await prisma.movie.create({
      data: {
        companyId: company.id,
        title,
        posterUrl: posterUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80",
        trailerUrl,
        language: language || "Hindi",
        genre: genre || "Action",
        durationMinutes: Number(durationMinutes) || 120,
        rating: rating || "U/A",
        castMembers,
        crewMembers,
        producer,
        distributorName,
        territoryRights: territoryRights || "Pan India",
        releaseDate: new Date(releaseDate || Date.now()),
        status: status || "UPCOMING",
      },
    });

    return NextResponse.json({ success: true, data: movie, message: "Movie added to catalog" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
