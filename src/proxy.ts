import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;

  // Public routes
  const publicRoutes = ["/", "/auth/signin", "/auth/error"];
  const isPublicRoute =
    publicRoutes.includes(pathname) ||
    pathname.startsWith("/api/auth");

  if (!req.auth && !isPublicRoute) {
    const signInUrl = new URL("/auth/signin", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
