/* Sign in with Google: check a Google ID token with Google's token-info endpoint.
   Only the Client ID is needed (it's public). No client secret is used or stored. */
export const DEFAULT_GOOGLE_CLIENT_ID = "230276755248-ols80n51ngf3hmqu8g9ccik9blgt1ehr.apps.googleusercontent.com";

export async function verifyGoogle(credential, clientId) {
  if (!credential || typeof credential !== "string" || credential.length > 4000) return null;
  let r;
  try { r = await fetch("https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(credential)) } catch { return null }
  if (!r.ok) return null;
  const p = await r.json().catch(() => null);
  if (!p || p.aud !== clientId) return null;
  if (!["accounts.google.com", "https://accounts.google.com"].includes(p.iss)) return null;
  if (!(+p.exp * 1000 > Date.now())) return null;
  if (!(p.email_verified === true || p.email_verified === "true")) return null;
  if (!p.sub || !p.email) return null;
  return { sub: String(p.sub), email: String(p.email).toLowerCase() };
}
