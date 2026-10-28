import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // Return first company or default tenant for demo
    const company = await prisma.company.findFirst({
      include: {
        subscriptions: true,
      },
    });

    if (!company) {
      return NextResponse.json({ success: false, message: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: company });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, brandColor, phone, address, gstNumber } = body;

    const updated = await prisma.company.update({
      where: { id },
      data: { name, brandColor, phone, address, gstNumber },
    });

    return NextResponse.json({ success: true, data: updated, message: "Company profile updated" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
