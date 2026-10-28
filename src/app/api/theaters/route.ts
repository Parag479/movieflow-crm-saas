import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { requireTenantAuth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const authResult = await requireTenantAuth(request);
    if ("response" in authResult) return authResult.response;
    const { context } = authResult;

    const isStateManager = context.roles.includes("STATE_MANAGER") && !!context.assignedState;

    const theaters = await prisma.theater.findMany({
      where: {
        companyId: context.companyId,
        ...(isStateManager ? { state: context.assignedState! } : {}),
      },
      include: {
        screens: true,
        deals: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: theaters });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, address, city, state, postalCode, totalScreens, totalCapacity, ownerName, ownerPhone, ownerEmail, facilities } = body;

    const company = await prisma.company.findFirst();
    if (!company) return NextResponse.json({ success: false, message: "Company not found" }, { status: 404 });

    const theater = await prisma.theater.create({
      data: {
        companyId: company.id,
        name,
        address,
        city,
        state: state || "Maharashtra",
        postalCode,
        totalScreens: Number(totalScreens) || 1,
        totalCapacity: Number(totalCapacity) || 300,
        ownerName,
        ownerPhone,
        ownerEmail,
        facilities: JSON.stringify(facilities || ["IMAX 3D", "Dolby Atmos", "Recliners"]),
        screens: {
          create: [
            { name: "Screen 1 (Main)", screenNumber: 1, seatingCapacity: Number(totalCapacity) || 300, screenFormat: "IMAX", soundSystem: "Dolby Atmos" },
          ],
        },
      },
      include: {
        screens: true,
      },
    });

    return NextResponse.json({ success: true, data: theater, message: "Theater venue added" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
