import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("movieflow_token")?.value;

    if (token) {
      const payload = verifyAccessToken(token);
      if (payload?.userId && payload?.companyId) {
        await prisma.auditLog.create({
          data: {
            companyId: payload.companyId,
            userId: payload.userId,
            action: "LOGOUT",
            entityName: "User",
            entityId: payload.userId,
            details: JSON.stringify({ timestamp: new Date() }),
          },
        }).catch(() => {});
      }
    }

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    response.cookies.set("movieflow_token", "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
