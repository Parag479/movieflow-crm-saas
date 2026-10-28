import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const leads = await prisma.lead.findMany({
      include: {
        assignedTo: true,
        tasks: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ success: true, data: leads });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, contactName, companyName, email, phone, stage, dealValue, probability } = body;

    const company = await prisma.company.findFirst();
    if (!company) return NextResponse.json({ success: false, message: "Company not found" }, { status: 404 });

    const lead = await prisma.lead.create({
      data: {
        companyId: company.id,
        title,
        contactName,
        companyName,
        email,
        phone,
        stage: stage || "NEW_LEAD",
        dealValue: Number(dealValue) || 1000000,
        probability: Number(probability) || 50,
      },
    });

    return NextResponse.json({ success: true, data: lead, message: "CRM Lead created" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, stage, dealValue, probability } = body;

    const updated = await prisma.lead.update({
      where: { id },
      data: { stage, dealValue: Number(dealValue), probability: Number(probability) },
    });

    return NextResponse.json({ success: true, data: updated, message: "Lead stage updated" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
