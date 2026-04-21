import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, getAppPassword, getExpectedAuthCookieValue, isPasswordProtectionEnabled } from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");
  const nextPath = String(formData.get("next") ?? "/");
  const redirectPath = nextPath.startsWith("/") ? nextPath : "/";
  const loginUrl = new URL(`/login?error=1&next=${encodeURIComponent(redirectPath)}`, request.url);

  if (!isPasswordProtectionEnabled()) {
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  if (password !== getAppPassword()) {
    return NextResponse.redirect(loginUrl);
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, getExpectedAuthCookieValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.redirect(new URL(redirectPath, request.url));
}
