import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
    });

    if (notifications.length === 0) {
      // Seed default sample notifications if empty
      const company = await prisma.company.findFirst();
      if (company) {
        await prisma.notification.createMany({
          data: [
            { companyId: company.id, title: "New Deal Executed", message: "Metro Cinema Screen 3 signed for 'Avatar: Fire & Ash'", type: "DEAL" },
            { companyId: company.id, title: "Payment Settlement Pending", message: "PVR Directors Cut payment settlement pending ₹4,50,000", type: "PAYMENT" },
            { companyId: company.id, title: "AI Demand Forecast Alert", message: "High demand predicted for Weekend 1 (94% Occupancy)", type: "AI" },
          ],
        });
      }
    }

    const updatedNotifications = await prisma.notification.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ success: true, data: updatedNotifications });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
