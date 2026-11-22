// Path to Proficiency: multi-district router.
// With MULTI_DISTRICT unset (today's live site), every request goes to the one "p2p" store exactly as before.
// With MULTI_DISTRICT=on, each district has its own store ("ptp-d-<district>") and a small shared registry
// ("ptp-registry") holds only the district list and an index from class codes to districts. No student data lives there.
// The district for a request comes from its signed token, its class code, or the district code typed at sign-in.
// The token is then checked against that district's own secret, so a token edited to name another district fails.
import crypto from "node:crypto";
import { makeApi } from "./core.mjs";

const J = (status, body) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const DIST = /^[a-z0-9][a-z0-9-]{1,23}$/;
const JOIN = /^[A-Z0-9]{4,10}$/;
const sha = s => crypto.createHash("sha256").update(s).digest("hex");
const str = (v, max = 200) => String(v ?? "").trim().slice(0, max);
/* public forms with no district (tutor applications, demo requests) land in the home district, where the site admin reviews them today */
const HOME_ACTIONS = new Set(["tutorApply", "tutorFile", "leadAdd"]);
/* actions the router answers itself: the platform owner's district tools */
const OWNER_ACTIONS = new Set(["ownerDistricts", "ownerDistrictCreate", "ownerDistrictDelete", "ownerResearchAll"]);

export const districtStoreName = d => "ptp-d-" + d;

/* Read the district a token claims WITHOUT trusting it: the district's own API then checks the signature with its secret. */
export function tokenDistrict(token) {
  if (typeof token !== "string" || !token.includes(".")) return null;
  try { const p = JSON.parse(Buffer.from(token.split(".")[0], "base64url").toString()); return typeof p.d === "string" && DIST.test(p.d) ? p.d : null } catch { return null }
}

export function makeRouter({ getStore, env }) {
  const multi = env.MULTI_DISTRICT === "on";
  const single = () => makeApi({ store: getStore("p2p"), env });
  if (!multi) return { multi, handle: (req, ip) => single()(req, ip), snapshots: async () => [await single().snapshot()] };

  const reg = getStore("ptp-registry");
  const getR = async k => (await reg.get(k, { type: "json" })) ?? null;
  const listR = async prefix => ((await reg.list({ prefix })).blobs || []).map(b => b.key);
  const districtExists = async d => DIST.test(d || "") && !!(await getR("district/" + d));

  const hooksFor = d => ({
    // claim a class code for this district; false if any district already has it
    claimJoin: async code => {
      const k = "join/" + code, r = await reg.setJSON(k, { d, at: Date.now() }, { onlyIfNew: true });
      if (r && r.modified === false) { const cur = await getR(k); return !!cur && cur.d === d }
      return true;
    },
    releaseJoin: async code => { const cur = await getR("join/" + code); if (cur && cur.d === d) await reg.delete("join/" + code) },
  });
  const apiFor = d => makeApi({ store: getStore(districtStoreName(d)), env, district: d, hooks: hooksFor(d) });

  /* ---------- the platform owner's district tools (owner code, with lockout) ---------- */
  async function ownerCheck(b, ip) {
    if (!env.OWNER_CODE) throw [403, "Add OWNER_CODE in Netlify first, then redeploy."];
    const lk = "fail/o-" + sha("o" + ip).slice(0, 24), f = (await getR(lk)) || { n: 0, at: 0 };
    if (f.n >= 8 && Date.now() - f.at < 15 * 60 * 1000) throw [429, "Too many tries. Wait 15 minutes."];
    const a = Buffer.from(sha("own" + str(b.code, 200))), w = Buffer.from(sha("own" + env.OWNER_CODE));
    if (!crypto.timingSafeEqual(a, w)) { await reg.setJSON(lk, { n: f.n + 1, at: Date.now() }); throw [401, "That owner code did not match."] }
    if (f.n) await reg.delete(lk);
  }
  const OWNER = {
    async ownerDistricts() {
      const out = [];
      for (const k of await listR("district/")) {
        const d = await getR(k), st = getStore(districtStoreName(d.id));
        const school = (await st.get("school", { type: "json" })) ?? null;
        out.push({ id: d.id, name: d.name, created: d.created, ready: !!school, teachers: school ? school.teachers.length : 0, classes: school ? school.classes.length : 0, license: school?.license || null });
      }
      return { districts: out };
    },
    async ownerDistrictCreate(b) {
      const id = str(b.id, 24).toLowerCase(), name = str(b.name, 100);
      if (!DIST.test(id)) throw [400, "District code: 2 to 24 lowercase letters, numbers or dashes, like oxford or rh-bearden."];
      if (!name) throw [400, "Type the district's name."];
      const setupKey = crypto.randomBytes(9).toString("base64url"); // given once to the district's first admin; only its hash is kept
      const r = await reg.setJSON("district/" + id, { id, name, created: Date.now(), setupHash: sha("setup" + setupKey) }, { onlyIfNew: true });
      if (r && r.modified === false) throw [409, "That district code is already used."];
      return { ok: true, id, setupKey };
    },
    async ownerDistrictDelete(b) {
      const id = str(b.id, 24);
      if (!(await districtExists(id))) throw [404, "That district was not found."];
      if (str(b.confirm, 40) !== "DELETE " + id) throw [400, `Type DELETE ${id} to confirm.`];
      const st = getStore(districtStoreName(id));
      for (const k of ((await st.list()).blobs || []).map(x => x.key)) await st.delete(k);
      for (const k of await listR("join/")) { const j = await getR(k); if (j && j.d === id) await reg.delete(k) }
      await reg.delete("district/" + id);
      return { ok: true };
    },
    async ownerResearchAll(b, ip) {
      const salt = crypto.randomBytes(8).toString("hex"), districts = [];
      for (const k of await listR("district/")) {
        const d = await getR(k), res = await apiFor(d.id)(new Request("http://x/api/ownerResearch", { method: "POST", body: JSON.stringify({ code: b.code }) }), ip);
        if (!res.ok) continue; // a district that is not set up yet
        const data = await res.json();
        districts.push({ id: "d" + sha(salt + d.id).slice(0, 10), made: data.made, classes: data.classes });
      }
      return { made: districts[0]?.made || null, note: "De-identified across districts: random IDs per export for districts, classes and students.", districts };
    },
  };

  /* ---------- which district does this request belong to? ---------- */
  async function resolve(action, body, req) {
    const fromToken = tokenDistrict(body.token);
    if (body.token) return fromToken; // a token always decides (and is then verified by that district)
    if (body.join) { const j = await getR("join/" + str(body.join, 10).toUpperCase()); return j ? j.d : null }
    if (body.district) return str(body.district, 24).toLowerCase();
    const host = (req.headers.get("host") || "").toLowerCase().split(":")[0], h = host && (await getR("host/" + host));
    if (h) return h.d;
    if (HOME_ACTIONS.has(action) && env.HOME_DISTRICT) return env.HOME_DISTRICT;
    return null;
  }

  async function handle(req, ip) {
    if (req.method !== "POST") return J(405, { error: "Use POST." });
    const action = new URL(req.url).pathname.replace(/^\/api\/?/, "").replace(/\/$/, "");
    let body = {};
    try { body = await req.clone().json() } catch { body = {} }
    if (OWNER_ACTIONS.has(action)) {
      try { await ownerCheck(body, ip); return J(200, await OWNER[action](body, ip)) }
      catch (e) { if (Array.isArray(e)) return J(e[0], { error: e[1] }); console.error(e); return J(500, { error: "Something went wrong on the server. Try again." }) }
    }
    const d = await resolve(action, body, req);
    if (!d) return J(400, { error: body.token ? "Please sign in again." : body.join ? "That class code was not found." : "Type your district code first." });
    if (!(await districtExists(d))) return J(404, { error: body.token ? "Please sign in again." : "That district code was not found." });
    if (action === "setup") { // a new district's first admin needs the one-time setup key from the platform owner
      const rec = await getR("district/" + d), key = str(body.setupKey, 40);
      if (!rec.setupHash || !key || !crypto.timingSafeEqual(Buffer.from(sha("setup" + key)), Buffer.from(rec.setupHash))) return J(403, { error: "Ask Path to Proficiency for your district's setup key." });
      const res = await apiFor(d)(req, ip);
      if (res.ok) { const { setupHash, ...rest } = rec; await reg.setJSON("district/" + d, { ...rest, setupAt: Date.now() }) } // the key works once
      return res;
    }
    return apiFor(d)(req, ip);
  }

  async function snapshots() {
    const keys = [];
    for (const k of await listR("district/")) {
      const d = await getR(k), st = getStore(districtStoreName(d.id));
      if ((await st.get("school", { type: "json" })) == null) continue;
      keys.push(d.id + ": " + await apiFor(d.id).snapshot());
    }
    return keys;
  }
  return { multi, handle, snapshots };
}
