import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const users = await prisma.user.findMany({
      include: {
        company: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedUsers = users.map((u) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      status: u.status,
      lastLoginAt: u.lastLoginAt,
      roles: u.roles.map((r) => r.role.name),
      companyName: u.company.name,
      createdAt: u.createdAt,
    }));

    return NextResponse.json({ success: true, data: formattedUsers });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, phone, roleName } = body;

    const company = await prisma.company.findFirst();
    if (!company) return NextResponse.json({ success: false, message: "Company not found" }, { status: 404 });

    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) return NextResponse.json({ success: false, message: "Role not found" }, { status: 400 });

    const newUser = await prisma.user.create({
      data: {
        companyId: company.id,
        fullName,
        email: email.toLowerCase(),
        passwordHash: "$2a$10$defaulttempPassword123",
        phone,
        status: "ACTIVE",
        roles: {
          create: {
            roleId: role.id,
          },
        },
      },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        status: newUser.status,
        roles: [role.name],
      },
      message: "User created successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
