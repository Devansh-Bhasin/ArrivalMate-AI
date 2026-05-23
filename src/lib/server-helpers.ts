import { headers } from "next/headers";
import { guardRateLimit } from "@/lib/rate-limit";
import { jsonError } from "@/lib/api";

export async function checkRequestRateLimit(routeKey: string) {
  let ip = "local-demo-user";

  try {
    const headerStore = await headers();
    ip = headerStore.get("x-forwarded-for") || ip;
  } catch {
    ip = "local-demo-user";
  }

  const result = guardRateLimit(`${routeKey}:${ip}`);

  if (!result.allowed) {
    return jsonError("Too many requests. Please wait a moment and try again.", 429);
  }

  return null;
}
