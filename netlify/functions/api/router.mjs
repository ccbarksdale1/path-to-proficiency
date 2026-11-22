// Path to Proficiency: multi-district router.
// With MULTI_DISTRICT unset (today's live site), every request goes to the one "p2p" store exactly as before.
// With MULTI_DISTRICT=on:
//   - every SCHOOL has its own walled-off store ("ptp-d-<school>"), run by the same tested code as today;
//   - a small shared registry ("ptp-registry") holds only districts, schools, district admins and the class-code index.
//     No student data lives there.
// The school for a request comes from its signed token, its class code, or the school code typed at sign-in.
// The token is then checked against that school's own secret, so a token edited to name another school fails.
import crypto from "node:crypto";
import { makeApi } from "./core.mjs";

const J = (status, body) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const ID = /^[a-z0-9][a-z0-9-]{1,23}$/;
const sha = s => crypto.createHash("sha256").update(s).digest("hex");
const str = (v, max = 200) => String(v ?? "").trim().slice(0, max);
const rid = (n = 10) => crypto.randomBytes(16).toString("base64url").replace(/[^A-Za-z0-9]/g, "").slice(0, n);
/* public forms with no school (tutor applications, demo requests) land in the home school, where the site admin reviews them today */
const HOME_ACTIONS = new Set(["tutorApply", "tutorFile", "leadAdd"]);
const OWNER_ACTIONS = new Set(["ownerDistricts", "ownerDistrictCreate", "ownerDistrictDelete", "ownerDistrictAdmin", "ownerSchoolCreate", "ownerSchoolDelete", "ownerResearchAll"]);
const DISTRICT_ACTIONS = new Set(["districtLogin", "districtOverview"]);

export const schoolStoreName = id => "ptp-d-" + id;
class Fail extends Error { constructor(status, msg) { super(msg); this.status = status } }
const no = (status, msg) => { throw new Fail(status, msg) };

/* Read the school a token claims WITHOUT trusting it: that school's own API then checks the signature with its secret. */
export function tokenTenant(token) {
  if (typeof token !== "string" || !token.includes(".")) return null;
  try { const p = JSON.parse(Buffer.from(token.split(".")[0], "base64url").toString()); return typeof p.d === "string" && ID.test(p.d) ? p.d : null } catch { return null }
}

export function makeRouter({ getStore, env }) {
  const multi = env.MULTI_DISTRICT === "on";
  const single = () => makeApi({ store: getStore("p2p"), env });
  if (!multi) return { multi, handle: (req, ip) => single()(req, ip), snapshots: async () => [await single().snapshot()] };

  const reg = getStore("ptp-registry");
  const getR = async k => (await reg.get(k, { type: "json" })) ?? null;
  const setR = (k, v, o) => reg.setJSON(k, v, o);
  const listR = async prefix => ((await reg.list({ prefix })).blobs || []).map(b => b.key);
  const allR = async prefix => { const out = []; for (const k of await listR(prefix)) { const v = await getR(k); if (v) out.push(v) } return out };
  const schoolRec = async id => (ID.test(id || "") ? await getR("school/" + id) : null);
  const schoolStore = id => getStore(schoolStoreName(id));

  const hooksFor = id => ({
    claimJoin: async code => { // a class code belongs to exactly one school, across every district
      const k = "join/" + code, r = await setR(k, { d: id, at: Date.now() }, { onlyIfNew: true });
      if (r && r.modified === false) { const cur = await getR(k); return !!cur && cur.d === id }
      return true;
    },
    releaseJoin: async code => { const cur = await getR("join/" + code); if (cur && cur.d === id) await reg.delete("join/" + code) },
  });
  const apiFor = id => makeApi({ store: schoolStore(id), env, tenant: id, hooks: hooksFor(id) });

  /* ---------- lockouts and tokens for the registry-level sign-ins ---------- */
  async function locked(scope, ip) {
    const k = `fail/${scope}-` + sha(scope + ip).slice(0, 24), f = (await getR(k)) || { n: 0, at: 0 };
    if (f.n >= 8 && Date.now() - f.at < 15 * 60 * 1000) no(429, "Too many tries. Wait 15 minutes.");
    return { miss: () => setR(k, { n: f.n + 1, at: Date.now() }), clear: () => f.n ? reg.delete(k) : null };
  }
  async function regSecret() {
    let s = await getR("secret");
    if (!s) { await setR("secret", { v: rid(40) }, { onlyIfNew: true }); s = await getR("secret") }
    return s.v;
  }
  const signR = async payload => { const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 12 * 3600 * 1000 })).toString("base64url"); return body + "." + crypto.createHmac("sha256", await regSecret()).update(body).digest("base64url") };
  async function verifyR(token) {
    if (typeof token !== "string") return null;
    const [body, mac] = token.split("."); if (!body || !mac) return null;
    const want = crypto.createHmac("sha256", await regSecret()).update(body).digest("base64url");
    if (want.length !== mac.length || !crypto.timingSafeEqual(Buffer.from(want), Buffer.from(mac))) return null;
    try { const p = JSON.parse(Buffer.from(body, "base64url").toString()); return p.exp > Date.now() ? p : null } catch { return null }
  }

  /* ---------- the platform owner's tools (owner code, with lockout) ---------- */
  async function ownerCheck(b, ip) {
    if (!env.OWNER_CODE) no(403, "Add OWNER_CODE in Netlify first, then redeploy.");
    const L = await locked("o", ip);
    const a = Buffer.from(sha("own" + str(b.code, 200))), w = Buffer.from(sha("own" + env.OWNER_CODE));
    if (!crypto.timingSafeEqual(a, w)) { await L.miss(); no(401, "That owner code did not match.") }
    await L.clear();
  }
  async function schoolSummary(rec) {
    const school = (await schoolStore(rec.id).get("school", { type: "json" })) ?? null;
    return { id: rec.id, name: rec.name, district: rec.district, created: rec.created, ready: !!school, waitingForSetup: !!rec.setupHash, teachers: school ? school.teachers.length : 0, classes: school ? school.classes.length : 0, license: school?.license || null };
  }
  const OWNER = {
    async ownerDistricts() {
      const schools = await allR("school/"), districts = await allR("district/"), out = [];
      for (const d of districts) out.push({ id: d.id, name: d.name, admins: (d.admins || []).map(a => a.name), schools: await Promise.all(schools.filter(s => s.district === d.id).map(schoolSummary)) });
      return { districts: out };
    },
    async ownerDistrictCreate(b) {
      const id = str(b.id, 24).toLowerCase(), name = str(b.name, 100);
      if (!ID.test(id)) no(400, "District code: 2 to 24 lowercase letters, numbers or dashes, like oxford-sd.");
      if (!name) no(400, "Type the district's name.");
      const r = await setR("district/" + id, { id, name, created: Date.now(), salt: rid(16), admins: [] }, { onlyIfNew: true });
      if (r && r.modified === false) no(409, "That district code is already used.");
      return { ok: true, id };
    },
    async ownerDistrictDelete(b) {
      const id = str(b.id, 24), d = await getR("district/" + id);
      if (!d) no(404, "That district was not found.");
      if ((await allR("school/")).some(s => s.district === id)) no(400, "Delete or move its schools first.");
      await reg.delete("district/" + id);
      return { ok: true };
    },
    async ownerDistrictAdmin(b) { // add a district admin, or reset one's code (matched by name)
      const id = str(b.district, 24), d = await getR("district/" + id), name = str(b.name, 60), code = str(b.adminCode, 12);
      if (!d) no(404, "That district was not found.");
      if (!name) no(400, "Type the district admin's name.");
      if (!/^\d{6,12}$/.test(code)) no(400, "District admin codes have 6 to 12 digits.");
      const hash = sha(d.salt + ":" + code);
      if ((d.admins || []).some(a => a.hash === hash && a.name !== name)) no(400, "Pick a different code.");
      const others = (d.admins || []).filter(a => a.name !== name);
      await setR("district/" + id, { ...d, admins: [...others, { id: "a" + rid(8), name, hash }] });
      return { ok: true };
    },
    async ownerSchoolCreate(b) {
      const id = str(b.id, 24).toLowerCase(), name = str(b.name, 100), district = str(b.district, 24);
      if (!ID.test(id)) no(400, "School code: 2 to 24 lowercase letters, numbers or dashes, like rh-bearden.");
      if (!name) no(400, "Type the school's name.");
      if (!(await getR("district/" + district))) no(404, "Pick a district first.");
      const setupKey = rid(12); // given once to the school's first admin; only its hash is kept
      const r = await setR("school/" + id, { id, name, district, created: Date.now(), setupHash: sha("setup" + setupKey) }, { onlyIfNew: true });
      if (r && r.modified === false) no(409, "That school code is already used.");
      return { ok: true, id, setupKey };
    },
    async ownerSchoolDelete(b) {
      const id = str(b.id, 24);
      if (!(await schoolRec(id))) no(404, "That school was not found.");
      if (str(b.confirm, 40) !== "DELETE " + id) no(400, `Type DELETE ${id} to confirm.`);
      const st = schoolStore(id);
      for (const k of ((await st.list()).blobs || []).map(x => x.key)) await st.delete(k);
      for (const k of await listR("join/")) { const j = await getR(k); if (j && j.d === id) await reg.delete(k) }
      for (const k of await listR("host/")) { const h = await getR(k); if (h && h.d === id) await reg.delete(k) }
      await reg.delete("school/" + id);
      return { ok: true };
    },
    async ownerResearchAll(b, ip) {
      const salt = rid(16), schools = [];
      for (const s of await allR("school/")) {
        const res = await apiFor(s.id)(new Request("http://x/api/ownerResearch", { method: "POST", body: JSON.stringify({ code: b.code }) }), ip);
        if (!res.ok) continue; // a school that is not set up yet
        const data = await res.json();
        schools.push({ id: "s" + sha(salt + s.id).slice(0, 10), district: "d" + sha(salt + "d" + s.district).slice(0, 10), made: data.made, classes: data.classes });
      }
      return { made: schools[0]?.made || null, note: "De-identified across all schools: random IDs per export for districts, schools, classes and students.", schools };
    },
  };

  /* ---------- district admins: see every school in their own district ---------- */
  const DISTRICT = {
    async districtLogin(b, ip) {
      const d = await getR("district/" + str(b.districtCode, 24).toLowerCase());
      const L = await locked("da", ip);
      const hash = d ? sha(d.salt + ":" + str(b.code, 12)) : "";
      const a = d && (d.admins || []).find(x => x.hash === hash);
      if (!a) { await L.miss(); no(401, "That district code or admin code did not match.") }
      await L.clear();
      return { token: await signR({ r: "da", g: d.id, id: a.id }), name: a.name, district: { id: d.id, name: d.name } };
    },
    async districtOverview(b) {
      const p = await verifyR(b.token);
      if (!p || p.r !== "da") no(401, "Please sign in again.");
      const d = await getR("district/" + p.g);
      if (!d || !(d.admins || []).some(a => a.id === p.id)) no(401, "Please sign in again.");
      const since = Date.now() - 7 * 864e5, sinceDay = new Date(since).toISOString().slice(0, 10), schools = [];
      for (const rec of (await allR("school/")).filter(s => s.district === d.id)) {
        const st = schoolStore(rec.id), school = (await st.get("school", { type: "json" })) ?? null;
        if (!school) { schools.push({ id: rec.id, name: rec.name, ready: false, classes: [] }); continue }
        const classes = [];
        for (const c of school.classes) {
          const roster = ((await st.get("roster/" + c.id, { type: "json" })) ?? { students: [] }).students.filter(x => !x.sample);
          let active = 0, n = 0, ok = 0, ms = 0;
          for (const s of roster) {
            const all = (await st.get(`prog/${c.id}/${s.id}`, { type: "json" })) ?? {};
            let act = false;
            for (const [tid, pr] of Object.entries(all)) { if (tid[0] === "_" || !pr || !pr.days) continue;
              for (const [day, x] of Object.entries(pr.days)) { if (day < sinceDay) continue; for (const v of Object.values(x || {})) { if (v && v.n) { act = true; n += v.n; ok += v.ok || 0; ms += v.ms || 0 } } } }
            if (act) active++;
          }
          classes.push({ name: c.name, teacher: school.teachers.find(t => t.id === c.teacherId)?.name || "", students: roster.length, active, answers: n, accuracy: n ? Math.round(ok / n * 100) : null, minutes: Math.round(ms / 60000) });
        }
        schools.push({ id: rec.id, name: school.name || rec.name, ready: true, teachers: school.teachers.length, classes });
      }
      return { district: { id: d.id, name: d.name }, since: sinceDay, schools };
    },
  };

  /* ---------- which school does this request belong to? ---------- */
  async function resolve(action, body, req) {
    if (body.token) return tokenTenant(body.token); // a token always decides (and is then verified by that school)
    if (body.join) { const j = await getR("join/" + str(body.join, 10).toUpperCase()); return j ? j.d : null }
    if (body.school) return str(body.school, 24).toLowerCase();
    const host = (req.headers.get("host") || "").toLowerCase().split(":")[0], h = host && (await getR("host/" + host));
    if (h) return h.d;
    if (HOME_ACTIONS.has(action) && env.HOME_SCHOOL) return env.HOME_SCHOOL;
    return null;
  }

  async function handle(req, ip) {
    if (req.method !== "POST") return J(405, { error: "Use POST." });
    const action = new URL(req.url).pathname.replace(/^\/api\/?/, "").replace(/\/$/, "");
    let body = {};
    try { body = await req.clone().json() } catch { body = {} }
    try {
      if (OWNER_ACTIONS.has(action)) { await ownerCheck(body, ip); return J(200, await OWNER[action](body, ip)) }
      if (DISTRICT_ACTIONS.has(action)) return J(200, await DISTRICT[action](body, ip));
      const id = await resolve(action, body, req), rec = id && await schoolRec(id);
      if (!rec) {
        if (body.token) no(401, "Please sign in again.");
        if (body.join) no(404, "That class code was not found.");
        return J(400, { error: id ? "That school code was not found." : "Type your school code first.", needSchool: true, multi: true });
      }
      if (action === "setup") { // a new school's first admin needs the one-time setup key from the platform owner
        const key = str(body.setupKey, 40);
        if (!rec.setupHash || !key || !crypto.timingSafeEqual(Buffer.from(sha("setup" + key)), Buffer.from(rec.setupHash))) no(403, "Ask Path to Proficiency for your school's setup key.");
        const res = await apiFor(id)(req, ip);
        if (res.ok) { const { setupHash, ...rest } = rec; await setR("school/" + id, { ...rest, setupAt: Date.now() }) } // the key works once
        return res;
      }
      const res = await apiFor(id)(req, ip);
      if (action === "status" && res.ok) { const d = await res.json(), dist = await getR("district/" + rec.district); return J(200, { ...d, multi: true, school: { id, name: rec.name }, district: dist ? dist.name : "", needsKey: !!rec.setupHash }) }
      return res;
    } catch (e) {
      if (e instanceof Fail) return J(e.status, { error: e.message });
      console.error(e); return J(500, { error: "Something went wrong on the server. Try again." });
    }
  }

  async function snapshots() {
    const keys = [];
    for (const s of await allR("school/")) {
      if ((await schoolStore(s.id).get("school", { type: "json" })) == null) continue;
      keys.push(s.id + ": " + await apiFor(s.id).snapshot());
    }
    return keys;
  }
  return { multi, handle, snapshots };
}
