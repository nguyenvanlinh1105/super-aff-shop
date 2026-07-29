import { NextRequest } from "next/server";

/**
 * Behind the Nginx reverse proxy, req.url resolves to the internal
 * localhost:PORT address Next.js is bound to, not the public domain —
 * reconstruct the real origin from the forwarded headers Nginx sets
 * (falls back to req.url for local dev with no proxy in front).
 */
export function getRequestOrigin(req: NextRequest): string {
  const host = req.headers.get("host") ?? new URL(req.url).host;
  const protocol = req.headers.get("x-forwarded-proto") ?? new URL(req.url).protocol.replace(":", "");
  return `${protocol}://${host}`;
}
