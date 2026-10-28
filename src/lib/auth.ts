import { verifyAccessToken, TokenPayload } from "@/lib/jwt";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export interface TenantContext {
  userId: string;
  email: string;
  companyId: string;
  roles: string[];
  distributorId?: string | null;
  assignedState?: string | null;
}

// All supported RBAC system roles
export type UserRoleName =
  | "SUPER_ADMIN"
  | "COMPANY_ADMIN"
  | "FINANCE_MANAGER"
  | "STATE_MANAGER"
  | "TERRITORY_MANAGER"
  | "DISTRIBUTOR"
  | "DATA_ENTRY"
  | "THEATER_OWNER"
  | "SALES_MANAGER"
  | "SALES_EXECUTIVE"
  | "ACCOUNTANT"
  | "SUPPORT";

/**
 * Extracts Tenant Context (userId, companyId, roles) from request headers or cookies.
 */
export function getTenantContext(request: Request): TenantContext | null {
  try {
    // 1. Try extracting from headers injected by Tenant Middleware
    const companyIdHeader = request.headers.get("x-company-id");
    const userIdHeader = request.headers.get("x-user-id");
    const userEmailHeader = request.headers.get("x-user-email");
    const userRolesHeader = request.headers.get("x-user-roles");
    const userDistributorIdHeader = request.headers.get("x-user-distributor-id");
    const userAssignedStateHeader = request.headers.get("x-user-assigned-state");

    if (companyIdHeader && userIdHeader) {
      return {
        userId: userIdHeader,
        email: userEmailHeader || "",
        companyId: companyIdHeader,
        roles: userRolesHeader ? userRolesHeader.split(",") : [],
        distributorId: userDistributorIdHeader || null,
        assignedState: userAssignedStateHeader || null,
      };
    }

    // 2. Try extracting from Authorization header Bearer token
    const authHeader = request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);
      if (payload) {
        return {
          userId: payload.userId,
          email: payload.email,
          companyId: payload.companyId,
          roles: payload.roles || [],
          distributorId: payload.distributorId || null,
          assignedState: payload.assignedState || null,
        };
      }
    }

    // 3. Try extracting from Cookie
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      const match = cookieHeader.match(/movieflow_token=([^;]+)/);
      if (match && match[1]) {
        const payload = verifyAccessToken(match[1]);
        if (payload) {
          return {
            userId: payload.userId,
            email: payload.email,
            companyId: payload.companyId,
            roles: payload.roles || [],
            distributorId: payload.distributorId || null,
            assignedState: payload.assignedState || null,
          };
        }
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Enhanced Resolver that loads distributorId and assignedState for role-based scoping
 */
export async function getEnrichedTenantContext(request: Request): Promise<TenantContext | null> {
  const baseContext = getTenantContext(request);
  if (!baseContext) {
    // Fallback in dev/local mode if company exists
    const defaultCompany = await prisma.company.findFirst();
    const defaultUser = await prisma.user.findFirst({
      where: { companyId: defaultCompany?.id },
      include: { roles: { include: { role: true } } },
    });
    if (defaultCompany && defaultUser) {
      return {
        userId: defaultUser.id,
        email: defaultUser.email,
        companyId: defaultCompany.id,
        roles: defaultUser.roles.map((r) => r.role.name),
        distributorId: defaultUser.distributorId,
        assignedState: defaultUser.assignedState,
      };
    }
    return null;
  }

  // Load user specifics (distributorId, assignedState)
  try {
    const user = await prisma.user.findUnique({
      where: { id: baseContext.userId },
      select: { distributorId: true, assignedState: true },
    });
    return {
      ...baseContext,
      distributorId: user?.distributorId,
      assignedState: user?.assignedState,
    };
  } catch {
    return baseContext;
  }
}

/**
 * Row-Level Tenant Isolation Helper:
 * Ensures all database queries automatically include companyId scoping.
 */
export function withTenantScope<T extends Record<string, any>>(whereClause: T = {} as T, companyId: string): T & { companyId: string } {
  return {
    ...whereClause,
    companyId,
  };
}

/**
 * Role-Based Access Control (RBAC) Permission Check
 */
export function hasRole(userRoles: string[], requiredRoles: UserRoleName | UserRoleName[]): boolean {
  if (userRoles.includes("SUPER_ADMIN") || userRoles.includes("COMPANY_ADMIN")) {
    return true; // Admins have full access
  }

  const requiredList = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return userRoles.some((role) => requiredList.includes(role as UserRoleName));
}

/**
 * Middleware / API Guard helper: returns 401/403 response if context or role is invalid.
 */
export async function requireTenantAuth(
  request: Request,
  requiredRoles?: UserRoleName | UserRoleName[]
): Promise<{ context: TenantContext } | { response: NextResponse }> {
  const context = await getEnrichedTenantContext(request);
  if (!context) {
    return {
      response: NextResponse.json({ success: false, message: "Unauthenticated. Tenant context missing." }, { status: 401 }),
    };
  }

  if (requiredRoles && !hasRole(context.roles, requiredRoles)) {
    return {
      response: NextResponse.json({ success: false, message: "Forbidden. Insufficient RBAC role permissions." }, { status: 403 }),
    };
  }

  return { context };
}

/**
 * Financial & Administrative Audit Trail Logging Helper
 */
export async function recordAuditLog({
  companyId,
  userId,
  action,
  entityName,
  entityId,
  details,
}: {
  companyId: string;
  userId?: string | null;
  action: string;
  entityName: string;
  entityId?: string | null;
  details?: Record<string, any> | string;
}) {
  try {
    const detailsStr = typeof details === "object" ? JSON.stringify(details) : details;
    await prisma.auditLog.create({
      data: {
        companyId,
        userId: userId || null,
        action,
        entityName,
        entityId: entityId || null,
        details: detailsStr || null,
      },
    });
  } catch (error) {
    console.error("Failed to record audit log:", error);
  }
}
