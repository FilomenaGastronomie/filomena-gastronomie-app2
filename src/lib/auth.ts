import { createHash } from "crypto";

export const AUTH_COOKIE_NAME = "filomena_auth";

export function getAppPassword() {
  return process.env.APP_ACCESS_PASSWORD?.trim() ?? "";
}

export function isPasswordProtectionEnabled() {
  return getAppPassword().length > 0;
}

export function hashAuthValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function getExpectedAuthCookieValue() {
  const password = getAppPassword();

  if (!password) {
    return "";
  }

  return hashAuthValue(password);
}
