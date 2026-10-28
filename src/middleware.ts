import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface EdgeTokenPayload {
  userId: string;
  email: string;
  companyId: string;
  roles: string[];
  distributorId?: string | null;
  assignedState?: string | null;
  exp?: number;
}

function decodeJwtInEdge(token: string): EdgeTokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload) as EdgeTokenPayload;
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected application routes requiring authentication & tenant scope
  const protectedRoutes = [
    "/dashboard",
    "/movies",
    "/distribution",
    "/theaters",
    "/collections",
    "/finance",
    "/reports",
    "/map",
    "/distributors",
    "/crm",
    "/deals",
    "/scheduling",
    "/payments",
    "/notifications",
    "/users",
    "/company",
    "/subscription",
    "/ai-insights",
  ];

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  const token = request.cookies.get("movieflow_token")?.value;

  if (isProtectedRoute && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", encodeURIComponent(pathname));
    return NextResponse.redirect(url);
  }

  // Redirect from login/signup to dashboard if already authenticated
  if ((pathname === "/login" || pathname === "/signup") && token) {
    const payload = decodeJwtInEdge(token);
    if (payload) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // Inject Tenant Context Headers if token is present
  const requestHeaders = new Headers(request.headers);
  if (token) {
    const payload = decodeJwtInEdge(token);
    if (payload) {
      requestHeaders.set("x-company-id", payload.companyId);
      requestHeaders.set("x-user-id", payload.userId);
      requestHeaders.set("x-user-email", payload.email);
      requestHeaders.set("x-user-roles", (payload.roles || []).join(","));
      if (payload.distributorId) {
        requestHeaders.set("x-user-distributor-id", payload.distributorId);
      }
      if (payload.assignedState) {
        requestHeaders.set("x-user-assigned-state", payload.assignedState);
      }
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/movies/:path*",
    "/distribution/:path*",
    "/theaters/:path*",
    "/collections/:path*",
    "/finance/:path*",
    "/reports/:path*",
    "/map/:path*",
    "/distributors/:path*",
    "/crm/:path*",
    "/deals/:path*",
    "/scheduling/:path*",
    "/payments/:path*",
    "/notifications/:path*",
    "/users/:path*",
    "/company/:path*",
    "/subscription/:path*",
    "/ai-insights/:path*",
    "/login",
    "/signup",
  ],
};
