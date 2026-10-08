import { Router } from "express";
import { createHash } from "node:crypto";
import { db, usersTable, passwordCredentialsTable, authAttemptsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { RegisterPasswordAccountBody } from "@workspace/api-zod";
import { hashPassword, verifyPassword } from "../lib/password";
import { clearSession, createSession, getSessionId, SESSION_COOKIE, SESSION_TTL, sessionCookieOptions, type AuthUser } from "../lib/auth";

const router = Router();
let activeHashes = 0;
async function allowed(key: string, limit: number) {
  const [row] = await db.insert(authAttemptsTable).values({
    key, count: 1, resetAt: new Date(Date.now() + 15 * 60_000),
  }).onConflictDoUpdate({
    target: authAttemptsTable.key,
    set: {
      count: sql`CASE WHEN ${authAttemptsTable.resetAt} < now() THEN 1 ELSE ${authAttemptsTable.count} + 1 END`,
      resetAt: sql`CASE WHEN ${authAttemptsTable.resetAt} < now() THEN now() + interval '15 minutes' ELSE ${authAttemptsTable.resetAt} END`,
    },
  }).returning({ count: authAttemptsTable.count });
  return row.count <= limit;
}

router.post(["/auth/register", "/auth/password-login"], async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const host = req.get("x-forwarded-host")?.split(",")[0]?.trim() ?? req.get("host");
  try {
    const origin = new URL(req.get("origin") ?? "");
    if (origin.host !== host || origin.protocol !== "https:") throw new Error("origin");
  } catch { return res.status(403).json({ error: "Same-origin request required" }); }
  if (!req.is("application/json")) return res.status(415).json({ error: "JSON required" });
  const parsed = RegisterPasswordAccountBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid email or password" });
  const email = parsed.data.email.trim().toLowerCase();
  const password = parsed.data.password;
  const register = req.path === "/auth/register";
  const digest = (value: string) => createHash("sha256").update(value).digest("hex");
  // The per-email limit applies across IPs and instances. Never trust an arbitrary
  // client-supplied forwarded-for header to bypass it.
  if (!await allowed(`email:${digest(email)}`, 12) ||
      !await allowed(`peer:${digest(req.ip ?? req.socket.remoteAddress ?? "unknown")}`, 100)) {
    res.setHeader("Retry-After", "900");
    return res.status(429).json({ error: "Too many attempts" });
  }
  if (activeHashes >= 4) return res.status(503).json({ error: "Please try again shortly" });
  activeHashes++;
  try {
    let user: AuthUser;
    if (register) {
      const hash = await hashPassword(password);
      const created = await db.transaction(async (tx) => {
        // Never attach a password to an existing provider account by email alone.
        const [existing] = await tx.select({ id: usersTable.id }).from(usersTable)
          .where(sql`lower(${usersTable.email}) = ${email}`).limit(1);
        if (existing) return null;
        const [record] = await tx.insert(usersTable).values({ email }).returning();
        await tx.insert(passwordCredentialsTable).values({ userId: record.id, email, passwordHash: hash });
        return record;
      });
      if (!created) return res.status(409).json({ error: "Email unavailable. Use your existing sign-in method." });
      user = created;
    } else {
      const [credential] = await db.select().from(passwordCredentialsTable)
        .where(eq(passwordCredentialsTable.email, email));
      if (!await verifyPassword(password, credential?.passwordHash))
        return res.status(401).json({ error: "Invalid email or password" });
      const [record] = await db.select().from(usersTable).where(eq(usersTable.id, credential.userId));
      if (!record) return res.status(401).json({ error: "Invalid email or password" });
      user = record;
    }
    await clearSession(res, getSessionId(req));
    const sid = await createSession({ provider: "password", user });
    res.cookie(SESSION_COOKIE, sid, { ...sessionCookieOptions, maxAge: SESSION_TTL });
    return res.status(register ? 201 : 200).json({ ok: true });
  } catch (error) {
    // Concurrent registrations must fail closed without disclosing DB internals.
    const code = (error as { code?: string; cause?: { code?: string } }).code ??
      (error as { cause?: { code?: string } }).cause?.code;
    if (register && code === "23505") return res.status(409).json({ error: "Email unavailable. Use your existing sign-in method." });
    throw error;
  } finally { activeHashes--; }
});
export default router;
