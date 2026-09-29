import { Router, type IRouter, type Request, type Response } from "express";
import * as oidc from "openid-client";
import { clearSession, createSession, getOidcConfig, getSessionId, SESSION_COOKIE, SESSION_TTL, upsertUser } from "../lib/auth";

const router: IRouter = Router();
const safePath = (path: unknown) => typeof path === "string" && path.startsWith("/") && !path.startsWith("//") && !path.includes("\\") && !/[\r\n]/.test(path) ? path : "/";
const origin = (req: Request) => `${req.get("x-forwarded-proto")?.split(",")[0] ?? "https"}://${req.get("x-forwarded-host")?.split(",")[0] ?? req.get("host")}`;
const cookieOptions = { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" };

router.get("/auth/user", (req, res) => {
  res.json({ user: req.isAuthenticated() ? req.user : null });
});
router.get("/login", async (req, res) => {
  const config = await getOidcConfig();
  const state = oidc.randomState();
  const nonce = oidc.randomNonce();
  const verifier = oidc.randomPKCECodeVerifier();
  const redirect = oidc.buildAuthorizationUrl(config, {
    redirect_uri: `${origin(req)}/api/callback`,
    scope: "openid email profile offline_access",
    code_challenge: await oidc.calculatePKCECodeChallenge(verifier),
    code_challenge_method: "S256", state, nonce,
  });
  for (const [key, value] of Object.entries({ state, nonce, verifier, return_to: safePath(req.query.returnTo) })) {
    res.cookie(`oidc_${key}`, value, { ...cookieOptions, maxAge: 600000 });
  }
  res.redirect(redirect.href);
});
router.get("/callback", async (req: Request, res: Response) => {
  const { oidc_state: state, oidc_nonce: nonce, oidc_verifier: verifier, oidc_return_to: returnTo } = req.cookies ?? {};
  if (!state || !nonce || !verifier) return res.status(400).json({ error: "Invalid login session" });
  try {
    const callback = `${origin(req)}/api/callback`;
    const url = new URL(callback);
    for (const [key, value] of Object.entries(req.query)) if (typeof value === "string") url.searchParams.set(key, value);
    const tokens = await oidc.authorizationCodeGrant(await getOidcConfig(), url, {
      pkceCodeVerifier: verifier, expectedNonce: nonce, expectedState: state, idTokenExpected: true,
    });
    const claims = tokens.claims();
    if (!claims) return res.status(401).json({ error: "Login failed" });
    const user = await upsertUser(claims as unknown as Record<string, unknown>);
    const sid = await createSession({
      user, access_token: tokens.access_token, refresh_token: tokens.refresh_token,
      expires_at: tokens.expiresIn() ? Math.floor(Date.now() / 1000) + tokens.expiresIn()! : claims.exp,
    });
    for (const key of ["state", "nonce", "verifier", "return_to"]) res.clearCookie(`oidc_${key}`, { path: "/" });
    res.cookie(SESSION_COOKIE, sid, { ...cookieOptions, maxAge: SESSION_TTL });
    return res.redirect(safePath(returnTo));
  } catch (error) {
    req.log.warn({ error }, "OIDC callback failed");
    return res.status(401).json({ error: "Login failed" });
  }
});
router.get("/logout", async (req, res) => {
  const config = await getOidcConfig();
  await clearSession(res, getSessionId(req));
  const url = oidc.buildEndSessionUrl(config, {
    client_id: process.env.REPL_ID!,
    post_logout_redirect_uri: new URL(safePath(req.query.returnTo), `${origin(req)}/`).href,
  });
  res.redirect(url.href);
});
export default router;