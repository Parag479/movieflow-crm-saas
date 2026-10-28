import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, newPassword, email } = body;

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    let targetEmail = email;

    if (token) {
      const payload = verifyAccessToken(token);
      if (payload?.email) {
        targetEmail = payload.email;
      }
    }

    if (!targetEmail) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing reset token / email" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: targetEmail.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User account not found" },
        { status: 404 }
      );
    }

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPassword },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        companyId: user.companyId,
        userId: user.id,
        action: "PASSWORD_RESET_COMPLETED",
        entityName: "User",
        entityId: user.id,
        details: JSON.stringify({ email: user.email, completedAt: new Date() }),
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Password reset completed successfully. You can now sign in.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to reset password" },
      { status: 500 }
    );
  }
}
