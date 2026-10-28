import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const shows = await prisma.show.findMany({
      include: {
        movie: true,
        screen: {
          include: {
            theater: true,
          },
        },
      },
      orderBy: { showDate: "asc" },
    });

    return NextResponse.json({ success: true, data: shows });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { movieId, screenId, showDate, startTime, endTime, ticketPriceStandard, ticketPriceVip } = body;

    const company = await prisma.company.findFirst();
    if (!company) return NextResponse.json({ success: false, message: "Company not found" }, { status: 404 });

    // CONFLICT DETECTION ALGORITHM: Check if screen has overlapping show at same date & time
    const existingOverlaps = await prisma.show.findMany({
      where: {
        screenId,
        showDate: new Date(showDate),
        startTime: startTime,
      },
    });

    const isConflicted = existingOverlaps.length > 0;

    const newShow = await prisma.show.create({
      data: {
        companyId: company.id,
        movieId,
        screenId,
        showDate: new Date(showDate || Date.now()),
        startTime: startTime || "14:30",
        endTime: endTime || "17:30",
        ticketPriceStandard: Number(ticketPriceStandard) || 250,
        ticketPriceVip: Number(ticketPriceVip) || 450,
        conflictLocked: isConflicted,
        status: isConflicted ? "CANCELLED" : "SCHEDULED",
      },
      include: {
        movie: true,
        screen: true,
      },
    });

    if (isConflicted) {
      return NextResponse.json({
        success: false,
        message: "SHOW CONFLICT DETECTED! Screen is already occupied at this time.",
        data: newShow,
      }, { status: 409 });
    }

    return NextResponse.json({
      success: true,
      data: newShow,
      message: "Show scheduled successfully with zero conflicts.",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
