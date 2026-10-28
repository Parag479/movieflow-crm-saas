import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const distribution = await prisma.distribution.findUnique({
      where: { id: params.id },
      include: {
        movie: true,
        distributor: true,
        territory: true,
        cityReleases: {
          include: {
            theater: {
              include: {
                screens: true,
              },
            },
          },
        },
        collections: {
          orderBy: { collectionDate: "desc" },
          take: 30,
        },
      },
    });

    if (!distribution) {
      return NextResponse.json({ success: false, message: "Distribution not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: distribution });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const updated = await prisma.distribution.update({
      where: { id: params.id },
      data: {
        totalScreens: body.totalScreens !== undefined ? Number(body.totalScreens) : undefined,
        totalTheatres: body.totalTheatres !== undefined ? Number(body.totalTheatres) : undefined,
        distributionCost: body.distributionCost !== undefined ? Number(body.distributionCost) : undefined,
        printsCost: body.printsCost !== undefined ? Number(body.printsCost) : undefined,
        pubCost: body.pubCost !== undefined ? Number(body.pubCost) : undefined,
        distributorSharePct: body.distributorSharePct !== undefined ? Number(body.distributorSharePct) : undefined,
        exhibitorSharePct: body.exhibitorSharePct !== undefined ? Number(body.exhibitorSharePct) : undefined,
        occupancyRate: body.occupancyRate !== undefined ? Number(body.occupancyRate) : undefined,
        status: body.status || undefined,
      },
    });

    return NextResponse.json({ success: true, data: updated, message: "Distribution updated successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
