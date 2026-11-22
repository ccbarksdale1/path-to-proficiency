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

function client(env = {}) {
  const store = memoryStore(), api = makeApi({ store, env });
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
  const router = makeRouter({ getStore, env: { MULTI_DISTRICT: "on", OWNER_CODE: "owner-secret-1", ...env } });
  const call = async (action, body, from = "10.1.1.1") => {
    const r = await router.handle(new Request("http://x/api/" + action, { method: "POST", body: JSON.stringify(body) }), from);
    const j = await r.json();
    if (!r.ok) { const e = new Error(j.error || action); e.status = r.status; e.body = j; throw e }
    return j;
  };
  const raw = async (action, body, from = "10.1.1.1") => { const r = await router.handle(new Request("http://x/api/" + action, { method: "POST", body: JSON.stringify(body) }), from); return { status: r.status, text: await r.text() } };
  return { stores, router, call, raw, getStore };
}
async function district(m, id, name, people) {
  const { setupKey } = await m.call("ownerDistrictCreate", { code: "owner-secret-1", id, name });
  const s = await m.call("setup", { district: id, setupKey, code: "1234", name: people.teacher, schoolName: name + " Elementary" });
  const cls = (await m.call("classSave", { token: s.token, name: people.cls })).cls;
  await m.call("rosterSave", { token: s.token, classId: cls.id, students: people.students.map((n, i) => ({ name: n, code: String(people.base + i * 7) })) });
  const roster = m.getStore("ptp-d-" + id).M.get("roster/" + cls.id).v.students;
  return { id, T: s.token, cls, roster, setupKey };
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

test("new district: setup needs the one-time key from the owner", async () => {
  const m = multi();
  const { setupKey } = await m.call("ownerDistrictCreate", { code: "owner-secret-1", id: "gamma", name: "Gamma" });
  await rejects(m.call("setup", { district: "gamma", code: "1234", name: "Intruder" }), /setup key/);
  await rejects(m.call("setup", { district: "gamma", setupKey: "wrong-key", code: "1234", name: "Intruder" }), /setup key/);
  await m.call("setup", { district: "gamma", setupKey, code: "1234", name: "Real Admin" });
  await rejects(m.call("setup", { district: "gamma", setupKey, code: "5678", name: "Again" }), /setup key/);
  await rejects(m.call("ownerDistrictCreate", { code: "wrong", id: "delta", name: "Delta" }), /did not match/);
  await rejects(m.call("ownerDistrictCreate", { code: "owner-secret-1", id: "gamma", name: "Dup" }), /already used/);
});

test("students sign in with just their class code; each district's data stays in its own store", async () => {
  const { m, A, B } = await twoDistricts();
  const a = await m.call("studentLogin", { join: A.cls.join, code: A.roster[0].code });
  const b = await m.call("studentLogin", { join: B.cls.join, code: B.roster[0].code });
  assert.ok(a.token && b.token);
  const alpha = JSON.stringify([...m.getStore("ptp-d-alpha").M.values()]), beta = JSON.stringify([...m.getStore("ptp-d-beta").M.values()]);
  assert.ok(alpha.includes("Avery Alpha") && !alpha.includes("Bailey Beta"));
  assert.ok(beta.includes("Bailey Beta") && !beta.includes("Avery Alpha"));
  await rejects(m.call("studentLogin", { join: A.cls.join, code: B.roster[0].code }));
});

test(`cross-district token: Alpha's teacher reaches none of Beta's data on any of ${ACTIONS.length} actions`, async () => {
  const { m, A, B } = await twoDistricts();
  const leak = ["Bailey Beta", "Blake Beta", "Beta District", "Beta Room", B.cls.id, B.roster[0].id];
  for (const action of ACTIONS) {
    const r = await m.raw(action, { token: A.T, classId: B.cls.id, id: B.cls.id, sid: B.roster[0].id, testId: "std3", wk: "2026-11-16", district: "beta", join: B.cls.join });
    for (const x of leak) assert.ok(!r.text.includes(x), `${action} leaked ${x}`);
  }
});

test("forged token: editing a token to name another district fails its signature", async () => {
  const { m, A, B } = await twoDistricts();
  const [body, mac] = A.T.split("."), p = JSON.parse(Buffer.from(body, "base64url").toString());
  const forged = Buffer.from(JSON.stringify({ ...p, d: "beta" })).toString("base64url") + "." + mac;
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
  assert.equal(reg.M.get("join/" + A.cls.join).v.d, "alpha");
  assert.equal(reg.M.get("join/" + B.cls.join).v.d, "beta");
  // a code already held by Alpha can never be claimed for Beta
  const hooksBeta = await m.router.handle(new Request("http://x/api/status", { method: "POST", body: JSON.stringify({ district: "beta" }) }), "1.1.1.1");
  assert.equal(hooksBeta.status, 200);
  await reg.setJSON("join/TAKEN1", { d: "alpha" });
  const r = await reg.setJSON("join/TAKEN1", { d: "beta" }, { onlyIfNew: true });
  assert.equal(r.modified, false);
});

test("teacher scope: a second teacher can't open the first teacher's class", async () => {
  const { m, A } = await twoDistricts();
  const t2 = await m.call("teacherSave", { token: A.T, name: "Mr. Second", code: "4321" });
  const second = await m.call("login", { district: "alpha", code: "4321" });
  await rejects(m.call("classData", { token: second.token, id: A.cls.id }));
  await rejects(m.call("rosterSave", { token: second.token, classId: A.cls.id, students: [] }));
  assert.ok(t2);
});

test("owner export across districts: no names, codes or class names from any district", async () => {
  const { m, A, B } = await twoDistricts();
  const r = await m.call("ownerResearchAll", { code: "owner-secret-1" }), txt = JSON.stringify(r);
  assert.equal(r.districts.length, 2);
  for (const x of ["Avery", "Bailey", "Alpha", "Beta", "alpha", "beta", A.cls.join, B.cls.join, A.roster[0].code, B.roster[0].id]) assert.ok(!txt.includes(x), "export leaked " + x);
});

test("student scope: a student's save only ever touches their own work", async () => {
  const { m, A } = await twoDistricts();
  const a = await m.call("studentLogin", { join: A.cls.join, code: A.roster[0].code });
  await m.call("progSave", { token: a.token, sid: A.roster[1].id, studentId: A.roster[1].id, testId: "std3", prog: { skills: { k1: { status: "done", streak: 9 } } } });
  const store = m.getStore("ptp-d-alpha").M;
  assert.ok(store.has(`prog/${A.cls.id}/${A.roster[0].id}`), "saved to their own record");
  assert.ok(!store.has(`prog/${A.cls.id}/${A.roster[1].id}`), "classmate's record untouched");
  await rejects(m.call("classData", { token: a.token, id: A.cls.id }));
});

test("the shared registry holds no student data", async () => {
  const { m } = await twoDistricts();
  const txt = JSON.stringify([...m.getStore("ptp-registry").M.entries()]);
  for (const x of ["Avery", "Ari", "Bailey", "Blake", "Ms. Alpha", "Mr. Beta", "roster", "prog"]) assert.ok(!txt.includes(x), "registry holds " + x);
});

test("deleting a district removes its whole store and its class codes", async () => {
  const { m, A, B } = await twoDistricts();
  await rejects(m.call("ownerDistrictDelete", { code: "owner-secret-1", id: "alpha", confirm: "yes" }), /DELETE alpha/);
  await m.call("ownerDistrictDelete", { code: "owner-secret-1", id: "alpha", confirm: "DELETE alpha" });
  assert.equal(m.getStore("ptp-d-alpha").M.size, 0);
  assert.ok(!m.getStore("ptp-registry").M.has("join/" + A.cls.join));
  await rejects(m.call("studentLogin", { join: A.cls.join, code: A.roster[0].code }), /not found/);
  assert.ok((await m.call("studentLogin", { join: B.cls.join, code: B.roster[0].code })).token, "Beta still works");
});

test("brute force: wrong codes lock out, per district and per address", async () => {
  const { m } = await twoDistricts();
  let locked = false;
  for (let i = 0; i < 15 && !locked; i++) { const r = await m.raw("login", { district: "alpha", code: "0000" }, "9.9.9.9"); if (r.status === 429) locked = true }
  assert.ok(locked, "Alpha locks after repeated wrong codes");
  assert.equal((await m.raw("login", { district: "beta", code: "1234" }, "9.9.9.9")).status, 200, "Beta is not affected");
  let ownerLocked = false;
  for (let i = 0; i < 12 && !ownerLocked; i++) { const r = await m.raw("ownerDistricts", { code: "nope" }, "8.8.8.8"); if (r.status === 429) ownerLocked = true }
  assert.ok(ownerLocked, "owner code locks too");
});

test("nightly backups: one snapshot per district", async () => {
  const { m } = await twoDistricts();
  const keys = await m.router.snapshots();
  assert.equal(keys.length, 2);
  assert.ok([...m.getStore("ptp-d-alpha").M.keys()].some(k => k.startsWith("backup/")));
});

let failed = 0;
for (const t of tests) {
  try { await t.fn(); console.log("  ok   " + t.name) }
  catch (e) { failed++; console.log("  FAIL " + t.name + "\n       " + (e.stack || e.message).split("\n").slice(0, 3).join("\n       ")) }
}
console.log(`\n${tests.length - failed} of ${tests.length} server tests passed`);
process.exit(failed ? 1 : 0);
