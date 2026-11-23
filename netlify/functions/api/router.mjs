import { verifyGoogle, DEFAULT_GOOGLE_CLIENT_ID } from "./google.mjs";
import { verifyClever, cleverTicket, cleverConfig, cleverOn } from "./clever.mjs";
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
const OWNER_ACTIONS = new Set(["ownerDistricts", "ownerDistrictCreate", "ownerDistrictDelete", "ownerDistrictAdmin", "ownerSchoolCreate", "ownerSchoolDelete", "ownerResearchAll", "ownerInsightsAll", "ownerLogAll", "ownerSchoolMove", "ownerDistrictRename"]);
const DISTRICT_ACTIONS = new Set(["districtLogin", "districtOverview"]);

export const schoolStoreName = id => "ptp-d-" + id;
class Fail extends Error { constructor(status, msg) { super(msg); this.status = status } }
const no = (status, msg) => { throw new Fail(status, msg) };

/* Read the school a token claims WITHOUT trusting it: that school's own API then checks the signature with its secret. */
export function tokenTenant(token) {
  if (typeof token !== "string" || !token.includes(".")) return null;
  try { const p = JSON.parse(Buffer.from(token.split(".")[0], "base64url").toString()); return typeof p.d === "string" && ID.test(p.d) ? p.d : null } catch { return null }
}

export function makeRouter({ getStore, env, googleVerify = null, cleverVerify = null }) {
  const multi = env.MULTI_DISTRICT === "on";
  const VER = { ...(googleVerify ? { googleVerify } : {}), ...(cleverVerify ? { cleverVerify } : {}) };
  const single = () => makeApi({ store: getStore("p2p"), env, ...VER });

  let _reg = null; // opened only when needed, so a single-school site never touches the registry
  const R = () => (_reg ||= getStore("ptp-registry"));
  const getR = async k => (await R().get(k, { type: "json" })) ?? null;
  const setR = (k, v, o) => R().setJSON(k, v, o);
  const listR = async prefix => ((await R().list({ prefix })).blobs || []).map(b => b.key);
  const allR = async prefix => { const out = []; for (const k of await listR(prefix)) { const v = await getR(k); if (v) out.push(v) } return out };
  const schoolRec = async id => (ID.test(id || "") ? await getR("school/" + id) : null);
  const schoolStore = id => getStore(schoolStoreName(id));

  const hooksFor = id => ({
    claimJoin: async code => { // a class code belongs to exactly one school, across every district
      const k = "join/" + code, r = await setR(k, { d: id, at: Date.now() }, { onlyIfNew: true });
      if (r && r.modified === false) { const cur = await getR(k); return !!cur && cur.d === id }
      return true;
    },
    releaseJoin: async code => { const cur = await getR("join/" + code); if (cur && cur.d === id) await R().delete("join/" + code) },
    /* a Google account signs in to exactly one teacher in one school; the registry keeps only a hash of Google's id */
    claimGoogle: async (sub, tid) => {
      const k = "gsub/" + sha("g" + sub).slice(0, 40), r = await setR(k, { d: id, t: tid, at: Date.now() }, { onlyIfNew: true });
      if (r && r.modified === false) { const cur = await getR(k); if (!cur || cur.d !== id || cur.t !== tid) return false; }
      return true;
    },
    releaseGoogle: async sub => { const k = "gsub/" + sha("g" + sub).slice(0, 40), cur = await getR(k); if (cur && cur.d === id) await R().delete(k) },
    /* a Clever account signs in to one teacher, or one student, in one school; only a hash of Clever's id is kept */
    claimClever: async (sub, who) => {
      const k = "csub/" + sha("c" + sub).slice(0, 40), cur = await getR(k);
      if (cur && cur.d !== id) return false;
      await setR(k, { d: id, ...who, at: Date.now() }); return true;
    },
    releaseClever: async sub => { const k = "csub/" + sha("c" + sub).slice(0, 40), cur = await getR(k); if (cur && cur.d === id) await R().delete(k) },
  });
  const apiFor = (id, extra = {}) => makeApi({ store: schoolStore(id), env, tenant: id, hooks: { ...hooksFor(id), ...extra }, ...VER });

  /* ---------- lockouts and tokens for the registry-level sign-ins ---------- */
  async function locked(scope, ip) {
    const k = `fail/${scope}-` + sha(scope + ip).slice(0, 24), f = (await getR(k)) || { n: 0, at: 0 };
    if (f.n >= 8 && Date.now() - f.at < 15 * 60 * 1000) no(429, "Too many tries. Wait 15 minutes.");
    return { miss: () => setR(k, { n: f.n + 1, at: Date.now() }), clear: () => f.n ? R().delete(k) : null };
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

  /* platform-level activity log (owner and district admin actions); no student data */
  const ym = () => new Date().toISOString().slice(0, 7);
  async function logR(who, what, detail = "") {
    for (let i = 0; i < 5; i++) {
      const k = "log/" + ym(), r = await R().getWithMetadata(k, { type: "json" }).catch(() => null), l = (r && r.data) || [];
      l.push({ t: Date.now(), who: str(who, 60), what, detail: str(detail, 200) });
      const w = await R().setJSON(k, l.slice(-3000), r && r.etag ? { onlyIfMatch: r.etag } : { onlyIfNew: true }).catch(() => null);
      if (w && w.modified !== false) return;
    }
  }
  const LOG_TEXT = { ownerDistrictCreate: b => ["District added", str(b.name, 100) + " (" + str(b.id, 24) + ")"], ownerDistrictDelete: b => ["District deleted", str(b.id, 24)], ownerDistrictAdmin: b => ["District admin saved", str(b.name, 60) + " in " + str(b.district, 24)], ownerSchoolCreate: b => ["School added", str(b.name, 100) + " (" + str(b.id, 24) + ")"], ownerSchoolDelete: b => ["School deleted", str(b.id, 24)], ownerResearchAll: () => ["Research export downloaded", "all schools, names removed"], ownerSchoolMove: b => ["School moved to another district", str(b.id, 24) + " → " + str(b.district, 24)], ownerDistrictRename: b => ["District renamed", str(b.id, 24) + " → " + str(b.name, 100)] };

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
      await R().delete("district/" + id);
      return { ok: true };
    },
    async ownerDistrictRename(b) {
      const id = str(b.id, 24), name = str(b.name, 100), d = await getR("district/" + id);
      if (!d) no(404, "That district was not found.");
      if (!name) no(400, "Type the district's name.");
      await setR("district/" + id, { ...d, name });
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
    async ownerSchoolMove(b) { // put a school in a different district; its teachers, students and data don't change
      const id = str(b.id, 24), to = str(b.district, 24).toLowerCase(), rec = await schoolRec(id);
      if (!rec) no(404, "That school was not found.");
      if (!(await getR("district/" + to))) no(404, "That district was not found. Add it first.");
      if (rec.district === to) return { ok: true };
      await setR("school/" + id, { ...rec, district: to });
      return { ok: true, from: rec.district };
    },
    async ownerSchoolDelete(b) {
      const id = str(b.id, 24);
      if (!(await schoolRec(id))) no(404, "That school was not found.");
      if (str(b.confirm, 40) !== "DELETE " + id) no(400, `Type DELETE ${id} to confirm.`);
      const st = schoolStore(id);
      for (const k of ((await st.list()).blobs || []).map(x => x.key)) await st.delete(k);
      for (const k of await listR("join/")) { const j = await getR(k); if (j && j.d === id) await R().delete(k) }
      for (const k of await listR("host/")) { const h = await getR(k); if (h && h.d === id) await R().delete(k) }
      for (const k of await listR("gsub/")) { const g = await getR(k); if (g && g.d === id) await R().delete(k) }
      for (const k of await listR("csub/")) { const g = await getR(k); if (g && g.d === id) await R().delete(k) }
      await R().delete("school/" + id);
      return { ok: true };
    },
    async ownerLogAll(b, ip) { // the platform log plus every school's own log, newest first
      const out = [];
      for (const k of (await listR("log/")).sort().slice(-3)) out.push(...(((await getR(k)) || []).map(x => ({ ...x, where: "Platform" }))));
      for (const s of await allR("school/")) {
        const res = await apiFor(s.id)(new Request("http://x/api/ownerLog", { method: "POST", body: JSON.stringify({ code: b.code }) }), ip);
        if (res.ok) out.push(...(await res.json()).log.map(x => ({ ...x, where: s.name })));
      }
      return { log: out.sort((a, b) => b.t - a.t).slice(0, 800) };
    },
    async ownerInsightsAll(b, ip) { // every school's usage, grouped by district, plus totals: for renewals and selling
      const districts = await allR("district/"), schools = [];
      for (const s of await allR("school/")) {
        const res = await apiFor(s.id)(new Request("http://x/api/ownerInsights", { method: "POST", body: JSON.stringify({ code: b.code }) }), ip);
        if (!res.ok) { schools.push({ id: s.id, name: s.name, district: s.district, ready: false }); continue }
        schools.push({ id: s.id, district: s.district, ready: true, ...(await res.json()) });
      }
      const sum = k => schools.reduce((t, s) => t + (s.totals?.[k] || 0), 0), ans30 = sum("answers30");
      return { made: Date.now(), districts: districts.map(d => ({ id: d.id, name: d.name })), schools,
        totals: { schools: schools.filter(s => s.ready).length, students: sum("students"), active7: sum("active7"), active30: sum("active30"), answers: sum("answers"), answers30: ans30, accuracy30: ans30 ? Math.round(sum("correct30") / ans30 * 100) : null, minutes: sum("minutes"), minutes30: sum("minutes30"), mastered: sum("mastered"), mastered30: sum("mastered30"), scout: sum("scout"), stuck: sum("stuck"), selfSolved: sum("selfSolved") },
        waiting: (await allR("school/")).filter(s => s.setupHash).map(s => ({ id: s.id, name: s.name, created: s.created })) };
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
      await logR(a.name + " (district admin)", "District admin signed in", d.name);
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

  /* ---------- moving today's one-school site into its own school store (stage 4) ----------
     The old "p2p" store is only ever READ here, so turning MULTI_DISTRICT back off is always a full undo.
     Before the switch (MULTI_DISTRICT off) the old store is the live one: the move can run as many times as needed
     and each run makes the new store an exact copy again. After the switch the new store is live, so the move
     only reports (dry run) or fills a still-empty school. */
  const SKIP = /^fail\//; // sign-in lockout counters stay behind
  async function storeFacts(st) {
    const keys = ((await st.list()).blobs || []).map(b => b.key).filter(k => !SKIP.test(k)).sort();
    const school = (await st.get("school", { type: "json" })) ?? null;
    let students = 0;
    for (const k of keys.filter(k => k.startsWith("roster/"))) students += (((await st.get(k, { type: "json" })) ?? {}).students || []).filter(x => !x.sample).length;
    return { keys, school, facts: { keys: keys.length, teachers: school ? school.teachers.length : 0, classes: school ? school.classes.length : 0, students, joinCodes: school ? school.classes.filter(c => c.join).length : 0 } };
  }
  async function compare(srcSt, dstSt, src, dst) {
    const a = new Set(src), b = new Set(dst), diff = [];
    for (const k of src) {
      if (!b.has(k)) { diff.push("missing " + k); continue }
      const x = JSON.stringify((await srcSt.get(k, { type: "json" })) ?? null), y = JSON.stringify((await dstSt.get(k, { type: "json" })) ?? null);
      if (x !== y) diff.push("different " + k);
    }
    for (const k of dst) if (!a.has(k)) diff.push("extra " + k);
    return diff;
  }
  async function ownerMove(b) {
    const dId = str(b.districtId, 24).toLowerCase(), dName = str(b.districtName, 100), sId = str(b.schoolId, 24).toLowerCase(), sName = str(b.schoolName, 100), dry = b.dryRun !== false;
    if (!ID.test(dId) || !ID.test(sId)) no(400, "District and school codes: 2 to 24 lowercase letters, numbers or dashes.");
    const src = getStore("p2p"), S0 = await storeFacts(src);
    if (!S0.school) no(400, "There is no school on this site to move yet.");
    const dist = await getR("district/" + dId), rec = await getR("school/" + sId);
    if (!dist && !dName) no(400, "Type the district's name (it will be added).");
    if (rec && !rec.movedFrom) no(409, "That school code is already used by a different school. Pick another code.");
    if (rec && rec.district !== dId) no(409, `That school is already in the district ${rec.district}.`);
    const dst = schoolStore(sId);
    const D0 = await storeFacts(dst);
    const joinConflicts = [];
    for (const c of S0.school.classes) if (c.join) { const j = await getR("join/" + c.join); if (j && j.d !== sId) joinConflicts.push(c.join) }
    const report = { dryRun: dry, live: multi ? "new school store" : "old one-school store", district: { id: dId, name: dist ? dist.name : dName, isNew: !dist }, school: { id: sId, name: sName || rec?.name || S0.school.name }, from: S0.facts, to: D0.facts, joinConflicts };
    if (dry) { report.differences = await compare(src, dst, S0.keys, D0.keys); report.same = report.differences.length === 0; report.differences = report.differences.slice(0, 20); return report }
    if (joinConflicts.length) no(409, "Some class codes already belong to another school: " + joinConflicts.join(", "));
    if (multi && D0.school) no(409, "The site is already switched and this school is live. Only a dry run is allowed now, so nobody's new work is overwritten.");
    if (!dist) await setR("district/" + dId, { id: dId, name: dName, created: Date.now(), salt: rid(16), admins: [] }, { onlyIfNew: true });
    await setR("school/" + sId, { id: sId, name: report.school.name, district: dId, created: rec?.created || Date.now(), movedFrom: "p2p", movedAt: Date.now() });
    let copied = 0, removed = 0;
    for (const k of S0.keys) {
      const v = (await src.get(k, { type: "json" })) ?? null; if (v === null) continue;
      if (JSON.stringify((await dst.get(k, { type: "json" })) ?? null) !== JSON.stringify(v)) { await dst.setJSON(k, v); copied++ }
    }
    const keep = new Set(S0.keys);
    for (const k of D0.keys) if (!keep.has(k)) { await dst.delete(k); removed++ }
    for (const c of S0.school.classes) if (c.join) await setR("join/" + c.join, { d: sId, at: Date.now() });
    const D1 = await storeFacts(dst), differences = await compare(src, dst, S0.keys, D1.keys);
    await logR("Site owner", "School copied for the district switch", `${sId}: ${D1.facts.students} students, ${differences.length ? differences.length + " differences" : "exact match"}`);
    return { ...report, copied, removed, to: D1.facts, same: differences.length === 0 && JSON.stringify(D1.facts) === JSON.stringify(S0.facts), differences: differences.slice(0, 20) };
  }

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
      if (action === "ownerMove") { await ownerCheck(body, ip); return J(200, await ownerMove(body)) }
      if (action === "cleverConfig") return J(200, cleverConfig(env));
      if (!multi) return single()(req, ip);
      if (OWNER_ACTIONS.has(action)) { await ownerCheck(body, ip); const out = await OWNER[action](body, ip); if (LOG_TEXT[action]) await logR("Site owner", ...LOG_TEXT[action](body)); return J(200, out) }
      if (DISTRICT_ACTIONS.has(action)) return J(200, await DISTRICT[action](body, ip));
      if (action === "googleLogin") { // Google decides the school: find which teacher this Google account is connected to
        const p = await (googleVerify || verifyGoogle)(str(body.credential, 4000), env.GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID);
        if (!p) no(401, "Google sign-in didn’t work. Please try again.");
        const g = await getR("gsub/" + sha("g" + p.sub).slice(0, 40));
        if (!g || !(await schoolRec(g.d))) no(404, "That Google account isn’t connected to a teacher yet. Sign in with your school code and teacher code once, then choose Connect Google in My account.");
        return await apiFor(g.d, { preGoogle: p })(req, ip);
      }
      if (action === "cleverLogin") { // Clever decides the school: find which teacher or student this Clever account is connected to
        if (!cleverOn(env)) no(400, "Clever isn’t turned on yet.");
        const p = await (cleverVerify || verifyClever)(str(body.code, 200), env);
        if (!p) no(401, "Clever sign-in didn’t work. Please try again.");
        if (p.type !== "teacher" && p.type !== "student") no(403, "Path to Proficiency works with Clever student and teacher accounts.");
        const g = await getR("csub/" + sha("c" + p.sub).slice(0, 40));
        if (g && (await schoolRec(g.d))) return await apiFor(g.d, { preClever: p, cleverHit: g })(req, ip);
        return J(200, { needLink: true, kind: p.type, name: p.name || "", ticket: cleverTicket(p, env) });
      }
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
    if (!multi) return [await single().snapshot()];
    const keys = [];
    for (const s of await allR("school/")) {
      if ((await schoolStore(s.id).get("school", { type: "json" })) == null) continue;
      keys.push(s.id + ": " + await apiFor(s.id).snapshot());
    }
    return keys;
  }
  return { multi, handle, snapshots };
}
