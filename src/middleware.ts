import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/jwt";

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
    const payload = verifyAccessToken(token);
    if (payload) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // Inject Tenant Context Headers if token is present
  const requestHeaders = new Headers(request.headers);
  if (token) {
    const payload = verifyAccessToken(token);
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
