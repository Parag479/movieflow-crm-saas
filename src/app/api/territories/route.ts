import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const territories = await prisma.territory.findMany({
      include: {
        _count: {
          select: {
            distributions: true,
            cityReleases: true,
            collections: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: territories });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, code, region, cities, svgX, svgY, latitude, longitude } = body;

    const territory = await prisma.territory.create({
      data: {
        name,
        code,
        region: region || "West",
        cities: typeof cities === "string" ? cities : JSON.stringify(cities || []),
        svgX: Number(svgX) || 0,
        svgY: Number(svgY) || 0,
        latitude: Number(latitude) || 0,
        longitude: Number(longitude) || 0,
      },
    });

    return NextResponse.json({ success: true, data: territory, message: "Territory created successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
