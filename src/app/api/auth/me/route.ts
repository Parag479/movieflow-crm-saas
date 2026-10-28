import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    let token = cookieStore.get("movieflow_token")?.value;

    if (!token) {
      const authHeader = request.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
    }

    const payload = verifyAccessToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        company: true,
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const roles = user.roles.map((ur) => ur.role.name);
    const permissions = Array.from(
      new Set(
        user.roles.flatMap((ur) =>
          ur.role.permissions.map((p) => `${p.permission.module}:${p.permission.action}`)
        )
      )
    );

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          designation: user.designation,
          territory: user.territory,
          status: user.status,
          roles,
          permissions,
          company: {
            id: user.company.id,
            name: user.company.name,
            code: user.company.code,
            logoUrl: user.company.logoUrl,
            brandColor: user.company.brandColor,
          },
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
