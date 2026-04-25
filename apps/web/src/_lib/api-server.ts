// apps/web/src/_lib/api-server.ts
"use server";

import { cookies } from "next/headers";

const API_BASE = process.env.INTERNAL_API_URL ?? "http://localhost:3001";

/**
 * Server-side API Fetcher
 * Forwards session cookies and handles auth for Server Actions.
 */
export async function apiFetch(path: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  return fetch(url, {
    ...options,
    headers,
  });
}
