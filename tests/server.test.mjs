// Server tests: every check runs the real API code against a pretend in-memory store.
// Run: node tests/server.test.mjs   (no installs needed)
import assert from "node:assert/strict";
import { makeApi } from "../netlify/functions/api/core.mjs";

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

let failed = 0;
for (const t of tests) {
  try { await t.fn(); console.log("  ok   " + t.name) }
  catch (e) { failed++; console.log("  FAIL " + t.name + "\n       " + (e.stack || e.message).split("\n").slice(0, 3).join("\n       ")) }
}
console.log(`\n${tests.length - failed} of ${tests.length} server tests passed`);
process.exit(failed ? 1 : 0);
