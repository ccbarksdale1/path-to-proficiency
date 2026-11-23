/* Log in with Clever (OAuth 2.0 authorization code flow).
   The browser sends the one-time code; the server trades it for a token with the client secret,
   asks Clever who signed in (/v3.0/me and /v3.0/users/{id}), and never stores Clever's token.
   Everything is off until CLEVER_CLIENT_SECRET is set in Netlify. */
import crypto from "node:crypto";

export const DEFAULT_CLEVER_CLIENT_ID = "aea7de68304d02146a4e";
export const DEFAULT_CLEVER_REDIRECT = "https://pathtoproficiency.com/clever";
export const cleverOn = env => !!env.CLEVER_CLIENT_SECRET;
export const cleverConfig = env => ({ on: cleverOn(env), clientId: env.CLEVER_CLIENT_ID || DEFAULT_CLEVER_CLIENT_ID, redirect: env.CLEVER_REDIRECT_URI || DEFAULT_CLEVER_REDIRECT });

const roleOf = roles => {
  const r = Object.keys(roles || {});
  if (r.includes("teacher") || r.includes("staff") || r.includes("district_admin")) return "teacher";
  if (r.includes("student")) return "student";
  return "";
};

export async function verifyClever(code, env) {
  if (!cleverOn(env) || !code || typeof code !== "string" || code.length > 200) return null;
  const { clientId, redirect } = cleverConfig(env);
  try {
    const t = await fetch("https://clever.com/oauth/tokens", {
      method: "POST",
      headers: { Authorization: "Basic " + Buffer.from(clientId + ":" + env.CLEVER_CLIENT_SECRET).toString("base64"), "content-type": "application/json" },
      body: JSON.stringify({ code, grant_type: "authorization_code", redirect_uri: redirect }),
    });
    if (!t.ok) return null;
    const tok = (await t.json()).access_token; if (!tok) return null;
    const H = { Authorization: "Bearer " + tok };
    const me = await fetch("https://api.clever.com/v3.0/me", { headers: H }).then(r => r.ok ? r.json() : null);
    const d = me && me.data; if (!d || !d.id) return null;
    const u = await fetch(`https://api.clever.com/v3.0/users/${encodeURIComponent(d.id)}`, { headers: H }).then(r => r.ok ? r.json() : null).catch(() => null);
    const ud = (u && u.data) || {};
    return { sub: String(d.id), district: String(d.district || ""), type: roleOf(ud.roles), name: [ud.name?.first, ud.name?.last].filter(Boolean).join(" ").slice(0, 60) };
  } catch { return null }
}

/* a short-lived signed note: "this Clever account just signed in", used once to connect it to a PTP account */
const b64 = s => Buffer.from(s).toString("base64url");
const mac = (body, env) => crypto.createHmac("sha256", "ptp-clever-ticket:" + env.CLEVER_CLIENT_SECRET).update(body).digest("base64url");
export function cleverTicket(p, env) {
  const body = b64(JSON.stringify({ sub: p.sub, type: p.type, name: p.name || "", exp: Date.now() + 15 * 60e3 }));
  return body + "." + mac(body, env);
}
export function readTicket(t, env) {
  if (!cleverOn(env) || typeof t !== "string" || t.length > 1000) return null;
  const [body, sig] = t.split(".");
  if (!body || !sig) return null;
  const want = mac(body, env);
  if (sig.length !== want.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(want))) return null;
  try { const p = JSON.parse(Buffer.from(body, "base64url").toString()); return p.exp > Date.now() && p.sub ? p : null } catch { return null }
}
