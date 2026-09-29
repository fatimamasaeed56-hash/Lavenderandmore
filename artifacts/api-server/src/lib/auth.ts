import crypto from "node:crypto";
import * as oidc from "openid-client";
import { db, sessionsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { Request, Response } from "express";

export const SESSION_COOKIE = "sid";
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000;
export type AuthUser = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
};
export type SessionData = {
  user: AuthUser;
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
};
let configPromise: Promise<oidc.Configuration> | undefined;
export function getOidcConfig() {
  return configPromise ??= oidc.discovery(new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"), process.env.REPL_ID!);
}
export async function createSession(sess: SessionData) {
  const sid = crypto.randomBytes(32).toString("hex");
  await db.insert(sessionsTable).values({ sid, sess, expire: new Date(Date.now() + SESSION_TTL) });
  return sid;
}
export async function getSession(sid: string): Promise<SessionData | null> {
  const [row] = await db.select().from(sessionsTable).where(eq(sessionsTable.sid, sid));
  if (!row || row.expire < new Date()) return null;
  return row.sess as SessionData;
}
export async function deleteSession(sid?: string) {
  if (sid) await db.delete(sessionsTable).where(eq(sessionsTable.sid, sid));
}
export function getSessionId(req: Request): string | undefined {
  // Browser-only sessions: no bearer token accepted for cookie-authenticated routes.
  return req.cookies?.[SESSION_COOKIE];
}
export async function clearSession(res: Response, sid?: string) {
  await deleteSession(sid);
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}
export async function upsertUser(claims: Record<string, unknown>): Promise<AuthUser> {
  const userData = {
    id: claims.sub as string,
    email: typeof claims.email === "string" ? claims.email : null,
    firstName: typeof claims.first_name === "string" ? claims.first_name : null,
    lastName: typeof claims.last_name === "string" ? claims.last_name : null,
    profileImageUrl: typeof (claims.profile_image_url ?? claims.picture) === "string" ? (claims.profile_image_url ?? claims.picture) as string : null,
  };
  const [user] = await db.insert(usersTable).values(userData).onConflictDoUpdate({
    target: usersTable.id, set: { ...userData, updatedAt: new Date() },
  }).returning();
  return user;
}
export { SESSION_TTL };