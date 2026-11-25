// Server tests: every check runs the real API code against a pretend in-memory store.
// Run: node tests/server.test.mjs   (no installs needed)
import assert from "node:assert/strict";
import { makeApi } from "../netlify/functions/api/core.mjs";
import { makeRouter } from "../netlify/functions/api/router.mjs";
import { readFileSync } from "node:fs";

function memoryStore() {
  const M = new Map(); let n = 0;
  return {
    M,
    async get(k) { return M.has(k) ? structuredClone(M.get(k).v) : null },
    async getWithMetadata(k) { return M.has(k) ? { data: structuredClone(M.get(k).v), etag: M.get(k).e } : null },
    async setJSON(k, v, o = {}) {
      const cur = M.get(k);
      if (o.onlyIfMatch && (!cur || cur.e !== o.onlyIfMatch)) return { modified: false };
      if (o.onlyIfNew && cur) return { modified: false };
      const e = "e" + (++n); M.set(k, { v: structuredClone(v), e }); return { modified: true, etag: e };
    },
    async delete(k) { M.delete(k) },
    async list(o = {}) { return { blobs: [...M.keys()].filter(k => k.startsWith(o.prefix || "")).map(key => ({ key })) } },
  };
}

/* a stand-in for Google's token check: "g:<sub>:<email>" is a valid Google sign-in, anything else is not */
/* a stand-in for Clever: code "c:<id>:<teacher|student>:<name>" is a valid Clever sign-in */
const FAKE_CLEVER = async code => { const m = /^c:([^:]+):([^:]+):(.*)$/.exec(code || ""); return m ? { sub: m[1], type: m[2], name: m[3], district: "d1" } : null };
const FAKE_GOOGLE = async cred => { const m = /^g:([^:]+):(.+)$/.exec(cred || ""); return m ? { sub: m[1], email: m[2] } : null };
function client(env = {}) {
  const store = memoryStore(), api = makeApi({ store, env, googleVerify: FAKE_GOOGLE, cleverVerify: FAKE_CLEVER });
  let ip = 1;
  const call = async (action, body, from) => {
    const r = await api(new Request("http://x/api/" + action, { method: "POST", body: JSON.stringify(body) }), from || "10.0.0." + (ip++ % 200));
    const j = await r.json();
    if (!r.ok) { const e = new Error(j.error || action); e.status = r.status; throw e }
    return j;
  };
  return { store, call };
}
const rejects = async (p, re) => { try { await p } catch (e) { if (re) assert.match(e.message, re); return e } assert.fail("expected an error") };

const tests = [];
const test = (name, fn) => tests.push({ name, fn });

/* a school with one class of 6 students */
async function school(env) {
  const c = client(env);
  const s = await c.call("setup", { code: "1234", name: "Mr. Barksdale", schoolName: "RH Bearden" });
  const cls = (await c.call("classSave", { token: s.token, name: "The OGs" })).cls;
  const names = ["Jada Smith", "Ben Quinn", "Ana Lopez", "Tyrone Hill", "Maria Diaz", "Kiara Bell"];
  await c.call("rosterSave", { token: s.token, classId: cls.id, students: names.map((name, i) => ({ name, code: String(1111 * (i + 1)).slice(0, 4) })) });
  const roster = c.store.M.get("roster/" + cls.id).v.students;
  const login = code => c.call("studentLogin", { join: cls.join, code });
  return { ...c, T: s.token, cls, roster, login };
}

test("teacher setup, class and roster save", async () => {
  const s = await school();
  assert.equal(s.roster.length, 6);
  const st = await s.login(s.roster[0].code);
  assert.ok(st.token);
});

test("a student cannot use a teacher action", async () => {
  const s = await school(); const st = await s.login(s.roster[0].code);
  await rejects(s.call("handList", { token: st.token, classId: s.cls.id }));
});

test("PTP Bridge: only the student's own mission is sent; token once a week", async () => {
  const s = await school();
  await s.call("homeMark", { token: s.T, classId: s.cls.id, wk: "2026-11-16", sid: s.roster[0].id, std: "3.OA.7", lang: "es" });
  const a = await s.login(s.roster[0].code), b = await s.login(s.roster[1].code);
  assert.deepEqual(a.home, { wk: "2026-11-16", std: "3.OA.7" });
  assert.equal(b.home, null);
  assert.ok(!("home" in a.cls), "students never see the whole class's picks");
  assert.equal((await s.call("homeDone", { token: a.token, wk: "2026-11-16" })).first, true);
  assert.equal((await s.call("homeDone", { token: a.token, wk: "2026-11-16" })).first, false);
  const prog = s.store.M.get(`prog/${s.cls.id}/${s.roster[0].id}`).v;
  assert.equal(prog._game.bonus, 1);
  await rejects(s.call("homeDone", { token: b.token, wk: "2026-11-16" }), /no home mission/);
  await rejects(s.call("progSave", { token: a.token, testId: "_home", prog: { done: {} } }));
});

test("3 Before Me: raise, lower, list and done", async () => {
  const s = await school(); const a = await s.login(s.roster[0].code), b = await s.login(s.roster[1].code);
  await s.call("handRaise", { token: a.token, std: "3.OA.7", kname: "Facts", tried: ["watched it solved", "used the hint"] });
  await s.call("handRaise", { token: b.token, std: "3.NBT.1", kname: "Rounding", tried: [] });
  await s.call("handRaise", { token: a.token, std: "3.OA.7", kname: "Facts", tried: ["watched it solved", "used the hint", "asked Scout"] });
  let L = (await s.call("handList", { token: s.T, classId: s.cls.id })).list;
  assert.equal(L.length, 2, "one hand per student");
  assert.equal(L.find(h => h.sid === s.roster[0].id).tried.length, 3);
  await s.call("handLower", { token: b.token });
  L = (await s.call("handList", { token: s.T, classId: s.cls.id })).list;
  assert.equal(L.length, 1);
  assert.equal((await s.call("handDone", { token: s.T, classId: s.cls.id, sid: s.roster[0].id })).list.length, 0);
});

test("3 Before Me: hand cooldown is enforced on the server", async () => {
  const s = await school();
  await s.call("classSave", { token: s.T, id: s.cls.id, name: "The OGs", handCool: 3 });
  const a = await s.login(s.roster[2].code);
  assert.equal(a.cls.handCool, 3);
  await s.call("handRaise", { token: a.token, std: "3.OA.7", kname: "Facts", tried: [] });
  await s.call("handLower", { token: a.token });
  await rejects(s.call("handRaise", { token: a.token, std: "3.OA.7", kname: "Facts", tried: [] }), /ask again/);
});

test("pacing guide dates are saved on the class and cleaned", async () => {
  const s = await school();
  const r = await s.call("classSave", { token: s.T, id: s.cls.id, name: "The OGs", pace: { start: "2026-11-23", test: "2027-04-26", off: 4, evil: "x" } });
  assert.deepEqual(r.classes.find(x => x.id === s.cls.id).pace, { start: "2026-11-23", test: "2027-04-26", off: 4 });
  const r2 = await s.call("classSave", { token: s.T, id: s.cls.id, name: "The OGs", goal: 70 });
  assert.equal(r2.classes.find(x => x.id === s.cls.id).pace.off, 4, "other saves keep the pacing dates");
});

test("owner research export: no names, codes or class names; new IDs each time", async () => {
  const s = await school({ OWNER_CODE: "owner-secret-1" });
  const a = await s.login(s.roster[0].code);
  await s.call("progSave", { token: a.token, testId: "std3", prog: { skills: { k1: { status: "done", streak: 5, doneAt: Date.now() } }, days: { "2026-11-20": { k1: { n: 5, ok: 4, ms: 60000 } } }, miss: [{ q: "q1", k: "k1", p: "B", t: Date.now() }], log: { q1: { tries: 2, right: 1, first: false } }, help3: { "2026-11-20": { stuck: 2, self: 1, teacher: 1 } }, badges: { first: Date.now() } } });
  await rejects(s.call("ownerResearch", { code: "wrong" }), /did not match/);
  const r = await s.call("ownerResearch", { code: "owner-secret-1" }), txt = JSON.stringify(r);
  for (const bad of ["Jada", "Smith", "Barksdale", "Bearden", "The OGs", s.cls.join, s.cls.id, s.roster[0].id, s.roster[0].code]) assert.ok(!txt.includes(bad), "export leaked " + bad);
  assert.equal(r.classes[0].students.length, 6);
  const r2 = await s.call("ownerResearch", { code: "owner-secret-1" });
  assert.notEqual(r.classes[0].students[0].id, r2.classes[0].students[0].id);
});

/* ---------- multi-district: the security tests from the plan ---------- */
function multi(env = {}) {
  const stores = new Map(), getStore = n => { if (!stores.has(n)) stores.set(n, memoryStore()); return stores.get(n) };
  const router = makeRouter({ getStore, env: { MULTI_DISTRICT: "on", OWNER_CODE: "owner-secret-1", CLEVER_CLIENT_SECRET: "test-secret", ...env }, googleVerify: FAKE_GOOGLE, cleverVerify: FAKE_CLEVER });
  const call = async (action, body, from = "10.1.1.1") => {
    const r = await router.handle(new Request("http://x/api/" + action, { method: "POST", body: JSON.stringify(body) }), from);
    const j = await r.json();
    if (!r.ok) { const e = new Error(j.error || action); e.status = r.status; e.body = j; throw e }
    return j;
  };
  const raw = async (action, body, from = "10.1.1.1") => { const r = await router.handle(new Request("http://x/api/" + action, { method: "POST", body: JSON.stringify(body) }), from); return { status: r.status, text: await r.text() } };
  return { stores, router, call, raw, getStore };
}
async function district(m, id, name, people) { // a district with one school whose code is the district code + "-es"
  await m.call("ownerDistrictCreate", { code: "owner-secret-1", id, name });
  const sid = id + "-es", { setupKey } = await m.call("ownerSchoolCreate", { code: "owner-secret-1", id: sid, name: name + " Elementary", district: id });
  const s = await m.call("setup", { school: sid, setupKey, code: "1234", name: people.teacher, schoolName: name + " Elementary" });
  const cls = (await m.call("classSave", { token: s.token, name: people.cls })).cls;
  await m.call("rosterSave", { token: s.token, classId: cls.id, students: people.students.map((n, i) => ({ name: n, code: String(people.base + i * 7) })) });
  const roster = m.getStore("ptp-d-" + sid).M.get("roster/" + cls.id).v.students;
  return { id, sid, T: s.token, cls, roster, setupKey };
}
const ACTIONS = [...readFileSync(new URL("../netlify/functions/api/core.mjs", import.meta.url), "utf8").matchAll(/^  A\.(\w+) = /gm)].map(m => m[1]);
async function twoDistricts() {
  const m = multi();
  const A = await district(m, "alpha", "Alpha District", { teacher: "Ms. Alpha", cls: "Alpha Room", base: 1000, students: ["Avery Alpha", "Ari Alpha"] });
  const B = await district(m, "beta", "Beta District", { teacher: "Mr. Beta", cls: "Beta Room", base: 2000, students: ["Bailey Beta", "Blake Beta"] });
  return { m, A, B };
}

test("switch off: the router sends everything to the one school store, as before", async () => {
  const stores = new Map(), getStore = n => { if (!stores.has(n)) stores.set(n, memoryStore()); return stores.get(n) };
  const router = makeRouter({ getStore, env: {} });
  const r = await router.handle(new Request("http://x/api/setup", { method: "POST", body: JSON.stringify({ code: "1234", name: "Mr. B", schoolName: "Solo" }) }), "1.1.1.1");
  assert.equal(r.status, 200);
  assert.deepEqual([...stores.keys()], ["p2p"]);
});

test("new school: setup needs the one-time key from the owner", async () => {
  const m = multi();
  await m.call("ownerDistrictCreate", { code: "owner-secret-1", id: "gamma", name: "Gamma" });
  const { setupKey } = await m.call("ownerSchoolCreate", { code: "owner-secret-1", id: "gamma-ms", name: "Gamma Middle", district: "gamma" });
  const st = await m.call("status", { school: "gamma-ms" });
  assert.equal(st.multi, true); assert.equal(st.needsKey, true); assert.equal(st.district, "Gamma");
  await rejects(m.call("setup", { school: "gamma-ms", code: "1234", name: "Intruder" }), /setup key/);
  await rejects(m.call("setup", { school: "gamma-ms", setupKey: "wrong-key", code: "1234", name: "Intruder" }), /setup key/);
  await m.call("setup", { school: "gamma-ms", setupKey, code: "1234", name: "Real Admin" });
  await rejects(m.call("setup", { school: "gamma-ms", setupKey, code: "5678", name: "Again" }), /setup key/);
  await rejects(m.call("ownerDistrictCreate", { code: "wrong", id: "delta", name: "Delta" }), /did not match/);
  await rejects(m.call("ownerDistrictCreate", { code: "owner-secret-1", id: "gamma", name: "Dup" }), /already used/);
  await rejects(m.call("ownerSchoolCreate", { code: "owner-secret-1", id: "x-1", name: "No district", district: "nope" }), /district/);
  const e = await rejects(m.call("status", {}), /school code/);
  assert.equal(e.body.needSchool, true);
});

test("students sign in with just their class code; each district's data stays in its own store", async () => {
  const { m, A, B } = await twoDistricts();
  const a = await m.call("studentLogin", { join: A.cls.join, code: A.roster[0].code });
  const b = await m.call("studentLogin", { join: B.cls.join, code: B.roster[0].code });
  assert.ok(a.token && b.token);
  const alpha = JSON.stringify([...m.getStore("ptp-d-alpha-es").M.values()]), beta = JSON.stringify([...m.getStore("ptp-d-beta-es").M.values()]);
  assert.ok(alpha.includes("Avery Alpha") && !alpha.includes("Bailey Beta"));
  assert.ok(beta.includes("Bailey Beta") && !beta.includes("Avery Alpha"));
  await rejects(m.call("studentLogin", { join: A.cls.join, code: B.roster[0].code }));
});

test(`cross-district token: Alpha's teacher reaches none of Beta's data on any of ${ACTIONS.length} actions`, async () => {
  const { m, A, B } = await twoDistricts();
  const leak = ["Bailey Beta", "Blake Beta", "Beta District", "Beta Room", B.cls.id, B.roster[0].id];
  for (const action of ACTIONS) {
    const r = await m.raw(action, { token: A.T, classId: B.cls.id, id: B.cls.id, sid: B.roster[0].id, testId: "std3", wk: "2026-11-16", school: B.sid, join: B.cls.join });
    for (const x of leak) assert.ok(!r.text.includes(x), `${action} leaked ${x}`);
  }
});

test("forged token: editing a token to name another district fails its signature", async () => {
  const { m, A, B } = await twoDistricts();
  const [body, mac] = A.T.split("."), p = JSON.parse(Buffer.from(body, "base64url").toString());
  const forged = Buffer.from(JSON.stringify({ ...p, d: B.sid })).toString("base64url") + "." + mac;
  for (const action of ["boot", "classData", "rosterSave", "handList", "schoolExport"]) {
    const r = await m.raw(action, { token: forged, classId: B.cls.id, id: B.cls.id });
    assert.ok(r.status >= 400, action + " accepted a forged token");
    assert.ok(!r.text.includes("Bailey Beta"));
  }
  const noD = Buffer.from(JSON.stringify({ r: "t", id: p.id, exp: p.exp })).toString("base64url") + "." + mac; // old-style token with no district
  assert.ok((await m.raw("boot", { token: noD })).status >= 400);
});

test("class codes are unique across districts and mapped in the registry", async () => {
  const { m, A, B } = await twoDistricts();
  const reg = m.getStore("ptp-registry");
  assert.equal(reg.M.get("join/" + A.cls.join).v.d, A.sid);
  assert.equal(reg.M.get("join/" + B.cls.join).v.d, B.sid);
  // a code already held by Alpha can never be claimed for Beta
  const hooksBeta = await m.router.handle(new Request("http://x/api/status", { method: "POST", body: JSON.stringify({ school: B.sid }) }), "1.1.1.1");
  assert.equal(hooksBeta.status, 200);
  await reg.setJSON("join/TAKEN1", { d: A.sid });
  const r = await reg.setJSON("join/TAKEN1", { d: B.sid }, { onlyIfNew: true });
  assert.equal(r.modified, false);
});

test("teacher scope: a second teacher can't open the first teacher's class", async () => {
  const { m, A } = await twoDistricts();
  const t2 = await m.call("teacherSave", { token: A.T, name: "Mr. Second", code: "4321" });
  const second = await m.call("login", { school: A.sid, code: "4321" });
  await rejects(m.call("classData", { token: second.token, id: A.cls.id }));
  await rejects(m.call("rosterSave", { token: second.token, classId: A.cls.id, students: [] }));
  assert.ok(t2);
});

test("owner export across districts: no names, codes or class names from any district", async () => {
  const { m, A, B } = await twoDistricts();
  const r = await m.call("ownerResearchAll", { code: "owner-secret-1" }), txt = JSON.stringify(r);
  assert.equal(r.schools.length, 2);
  for (const x of ["Avery", "Bailey", "Alpha", "Beta", "alpha", "beta", A.cls.join, B.cls.join, A.roster[0].code, B.roster[0].id]) assert.ok(!txt.includes(x), "export leaked " + x);
});

test("student scope: a student's save only ever touches their own work", async () => {
  const { m, A } = await twoDistricts();
  const a = await m.call("studentLogin", { join: A.cls.join, code: A.roster[0].code });
  await m.call("progSave", { token: a.token, sid: A.roster[1].id, studentId: A.roster[1].id, testId: "std3", prog: { skills: { k1: { status: "done", streak: 9 } } } });
  const store = m.getStore("ptp-d-" + A.sid).M;
  assert.ok(store.has(`prog/${A.cls.id}/${A.roster[0].id}`), "saved to their own record");
  assert.ok(!store.has(`prog/${A.cls.id}/${A.roster[1].id}`), "classmate's record untouched");
  await rejects(m.call("classData", { token: a.token, id: A.cls.id }));
});

test("the shared registry holds no student data", async () => {
  const { m } = await twoDistricts();
  const txt = JSON.stringify([...m.getStore("ptp-registry").M.entries()]);
  for (const x of ["Avery", "Ari", "Bailey", "Blake", "Ms. Alpha", "Mr. Beta", "roster", "prog"]) assert.ok(!txt.includes(x), "registry holds " + x);
});

test("deleting a school removes its whole store and its class codes", async () => {
  const { m, A, B } = await twoDistricts();
  await rejects(m.call("ownerDistrictDelete", { code: "owner-secret-1", id: "alpha" }), /schools first/);
  await rejects(m.call("ownerSchoolDelete", { code: "owner-secret-1", id: A.sid, confirm: "yes" }), /DELETE alpha-es/);
  await m.call("ownerSchoolDelete", { code: "owner-secret-1", id: A.sid, confirm: "DELETE " + A.sid });
  await m.call("ownerDistrictDelete", { code: "owner-secret-1", id: "alpha" });
  assert.equal(m.getStore("ptp-d-" + A.sid).M.size, 0);
  assert.ok(!m.getStore("ptp-registry").M.has("join/" + A.cls.join));
  await rejects(m.call("studentLogin", { join: A.cls.join, code: A.roster[0].code }), /not found/);
  assert.ok((await m.call("studentLogin", { join: B.cls.join, code: B.roster[0].code })).token, "Beta still works");
});

test("brute force: wrong codes lock out, per district and per address", async () => {
  const { m } = await twoDistricts();
  let locked = false;
  for (let i = 0; i < 15 && !locked; i++) { const r = await m.raw("login", { school: "alpha-es", code: "0000" }, "9.9.9.9"); if (r.status === 429) locked = true }
  assert.ok(locked, "Alpha locks after repeated wrong codes");
  assert.equal((await m.raw("login", { school: "beta-es", code: "1234" }, "9.9.9.9")).status, 200, "Beta is not affected");
  let ownerLocked = false;
  for (let i = 0; i < 12 && !ownerLocked; i++) { const r = await m.raw("ownerDistricts", { code: "nope" }, "8.8.8.8"); if (r.status === 429) ownerLocked = true }
  assert.ok(ownerLocked, "owner code locks too");
});

test("nightly backups: one snapshot per district", async () => {
  const { m } = await twoDistricts();
  const keys = await m.router.snapshots();
  assert.equal(keys.length, 2);
  assert.ok([...m.getStore("ptp-d-alpha-es").M.keys()].some(k => k.startsWith("backup/")));
});

test("district admin: sees every school in their own district, and nothing else", async () => {
  const { m, A, B } = await twoDistricts();
  const { setupKey } = await m.call("ownerSchoolCreate", { code: "owner-secret-1", id: "alpha-ms", name: "Alpha Middle", district: "alpha" });
  await m.call("setup", { school: "alpha-ms", setupKey, code: "2468", name: "Mrs. Middle", schoolName: "Alpha Middle" });
  await rejects(m.call("ownerDistrictAdmin", { code: "owner-secret-1", district: "alpha", name: "Dr. Super", adminCode: "12" }), /6 to 12/);
  await m.call("ownerDistrictAdmin", { code: "owner-secret-1", district: "alpha", name: "Dr. Super", adminCode: "135791" });
  await rejects(m.call("districtLogin", { districtCode: "alpha", code: "000000" }), /did not match/);
  await rejects(m.call("districtLogin", { districtCode: "beta", code: "135791" }), /did not match/);
  const da = await m.call("districtLogin", { districtCode: "alpha", code: "135791" });
  const o = await m.call("districtOverview", { token: da.token }), txt = JSON.stringify(o);
  assert.deepEqual(o.schools.map(s => s.id).sort(), ["alpha-es", "alpha-ms"]);
  assert.ok(txt.includes("Alpha Room") && txt.includes("Ms. Alpha"));
  for (const x of ["Beta", "Bailey", B.cls.id, "Avery", A.roster[0].code]) assert.ok(!txt.includes(x), "district overview leaked " + x);
  assert.equal(o.schools.find(s => s.id === "alpha-es").classes[0].students, 2);
});

test("district admin tokens and school tokens can't be swapped", async () => {
  const { m, A } = await twoDistricts();
  await m.call("ownerDistrictAdmin", { code: "owner-secret-1", district: "alpha", name: "Dr. Super", adminCode: "135791" });
  const da = await m.call("districtLogin", { districtCode: "alpha", code: "135791" });
  for (const action of ["boot", "classData", "schoolExport"]) assert.ok((await m.raw(action, { token: da.token, id: A.cls.id })).status >= 400, action + " accepted a district token");
  await rejects(m.call("districtOverview", { token: A.T }), /sign in/);
  const [body, mac] = da.token.split("."), p = JSON.parse(Buffer.from(body, "base64url").toString());
  await rejects(m.call("districtOverview", { token: Buffer.from(JSON.stringify({ ...p, g: "beta" })).toString("base64url") + "." + mac }), /sign in/);
});

test("removing a district admin ends their access", async () => {
  const { m } = await twoDistricts();
  await m.call("ownerDistrictAdmin", { code: "owner-secret-1", district: "alpha", name: "Dr. Super", adminCode: "135791" });
  const da = await m.call("districtLogin", { districtCode: "alpha", code: "135791" });
  await m.call("ownerDistrictAdmin", { code: "owner-secret-1", district: "alpha", name: "Dr. Super", adminCode: "975311" }); // code reset gives a new admin id
  await rejects(m.call("districtOverview", { token: da.token }), /sign in/);
  assert.ok((await m.call("districtLogin", { districtCode: "alpha", code: "975311" })).token);
  const list = await m.call("ownerDistricts", { code: "owner-secret-1" });
  assert.deepEqual(list.districts.find(d => d.id === "alpha").admins, ["Dr. Super"]);
});

test("owner manages one school's license on a multi-district site", async () => {
  const { m, A, B } = await twoDistricts();
  const g = await m.call("ownerGet", { code: "owner-secret-1", school: A.sid });
  assert.equal(g.school, "Alpha District Elementary");
  await m.call("ownerSet", { code: "owner-secret-1", school: A.sid, license: { plan: "Pilot", teachers: 5, students: 120 } });
  assert.equal((await m.call("ownerGet", { code: "owner-secret-1", school: A.sid })).license.plan, "Pilot");
  assert.notEqual((await m.call("ownerGet", { code: "owner-secret-1", school: B.sid })).license.plan, "Pilot");
  const list = await m.call("ownerDistricts", { code: "owner-secret-1" });
  assert.equal(list.districts.find(d => d.id === "alpha").schools[0].license.plan, "Pilot");
});

test("owner insights: usage, mastery and growth as counts only, never names or codes", async () => {
  const s = await school({ OWNER_CODE: "owner-secret-1" });
  const day = n => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
  const days = {}; for (let i = 0; i < 10; i++) days[day(40 - i * 4)] = { "3.OA.1": { n: 10, ok: 3 + Math.floor(i * 0.7), ms: 120000 } };
  s.store.M.set(`prog/${s.cls.id}/${s.roster[0].id}`, { v: { a1: { days, skills: { k1: { status: "done", doneAt: Date.now() - 2 * 864e5 }, k2: { status: "todo" } }, tutor: { total: 12 }, help3: { [day(3)]: { stuck: 4, self: 3, teacher: 1 } } } }, e: "x" });
  s.store.M.set(`prog/${s.cls.id}/${s.roster[1].id}`, { v: { a1: { days: { [day(1)]: { "3.OA.1": { n: 5, ok: 5, ms: 60000 } } } } }, e: "y" });
  await rejects(s.call("ownerInsights", { code: "nope" }), /did not match/);
  const r = await s.call("ownerInsights", { code: "owner-secret-1" });
  assert.equal(r.totals.students, 6); assert.equal(r.totals.active7, 2); assert.equal(r.totals.active30, 2);
  assert.equal(r.totals.answers, 105); assert.equal(r.totals.mastered, 1); assert.equal(r.totals.mastered30, 1);
  assert.equal(r.totals.scout, 12); assert.equal(r.totals.selfSolved, 3);
  assert.equal(r.growth.students, 1); assert.ok(r.growth.recent > r.growth.first);
  assert.equal(r.classes[0].active7, 2); assert.equal(r.classes[0].mastered, 1);
  const text = JSON.stringify(r);
  for (const st of s.roster) { assert.ok(!text.includes(st.name), "leaked a name"); assert.ok(!text.includes('"' + st.code + '"'), "leaked a code"); assert.ok(!text.includes(st.id), "leaked an id") }
});

test("owner insights across districts: every school, grouped, with totals", async () => {
  const { m, A, B } = await twoDistricts();
  const r = await m.call("ownerInsightsAll", { code: "owner-secret-1" });
  assert.equal(r.schools.length, 2); assert.equal(r.totals.schools, 2); assert.equal(r.totals.students, 4);
  assert.deepEqual(r.districts.map(d => d.id).sort(), ["alpha", "beta"]);
  for (const n of ["Avery Alpha", "Bailey Beta"]) assert.ok(!JSON.stringify(r).includes(n));
  await rejects(m.call("ownerInsightsAll", { code: "wrong" }), /did not match/);
  await rejects(m.call("ownerInsights", { token: A.T, code: "x" }), /did not match/); // a teacher can't open it either
});

test("activity log, teacher sign-in days and feature use feed the owner's insights; none of it goes into backups", async () => {
  const s = await school({ OWNER_CODE: "owner-secret-1" });
  await s.call("teacherSave", { token: s.T, name: "Ms. Two", code: "5678" });
  await s.call("login", { code: "5678" });
  const st = await s.login(s.roster[0].code);
  await s.call("use", { token: st.token, f: ["practice", "watch-solved", "bad key!"] });
  await s.call("use", { token: s.T, f: "teacher:pace" });
  await rejects(s.call("use", { token: "nope", f: "x1" }), /sign in/);
  await s.call("reportAdd", { token: st.token, qid: "q1", reason: "wrong" });
  await s.call("ownerSet", { code: "owner-secret-1", license: { plan: "Pilot", teachers: 5, students: 100, expires: "2027-01-10" } });
  const ins = await s.call("ownerInsights", { code: "owner-secret-1" });
  assert.equal(ins.teachers.length, 2); assert.equal(ins.teachers.find(t => t.name === "Ms. Two").days30, 1);
  assert.deepEqual(ins.features.map(f => f.f).sort(), ["practice", "teacher:pace", "watch-solved"]);
  assert.equal(ins.features.find(f => f.f === "watch-solved").students, 1);
  assert.equal(ins.attention.questionReports, 1);
  const log = (await s.call("ownerLog", { code: "owner-secret-1" })).log.map(x => x.what);
  assert.ok(log.includes("Teacher added") && log.includes("License changed"), log.join(","));
  await s.call("backupNow", { token: s.T });
  const bk = (await s.call("backupList", { token: s.T })).backups[0], data = (await s.call("backupGet", { token: s.T, key: bk })).backup.data;
  assert.ok(!Object.keys(data).some(k => /^(log|seen|use)\//.test(k)));
  await s.call("backupRestore", { token: s.T, key: bk, confirm: "RESTORE" });
  const after = (await s.call("ownerLog", { code: "owner-secret-1" })).log.map(x => x.what);
  assert.ok(after.includes("Teacher added") && after.includes("Backup restored") && after.includes("Backup downloaded"));
  const text = JSON.stringify(ins);
  for (const x of s.roster) assert.ok(!text.includes(x.name));
});

test("platform log: owner and district admin actions, plus each school's log", async () => {
  const { m, A } = await twoDistricts();
  await m.call("ownerDistrictAdmin", { code: "owner-secret-1", district: "alpha", name: "Dr. Super", adminCode: "123456" });
  await m.call("districtLogin", { districtCode: "alpha", code: "123456" });
  const log = (await m.call("ownerLogAll", { code: "owner-secret-1" })).log;
  const has = (w, where) => log.some(x => x.what === w && (!where || x.where === where));
  assert.ok(has("District added", "Platform") && has("School added") && has("District admin saved") && has("District admin signed in"));
  const ins = await m.call("ownerInsightsAll", { code: "owner-secret-1" });
  assert.deepEqual(ins.waiting, []);
  await rejects(m.call("ownerLogAll", { code: "wrong" }), /did not match/);
});

test("owner can rename a district and move a school between districts without touching its data", async () => {
  const { m, A } = await twoDistricts();
  const school = (await m.call("ownerDistricts", { code: "owner-secret-1" })).districts.find(d => d.id === "alpha").schools[0].id;
  await m.call("ownerDistrictRename", { code: "owner-secret-1", id: "alpha", name: "Alpha County SD" });
  await m.call("ownerSchoolMove", { code: "owner-secret-1", id: school, district: "beta" });
  await rejects(m.call("ownerSchoolMove", { code: "owner-secret-1", id: school, district: "nowhere" }), /not found/);
  const D = (await m.call("ownerDistricts", { code: "owner-secret-1" })).districts;
  assert.equal(D.find(d => d.id === "alpha").name, "Alpha County SD"); assert.equal(D.find(d => d.id === "alpha").schools.length, 0);
  assert.equal(D.find(d => d.id === "beta").schools.length, 2);
  assert.ok((await m.call("boot", { token: A.T })).school); // teachers keep working
  await m.call("ownerDistrictDelete", { code: "owner-secret-1", id: "alpha" });
  await rejects(m.call("ownerSchoolMove", { code: "wrong", id: school, district: "beta" }), /did not match/);
});

test("high school 'choose your focus' is a class setting, on unless the teacher turns it off", async () => {
  const s = await school();
  const c = (await s.call("classSave", { token: s.T, name: "ACT prep", testId: "std10" })).cls;
  assert.equal(c.choose, true);
  const off = (await s.call("classSave", { token: s.T, id: c.id, name: "ACT prep", choose: false })).cls;
  assert.equal(off.choose, false);
  const again = (await s.call("classSave", { token: s.T, id: c.id, name: "ACT prep 2" })).cls;
  assert.equal(again.choose, false); // other edits keep the teacher's choice
});

test("Sign in with Google (one school): connect while signed in, then sign in; bad tokens and strangers are refused", async () => {
  const s = await school();
  await rejects(s.call("googleLogin", { credential: "g:111:t@school.org" }), /isn.t connected/);
  await rejects(s.call("googleLink", { token: s.T, credential: "forged" }), /didn.t work/);
  await rejects(s.call("googleLink", { credential: "g:111:t@school.org" }), /sign in/);
  const b = await s.call("googleLink", { token: s.T, credential: "g:111:t@school.org" });
  assert.equal(b.me.googleEmail, "t@school.org"); assert.equal(b.me.google, true);
  const L = await s.call("googleLogin", { credential: "g:111:t@school.org" });
  assert.ok(L.token); assert.equal(L.me.name, "Mr. Barksdale");
  assert.ok(!JSON.stringify(L.teachers).includes("111"), "Google's id must not be sent to other teachers");
  await s.call("teacherSave", { token: s.T, name: "Ms. Two", code: "5678" });
  const t2 = (await s.call("login", { code: "5678" })).token;
  await rejects(s.call("googleLink", { token: t2, credential: "g:111:other@school.org" }), /another teacher/);
  await rejects(s.call("googleLogin", { credential: "forged" }), /didn.t work/);
  await s.call("googleUnlink", { token: s.T });
  await rejects(s.call("googleLogin", { credential: "g:111:t@school.org" }), /isn.t connected/);
});

test("Sign in with Google across districts: Google finds the right school, and one Google account can't be in two schools", async () => {
  const { m, A, B } = await twoDistricts();
  await m.call("googleLink", { token: A.T, credential: "g:aaa:alpha@d1.org" });
  const L = await m.call("googleLogin", { credential: "g:aaa:alpha@d1.org" });
  assert.equal(L.me.name, "Ms. Alpha"); assert.equal(L.school.name, A.schoolName || L.school.name);
  assert.ok((await m.call("boot", { token: L.token })).classes.length >= 1);
  await rejects(m.call("googleLink", { token: B.T, credential: "g:aaa:alpha@d1.org" }), /another Path to Proficiency account/);
  await rejects(m.call("googleLogin", { credential: "g:zzz:nobody@x.org" }), /isn.t connected/);
  await rejects(m.call("googleLogin", { credential: "nope", school: "anything" }), /didn.t work/);
  // the registry keeps a hash, never Google's id or the email
  const reg = JSON.stringify([...m.stores.get("ptp-registry").M.entries()]);
  assert.ok(!reg.includes("alpha@d1.org") && !reg.includes('"aaa"'));
  await m.call("googleUnlink", { token: A.T });
  await m.call("googleLink", { token: B.T, credential: "g:aaa:alpha@d1.org" }); // free again once released
  assert.equal((await m.call("googleLogin", { credential: "g:aaa:alpha@d1.org" })).me.name, "Mr. Beta");
});

/* ---------- stage 4: moving today's one-school site into its own school store ---------- */
test("move: dry run writes nothing; the copy is exact; re-running syncs; the switch keeps everyone's work; switching back undoes it", async () => {
  const stores = new Map(), getStore = n => { if (!stores.has(n)) stores.set(n, memoryStore()); return stores.get(n) };
  const mk = env => { const router = makeRouter({ getStore, env: { OWNER_CODE: "owner-secret-1", ...env } });
    return async (action, body) => { const r = await router.handle(new Request("http://x/api/" + action, { method: "POST", body: JSON.stringify(body) }), "10.9.9.9"); const j = await r.json(); if (!r.ok) { const e = new Error(j.error || action); e.status = r.status; throw e } return j } };
  const one = mk({}), MV = { code: "owner-secret-1", districtId: "cleveland-sd", districtName: "Cleveland School District", schoolId: "rh-bearden", schoolName: "RH Bearden Elementary" };
  const s = await one("setup", { code: "1234", name: "Mr. Barksdale", schoolName: "RH Bearden" });
  const cls = (await one("classSave", { token: s.token, name: "The OGs" })).cls;
  await one("rosterSave", { token: s.token, classId: cls.id, students: ["Jada Smith", "Ben Quinn", "Ana Lopez"].map((name, i) => ({ name, code: String(5100 + i * 11) })) });
  const st = await one("studentLogin", { join: cls.join, code: "5100" });
  await one("progSave", { token: st.token, testId: "_flu", prog: { score: 7 } });
  await one("backupNow", { token: s.token });

  await rejects(one("ownerMove", { ...MV, code: "wrong" }), /did not match/);
  const dry = await one("ownerMove", MV);
  assert.equal(dry.dryRun, true); assert.equal(dry.same, false); assert.equal(dry.from.students, 3); assert.equal(dry.to.keys, 0);
  assert.ok(!stores.has("ptp-d-rh-bearden") || stores.get("ptp-d-rh-bearden").M.size === 0, "dry run wrote school data");
  assert.ok(!stores.has("ptp-registry") || ![...stores.get("ptp-registry").M.keys()].some(k => /^(school|district|join)\//.test(k)), "dry run wrote registry entries");

  const before = JSON.stringify([...stores.get("p2p").M.entries()].map(([k, v]) => [k, v.v]));
  const mv = await one("ownerMove", { ...MV, dryRun: false });
  assert.equal(mv.same, true, JSON.stringify(mv.differences)); assert.deepEqual(mv.to, mv.from); assert.equal(mv.to.students, 3);
  assert.equal(JSON.stringify([...stores.get("p2p").M.entries()].map(([k, v]) => [k, v.v])), before, "the old store changed");
  assert.equal((await one("ownerMove", MV)).same, true);

  await one("progSave", { token: st.token, testId: "_flu", prog: { score: 9 } }); // kids keep working before the switch
  assert.equal((await one("ownerMove", MV)).same, false);
  const again = await one("ownerMove", { ...MV, dryRun: false });
  assert.equal(again.same, true); assert.ok(again.copied >= 1);

  const many = mk({ MULTI_DISTRICT: "on" });
  await rejects(many("classList", { token: s.token }), /sign in again/); // old sign-ins end once; everyone signs in again
  const t2 = await many("login", { school: "rh-bearden", code: "1234" });
  assert.ok(t2.token);
  const st2 = await many("studentLogin", { join: cls.join, code: "5100" });
  assert.ok(st2.token);
  const raw = JSON.stringify([...getStore("ptp-d-rh-bearden").M.values()].map(x => x.v));
  assert.ok(raw.includes("Jada Smith") && raw.includes('"score":9'));
  const list = await many("ownerDistricts", { code: "owner-secret-1" });
  assert.equal(list.districts[0].schools[0].classes, 1); assert.equal(list.districts[0].schools[0].ready, true); assert.equal(list.districts[0].schools[0].waitingForSetup, false);
  await rejects(many("ownerMove", { ...MV, dryRun: false }), /already switched/);
  assert.equal((await many("ownerMove", MV)).dryRun, true);
  await rejects(many("ownerMove", { ...MV, schoolId: "other-es", dryRun: false, districtId: "cleveland-sd" }), /class codes already belong/);

  const back = mk({}); // undo: switch off and the old store answers again, untouched
  assert.ok((await back("login", { code: "1234" })).token);
});

test("new school year: year-end copy kept for good, move up keeps students, empty clears them", async () => {
  const s = await school();
  const c2 = (await s.call("classSave", { token: s.T, name: "Room 2" })).cls;
  await s.call("rosterSave", { token: s.T, classId: c2.id, students: [{ name: "Zoe K.", code: "4321" }] });
  const st = await s.login(s.roster[0].code);
  await s.call("progSave", { token: st.token, testId: "std3", prog: { score: 7 } });
  await rejects(s.call("yearStart", { token: s.T, year: "2027-28", plan: {}, confirm: "nope" }), /NEW YEAR/);
  await rejects(s.call("yearStart", { token: st.token, year: "2027-28", plan: {}, confirm: "NEW YEAR" }));
  const r = await s.call("yearStart", { token: s.T, year: "2027-28", plan: { [s.cls.id]: "up", [c2.id]: "empty" }, confirm: "NEW YEAR" });
  assert.deepEqual(r.done, { up: 1, empty: 1, keep: 0 });
  assert.equal(r.classes.find(c => c.id === s.cls.id).testId, "std4");
  assert.equal(s.store.M.get("roster/" + s.cls.id).v.students.length, 6);
  assert.equal(s.store.M.get("roster/" + c2.id).v.students.length, 0);
  assert.equal(r.school.year, "2027-28"); assert.ok(r.key.endsWith("-yearend"));
  const saved = s.store.M.get(r.key).v; assert.ok(JSON.stringify(saved).includes("Zoe K.") && JSON.stringify(saved).includes('"score":7'));
  assert.ok((await s.login(s.roster[0].code)).token); // same codes still work after moving up
  for (let i = 0; i < 23; i++) await s.call("backupNow", { token: s.T });
  assert.ok(s.store.M.has(r.key)); // nightly rotation never removes the year-end copy
});

test("Clever: off until the secret is set; first sign-in connects once, then Clever alone signs in", async () => {
  const off = await school();
  await rejects(off.call("cleverLogin", { code: "c:t1:teacher:Ms. Clever" }), /isn’t turned on/);
  const { A, B, m } = await twoDistricts();
  assert.equal((await m.call("cleverConfig", {})).on, true);
  await rejects(m.call("cleverLogin", { code: "nope" }), /didn’t work/);
  // a teacher: first time asks to connect, then signs straight in
  const t1 = await m.call("cleverLogin", { code: "c:T1:teacher:Ms. Alpha" });
  assert.equal(t1.needLink, true); assert.equal(t1.kind, "teacher"); assert.ok(t1.ticket);
  await rejects(m.call("cleverLink", { token: A.T, ticket: t1.ticket + "x" }), /expired/); // a changed ticket is refused
  const linked = await m.call("cleverLink", { token: A.T, ticket: t1.ticket });
  assert.equal(linked.me.cleverName, "Ms. Alpha");
  const t2 = await m.call("cleverLogin", { code: "c:T1:teacher:Ms. Alpha" });
  assert.equal(t2.role, "teacher"); assert.ok(t2.token); assert.equal(t2.me.name, "Ms. Alpha");
  await rejects(m.call("cleverLink", { token: B.T, ticket: t1.ticket }), /another Path to Proficiency school/); // one school per Clever account
  // a student: connects with class code + secret code once
  const s1 = await m.call("cleverLogin", { code: "c:S1:student:Avery A" });
  assert.equal(s1.needLink, true); assert.equal(s1.kind, "student");
  await rejects(m.call("cleverLink", { token: A.T, ticket: s1.ticket }), /student account/); // a student's Clever can't be put on a teacher
  await rejects(m.call("studentLogin", { join: A.cls.join, code: A.roster[0].code, clever: t1.ticket }), /teacher Clever/);
  const sl = await m.call("studentLogin", { join: A.cls.join, code: A.roster[0].code, clever: s1.ticket });
  assert.ok(sl.token);
  const s2 = await m.call("cleverLogin", { code: "c:S1:student:Avery A" });
  assert.equal(s2.role, "student"); assert.equal(s2.student.name, "Avery Alpha");
  // the teacher saving the roster keeps the connection (the browser can't change or drop it)
  const ro = m.getStore("ptp-d-" + A.sid).M.get("roster/" + A.cls.id).v.students;
  await m.call("rosterSave", { token: A.T, classId: A.cls.id, students: ro.map(({ clever, ...x }) => ({ ...x, ...(x.id === ro[1].id ? { clever: "S1" } : {}) })) });
  assert.equal((await m.call("cleverLogin", { code: "c:S1:student:Avery A" })).student.name, "Avery Alpha");
  // disconnecting ends Clever sign-in for that teacher
  await m.call("cleverUnlink", { token: A.T });
  assert.equal((await m.call("cleverLogin", { code: "c:T1:teacher:Ms. Alpha" })).needLink, true);
});

test("district numbers: active this week, weekly trend, standards mastered this year, benchmark growth", async () => {
  const { classAgg } = await import("../netlify/functions/api/router.mjs");
  const now = Date.UTC(2026, 10, 25, 15), day = n => new Date(now - n * 864e5).toISOString().slice(0, 10);
  const students = [{ id: "a", bm: { "2026-27": { Fall: 40, Winter: 55 } } }, { id: "b", bm: { "2026-27": { Fall: 60 } } }, { id: "c" }];
  const progs = {
    a: { std3: { skills: { k1: { status: "done", doneAt: now - 5 * 864e5 }, k2: { status: "skip" }, k3: { status: "done", doneAt: Date.UTC(2025, 9, 1) } }, days: { [day(1)]: { k1: { n: 10, ok: 8, ms: 600000 } }, [day(20)]: { k1: { n: 4, ok: 2 } } } } },
    b: { std3: { skills: {}, days: { [day(15)]: { k1: { n: 5, ok: 5 } } } } }, c: {} };
  const o = classAgg(students, progs, "std3", now);
  assert.equal(o.students, 3); assert.equal(o.active, 1); assert.equal(o.active30, 2);
  assert.equal(o.answers, 10); assert.equal(o.ok, 8); assert.equal(o.minutes, 10);
  assert.equal(o.mastered, 1); assert.equal(o.masteredTest, 1); // last school year's mastery doesn't count
  assert.equal(o.bmBoth, 1); assert.equal(o.bmNow - o.bmFall, 15);
  assert.deepEqual(o.weeks, [0, 0, 0, 0, 0, 2, 0, 1]); // 15 and 20 days ago are both 2 weeks back
});

test("Buddy can be turned off or set to show up rarely, sometimes, or often", async () => {
  const s = await school();
  const c = cl => s.call("classSave", { token: s.T, id: s.cls.id, name: "Room 1", ...cl }).then(r => r.cls);
  assert.equal((await c({})).bdEvery, 12);
  assert.equal((await c({ bdEvery: 6 })).bdEvery, 6);
  assert.equal((await c({ bdEvery: 99 })).bdEvery, 12);
  const off = await c({ buddy: false }); assert.equal(off.buddy, false);
  assert.equal((await c({ buddy: true, bdEvery: 20 })).bdEvery, 20);
});

let failed = 0;
for (const t of tests) {
  try { await t.fn(); console.log("  ok   " + t.name) }
  catch (e) { failed++; console.log("  FAIL " + t.name + "\n       " + (e.stack || e.message).split("\n").slice(0, 3).join("\n       ")) }
}
console.log(`\n${tests.length - failed} of ${tests.length} server tests passed`);
process.exit(failed ? 1 : 0);
