import type { NextFunction, Request, Response } from "express";
import * as oidc from "openid-client";
import { clearSession, getOidcConfig, getSession, getSessionId, SESSION_COOKIE, SESSION_TTL, sessionCookieOptions, type AuthUser } from "../lib/auth";
import { db, sessionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

declare global {
  namespace Express {
    interface User extends AuthUser {}
    interface Request {
      user?: User;
      isAuthenticated(): this is Request & { user: User };
    }
  }
}
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    req.isAuthenticated = function (this: Request): this is Request & { user: Express.User } {
      return !!this.user;
    };
    const sid = getSessionId(req);
    if (!sid) return next();
    const session = await getSession(sid);
    if (!session?.user?.id) {
      await clearSession(res, sid);
      return next();
    }
    if (session.expires_at && Math.floor(Date.now() / 1000) > session.expires_at) {
      if (!session.refresh_token) {
        await clearSession(res, sid);
        return next();
      }
      try {
        const tokens = await oidc.refreshTokenGrant(await getOidcConfig(), session.refresh_token);
        session.access_token = tokens.access_token;
        session.refresh_token = tokens.refresh_token ?? session.refresh_token;
        session.expires_at = tokens.expiresIn() ? Math.floor(Date.now() / 1000) + tokens.expiresIn()! : session.expires_at;
        await db.update(sessionsTable).set({ sess: session }).where(eq(sessionsTable.sid, sid));
      } catch {
        await clearSession(res, sid);
        return next();
      }
    }
    // Extend both sides together; UPDATE must never recreate a logged-out session.
    const renewed = await db.update(sessionsTable)
      .set({ expire: new Date(Date.now() + SESSION_TTL) })
      .where(eq(sessionsTable.sid, sid)).returning({ sid: sessionsTable.sid });
    if (!renewed.length) return next();
    res.cookie(SESSION_COOKIE, sid, { ...sessionCookieOptions, maxAge: SESSION_TTL });
    req.user = session.user;
    next();
  } catch (error) {
    next(error);
  }
}