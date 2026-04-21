import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "filomena_auth";
const publicPaths = ["/login", "/api/auth/login", "/api/auth/logout"];
const assetPrefixes = ["/_next", "/icon", "/apple-icon"];
const assetPaths = ["/favicon.ico", "/manifest.webmanifest"];

async function hashValue(value: string) {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const password = process.env.APP_ACCESS_PASSWORD?.trim() ?? "";

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  if (!password) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  const isPublicPath = publicPaths.some((path) => pathname === path);
  const isAssetPath = assetPaths.includes(pathname) || assetPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (isPublicPath || isAssetPath) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  const cookieValue = request.cookies.get(AUTH_COOKIE_NAME)?.value ?? "";
  const expectedCookie = await hashValue(password);

  if (cookieValue !== expectedCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!api/auth/logout).*)"],
};
