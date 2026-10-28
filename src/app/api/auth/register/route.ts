import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signAccessToken } from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyName, companyCode, email, password, fullName, phone } = body;

    if (!companyName || !companyCode || !email || !password || !fullName) {
      return NextResponse.json(
        { success: false, message: "All required fields must be provided" },
        { status: 400 }
      );
    }

    // Check if code or email already exists
    const existingCompany = await prisma.company.findUnique({
      where: { code: companyCode.toUpperCase() },
    });

    if (existingCompany) {
      return NextResponse.json(
        { success: false, message: "Company code already registered" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User email already in use" },
        { status: 400 }
      );
    }

    // Ensure COMPANY_ADMIN role exists
    let adminRole = await prisma.role.findUnique({ where: { name: "COMPANY_ADMIN" } });
    if (!adminRole) {
      adminRole = await prisma.role.create({
        data: { name: "COMPANY_ADMIN", description: "Company Admin Role" },
      });
    }

    // Create Company, User, and default Subscription in transaction
    const newCompany = await prisma.company.create({
      data: {
        name: companyName,
        code: companyCode.toUpperCase(),
        email: email.toLowerCase(),
        phone,
        status: "ACTIVE",
        users: {
          create: {
            email: email.toLowerCase(),
            passwordHash: password, // In production, hash with bcrypt
            fullName,
            phone,
            status: "ACTIVE",
            roles: {
              create: {
                roleId: adminRole.id,
              },
            },
          },
        },
        subscriptions: {
          create: {
            plan: "PROFESSIONAL",
            billingCycle: "ANNUAL",
            price: 49999,
            startDate: new Date(),
            endDate: new Date(Date.now() + 86400000 * 365),
            status: "ACTIVE",
          },
        },
      },
      include: {
        users: true,
      },
    });

    const user = newCompany.users[0];
    const token = signAccessToken({
      userId: user.id,
      email: user.email,
      companyId: newCompany.id,
      roles: ["COMPANY_ADMIN"],
    });

    return NextResponse.json({
      success: true,
      message: "Company registered successfully",
      data: {
        company: newCompany,
        user,
        token,
      },
    });
  } catch (error: any) {
    console.error("Register API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to register company" },
      { status: 500 }
    );
  }
}
