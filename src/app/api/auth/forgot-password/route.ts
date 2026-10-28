import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { company: true },
    });

    if (user) {
      await prisma.auditLog.create({
        data: {
          companyId: user.companyId,
          userId: user.id,
          action: "PASSWORD_RESET_REQUEST",
          entityName: "User",
          entityId: user.id,
          details: JSON.stringify({ email: user.email, requestedAt: new Date() }),
        },
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: "If account exists, password reset instructions have been sent to your email.",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
