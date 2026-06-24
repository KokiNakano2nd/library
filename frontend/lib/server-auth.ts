import "server-only";

import { cookies } from "next/headers";

import type { CurrentUser } from "@/types/auth";

const SERVER_API_BASE_URL =
  process.env.INTERNAL_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8000";

const AUTH_COOKIE_NAME = "library_access_token";
const ADMIN_ROLE = "admin";

export async function fetchCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const accessTokenCookie = cookieStore.get(AUTH_COOKIE_NAME);

  if (accessTokenCookie === undefined) {
    return null;
  }

  try {
    const response = await fetch(`${SERVER_API_BASE_URL}/api/auth/me`, {
      cache: "no-store",
      headers: {
        Cookie: `${AUTH_COOKIE_NAME}=${accessTokenCookie.value}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const body = (await response.json()) as { user: CurrentUser };
    return body.user;
  } catch {
    return null;
  }
}

export function isAdminUser(user: CurrentUser | null): boolean {
  return user !== null && user.role === ADMIN_ROLE;
}
