// Path to Proficiency: school server.
// Data lives in Netlify Blobs. Everything goes through POST /api/<action> with a JSON body.
import crypto from "node:crypto";

const J = (status, body) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const ok = body => J(200, body);
const fail = (msg, status = 400) => J(status, { error: msg });
class HttpErr extends Error { constructor(msg, status = 400) { super(msg); this.status = status } }
class Conflict extends Error {}
const bad = (msg, status = 400) => { throw new HttpErr(msg, status) };

const sha = s => crypto.createHash("sha256").update(s).digest("hex");
const rid = (n = 10) => crypto.randomBytes(16).toString("base64url").replace(/[^A-Za-z0-9]/g, "").slice(0, n);
const JOIN_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I
const joinCode = () => Array.from(crypto.randomBytes(6), b => JOIN_CHARS[b % JOIN_CHARS.length]).join("");
const today = () => new Date().toISOString().slice(0, 10);
const str = (v, max = 200) => String(v ?? "").trim().slice(0, max);

export function makeApi({ store, env }) {
  const getJ = async k => (await store.get(k, { type: "json" })) ?? null;
  const setJ = (k, v) => store.setJSON(k, v);
  const del = k => store.delete(k);
  const listKeys = async prefix => ((await store.list({ prefix })).blobs || []).map(b => b.key);

  /* safe saves: a write only lands if nobody else changed the record since we read it; otherwise the whole action runs again */
  const ETAG = new WeakMap();
  const getJE = async k => { const r = await store.getWithMetadata(k, { type: "json" }); return r ? { v: r.data, etag: r.etag } : { v: null, etag: null } };
  const loadSchool = async () => { const { v, etag } = await getJE("school"); if (v && etag) ETAG.set(v, etag); return v };
  const saveSchool = async s => {
    const e = ETAG.get(s), r = await store.setJSON("school", s, e ? { onlyIfMatch: e } : { onlyIfNew: true });
    if (r && r.modified === false) throw new Conflict();
    if (r && r.etag) ETAG.set(s, r.etag);
  };
  /* read-change-write one record with retries (progress, reports) */
  async function mutJ(k, fn) {
    for (let i = 0; i < 6; i++) {
      const { v, etag } = await getJE(k), nv = await fn(v);
      if (nv === undefined) return v;
      const r = await store.setJSON(k, nv, etag ? { onlyIfMatch: etag } : { onlyIfNew: true });
      if (!r || r.modified !== false) return nv;
      await new Promise(res => setTimeout(res, 30 + Math.random() * 120));
    }
    throw new Conflict();
  }

  /* ---------- sessions ---------- */
  const sign = (school, payload) => {
    const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 1000 * 60 * 60 * 12 })).toString("base64url");
    const mac = crypto.createHmac("sha256", school.secret).update(body).digest("base64url");
    return body + "." + mac;
  };
  const verify = (school, token) => {
    if (!school || !token || typeof token !== "string") return null;
    const [body, mac] = token.split(".");
    if (!body || !mac) return null;
    const want = crypto.createHmac("sha256", school.secret).update(body).digest("base64url");
    if (want.length !== mac.length || !crypto.timingSafeEqual(Buffer.from(want), Buffer.from(mac))) return null;
    try { const p = JSON.parse(Buffer.from(body, "base64url").toString()); return p.exp > Date.now() ? p : null } catch { return null }
  };

  /* ---------- sign-in lockout: 10 wrong codes in 15 minutes locks that connection for 15 minutes ---------- */
  const failKey = ip => "fail/" + sha("p2p" + (ip || "unknown")).slice(0, 24);
  async function checkLock(ip) {
    const f = await getJ(failKey(ip));
    if (f && f.n >= 10 && Date.now() - f.t < 15 * 60 * 1000) bad("Too many wrong codes. Wait 15 minutes and try again.", 429);
  }
  async function noteFail(ip) {
    const k = failKey(ip), f = await getJ(k);
    const fresh = !f || Date.now() - f.t > 15 * 60 * 1000;
    await setJ(k, { n: fresh ? 1 : f.n + 1, t: fresh ? Date.now() : f.t });
  }
  const clearFail = ip => del(failKey(ip)).catch(() => {});

  /* ---------- helpers ---------- */
  const codeHash = (school, code) => sha(school.salt + ":" + code);
  const pubTeacher = t => ({ id: t.id, name: t.name, admin: !!t.admin });
  const pubClass = c => ({ id: c.id, name: c.name, teacherId: c.teacherId, join: c.join, testId: c.testId || "a1", goal: c.goal ?? 60, mastery: c.mastery ?? 10, videos: c.videos || {}, tutor: c.tutor !== false, chirp: c.chirp !== false,
    flu: { on: c.flu?.on !== false, secs: c.flu?.secs || 180, pass: c.flu?.pass || 28, n: c.flu?.n || 30 },
    games: { on: c.games?.on !== false, mins: c.games?.mins || 3 },
    ip: { on: c.ip?.on !== false, cut: c.ip?.cut || 60 } });
  const testMeta = t => ({ id: t.id, name: t.name, grade: t.grade || "", ownerId: t.ownerId || null, created: t.created || 0, nq: Object.keys(t.qs || {}).length, skills: (t.skills || []).length });
  const BUILTIN = { id: "a1", name: "Grade 3 benchmark (8 standards, enter missed question numbers)", builtIn: true, grade: "3", nq: 0, skills: 8 };
  const STDTESTS = [["std3", "3", 33], ["std4", "4", 34], ["std5", "5", 34], ["std6", "6", 50], ["std7", "7", 37], ["std8", "8", 33], ["std9", "9", 52]].map(([id, g, n]) => ({ id, name: g === "9" ? "Algebra I: all standards (no test)" : `Grade ${g}: all standards (no test)`, builtIn: true, grade: g === "9" ? "Algebra I" : g, nq: 0, skills: n }));
  const builtinIds = new Set(["a1", ...STDTESTS.map(t => t.id)]);

  async function teacherCtx(token) {
    const school = await loadSchool();
    const p = verify(school, token);
    if (!p || p.r !== "t") bad("Please sign in again.", 401);
    const me = school.teachers.find(t => t.id === p.id);
    if (!me) bad("Please sign in again.", 401);
    return { school, me, admin: !!me.admin };
  }
  async function studentCtx(token) {
    const school = await loadSchool();
    const p = verify(school, token);
    if (!p || p.r !== "s") bad("Please sign in again.", 401);
    const cls = school.classes.find(c => c.id === p.c);
    if (!cls) bad("Your class was removed. Ask your teacher.", 401);
    const roster = (await getJ("roster/" + cls.id)) || { students: [] };
    const st = roster.students.find(s => s.id === p.id);
    if (!st) bad("Please sign in again.", 401);
    return { school, cls, st };
  }
  const canSee = (ctx, cls) => ctx.admin || cls.teacherId === ctx.me.id;
  function myClass(ctx, id) {
    const c = ctx.school.classes.find(x => x.id === id);
    if (!c || !canSee(ctx, c)) bad("That class was not found.", 404);
    return c;
  }
  /* ---------- school license: seat caps set only by the site owner (OWNER_CODE in Netlify) ---------- */
  const TRIAL = { plan: "Trial", teachers: 2, students: 60 };
  const license = school => env.OWNER_CODE ? { ...TRIAL, ...(school.license || {}) } : null; // no OWNER_CODE yet = caps not turned on
  async function seatsUsed(school, skipClassId) {
    let n = 0;
    for (const c of school.classes) { if (c.id === skipClassId) continue; const r = await getJ("roster/" + c.id); n += (r?.students || []).filter(x => !x.sample).length }
    return n;
  }
  const capMsg = (what, L) => `Your school’s ${L.plan} license covers ${L[what]} ${what}. To add more, contact Path to Proficiency to upgrade your license.`;
  function boot(ctx) {
    const { school, me, admin } = ctx;
    return {
      me: pubTeacher(me), school: { name: school.name },
      teachers: school.teachers.map(pubTeacher),
      classes: school.classes.filter(c => admin || c.teacherId === me.id).map(pubClass),
      allClassCount: school.classes.length,
      tests: [BUILTIN, ...STDTESTS, ...(school.tests || [])], hidden: school.hidden || [],
      ai: !!env.ANTHROPIC_API_KEY,
      license: license(school) ? { ...license(school), usedT: school.teachers.length } : null,
    };
  }
  async function loadTest(id) {
    if (!id || builtinIds.has(id)) return null;
    return getJ("test/" + id);
  }

  /* ---------- AI (Anthropic) ---------- */
  const SMART = () => env.AI_MODEL_SMART || "claude-sonnet-5-5";
  const FAST = () => env.AI_MODEL_FAST || "claude-haiku-5-5";
  async function claude({ model, system, messages, max_tokens = 1500 }) {
    if (!env.ANTHROPIC_API_KEY) bad("The AI is not turned on yet. Add ANTHROPIC_API_KEY in Netlify.", 503);
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model, system, messages, max_tokens }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) { console.error("anthropic", r.status, JSON.stringify(d).slice(0, 500)); bad("The AI had a problem: " + (d.error?.message || r.status), 502) }
    return (d.content || []).filter(b => b.type === "text").map(b => b.text).join("");
  }
  const jsonOut = t => {
    const a = t.indexOf("{"), b = t.lastIndexOf("}");
    if (a < 0 || b < a) bad("The AI answer could not be read. Try again.", 502);
    try { return JSON.parse(t.slice(a, b + 1)) } catch { bad("The AI answer could not be read. Try again.", 502) }
  };

  const FORMAT = `QUESTION FORMAT (JSON):
{"n": 1, "std": "3.OA.3", "skill": "Multiplication and division word problems",
 "type": "mc" | "multi" | "input",
 "parts": [ ...question body, in order. Each item is one of:
    "a paragraph string",
    {"eq": "4 × ∎ = 32"}                      (an equation on its own line; ∎ is a blank box),
    {"table": [["Row 1 a","Row 1 b"],["Row 2 a","Row 2 b"]], "cols": ["Header a","Header b"]},
    {"arr": [rows, columns]}                   (an array of dots),
    {"groups": [numberOfGroups, itemsInEach]}  (equal groups picture),
    {"fig": "short description of a picture that cannot be drawn with the items above"} ],
 "choices": [ "choice text", ... ]  (mc and multi only; 3 to 5 choices. A choice may also be {"groups":[g,n],"eq":"3 × 4"} or {"table":[[..],[..]]}),
 "ans": "B" for mc, ["A","D"] for multi (always exactly 2), or a number for input,
 "keys": ["single","lowercase","words"] (4 to 8 key words a student should highlight: the numbers and the words that say what to do. Each must appear in a paragraph or eq exactly as a whole word),
 "steps": [ {"say": "one short sentence or two for a 3rd grader", "show": optional visual}, ... ] (3 to 6 steps that solve it. Optional "show" visuals:
    {"work": {"carry":" 1 ","top":"406","op":"+","bot":"378","res":"784"}}  (column addition/subtraction; strings line up digit by digit),
    {"nl": [low, high, step, [marked numbers], halfway or null, labelEvery]} (number line),
    {"groups": [g, n]}, {"arr": [r, c]}, {"skip": [by, times]}, {"chain": ["24","−6","18","−6","12"]}, {"table": [[..],[..]]} ),
 "why": {"A": "why choice A is wrong", ...} (mc/multi: one entry for EVERY wrong choice letter, naming the likely mistake),
 "whyElse": "what to check if the answer is wrong" (input only),
 "whyIn": {"783": "why a student might write 783"} (input only, common wrong answers) }
Use plain words a 3rd grader can read. Fractions are written [1/4]. Use × and ÷ signs.`;

  const TUTOR_SYS = (grade, name) => `You are Scout, a warm, patient math tutor star for ${grade ? "grade " + grade : "elementary"} students using the Path to Proficiency app. You are talking with ${name || "a student"}.
How you teach:
- Use very short sentences and simple words (1 to 3 sentences per reply, under 60 words). One idea at a time.
- Guide with questions and hints. Do not give the final answer until the student has answered the question in the app. After they answer, you may explain the right answer step by step.
- If they are stuck, break the problem into a smaller step, or use a picture idea (groups, arrays, number lines, place value).
- Praise effort and good thinking, not just right answers. Never say they are bad at math.
- Stay on math and this question. If they ask about something else, kindly bring them back.
- Never ask for or repeat personal information (full names, addresses, phone numbers, passwords). If a student says something that sounds like they are hurt, unsafe, or very upset, tell them kindly to talk to their teacher or a grown-up they trust right away.
- No links, no markdown headings, no emojis except an occasional ⭐.`;

  /* ---------- actions ---------- */
  const A = {};

  A.status = async () => {
    const s = await loadSchool();
    return { ready: !!s, schoolName: s?.name || "", ai: !!env.ANTHROPIC_API_KEY };
  };

  A.setup = async b => {
    if (await loadSchool()) bad("This school is already set up. Sign in with your teacher code.");
    const code = str(b.code, 6), name = str(b.name, 60), schoolName = str(b.schoolName, 80) || "Our school";
    if (!/^\d{4,6}$/.test(code)) bad("Pick a teacher code with 4 to 6 digits.");
    if (!name) bad("Type your name the way students see it, like Mr. Barksdale.");
    const school = { v: 1, name: schoolName, secret: rid(40), salt: rid(16), teachers: [], classes: [], tests: [], created: Date.now() };
    const t = { id: "t" + rid(8), name, admin: true };
    t.hash = codeHash(school, code);
    school.teachers.push(t);
    await saveSchool(school);
    return { token: sign(school, { r: "t", id: t.id }), ...boot({ school, me: t, admin: true }) };
  };

  A.login = async (b, ip) => {
    const school = await loadSchool();
    if (!school) bad("This school is not set up yet.");
    await checkLock(ip);
    const code = str(b.code, 6);
    const t = school.teachers.find(x => x.hash === codeHash(school, code));
    if (!t) { await noteFail(ip); bad("That teacher code did not match.", 401) }
    await clearFail(ip);
    return { token: sign(school, { r: "t", id: t.id }), ...boot({ school, me: t, admin: !!t.admin }) };
  };

  /* forgot code: whoever runs the site sets RESET_CODE in Netlify, then the admin picks a new teacher code */
  A.recover = async (b, ip) => {
    const school = await loadSchool();
    if (!school) bad("This school is not set up yet.");
    if (!env.RESET_CODE || String(env.RESET_CODE).length < 6) bad("Code reset is not turned on. In Netlify, add an environment variable named RESET_CODE (at least 6 characters), redeploy, and try again.", 403);
    await checkLock(ip);
    const a = Buffer.from(sha(str(b.reset, 200))), w = Buffer.from(sha(String(env.RESET_CODE)));
    if (!crypto.timingSafeEqual(a, w)) { await noteFail(ip); bad("That reset code did not match the one in Netlify.", 401) }
    const code = str(b.code, 6);
    if (!/^\d{4,6}$/.test(code)) bad("Pick a new teacher code with 4 to 6 digits.");
    const t = school.teachers.find(x => x.admin) || school.teachers[0];
    const h = codeHash(school, code);
    if (school.teachers.some(x => x.hash === h && x !== t)) bad("Another teacher already uses that code. Pick another.");
    t.hash = h;
    await saveSchool(school);
    await clearFail(ip);
    return { token: sign(school, { r: "t", id: t.id }), ...boot({ school, me: t, admin: !!t.admin }) };
  };

  A.boot = async b => boot(await teacherCtx(b.token));

  A.teacherSave = async b => {
    const ctx = await teacherCtx(b.token), { school } = ctx;
    const t = b.id ? school.teachers.find(x => x.id === b.id) : null;
    const self = t && t.id === ctx.me.id;
    if (!ctx.admin && !self) bad("Only a school admin can add or change teachers.", 403);
    if (b.id && !t) bad("That teacher was not found.", 404);
    const name = str(b.name, 60), code = str(b.code, 6);
    if (!name) bad("Type the teacher's name.");
    if (!t && !code) bad("Give the new teacher a code.");
    if (code) {
      if (!/^\d{4,6}$/.test(code)) bad("Teacher codes have 4 to 6 digits.");
      const h = codeHash(school, code);
      if (school.teachers.some(x => x.hash === h && x !== t)) bad("Another teacher already uses that code. Pick another.");
    }
    const rec = t || { id: "t" + rid(8) };
    rec.name = name;
    if (code) rec.hash = codeHash(school, code);
    if (ctx.admin && b.admin !== undefined) {
      if (t && t.admin && !b.admin && school.teachers.filter(x => x.admin).length === 1) bad("The school needs at least one admin.");
      rec.admin = !!b.admin;
    }
    if (!t) { const L = license(school); if (L && school.teachers.length >= L.teachers) bad(capMsg("teachers", L), 402); school.teachers.push(rec) }
    await saveSchool(school);
    return boot({ school, me: ctx.me, admin: ctx.admin });
  };

  A.teacherDelete = async b => {
    const ctx = await teacherCtx(b.token), { school } = ctx;
    if (!ctx.admin) bad("Only a school admin can remove teachers.", 403);
    const t = school.teachers.find(x => x.id === b.id);
    if (!t) bad("That teacher was not found.", 404);
    if (t.id === ctx.me.id) bad("You can't remove yourself.");
    if (school.classes.some(c => c.teacherId === t.id)) bad(`Move ${t.name}'s classes to another teacher first.`);
    school.teachers = school.teachers.filter(x => x !== t);
    await saveSchool(school);
    return boot(ctx);
  };

  A.classSave = async b => {
    const ctx = await teacherCtx(b.token), { school } = ctx;
    let c = b.id ? myClass(ctx, b.id) : null;
    const name = str(b.name, 60);
    if (!name) bad("Give the class a name, like Homeroom or Room 12.");
    let teacherId = b.teacherId || c?.teacherId || ctx.me.id;
    if (!ctx.admin && teacherId !== ctx.me.id) bad("Only a school admin can give a class to another teacher.", 403);
    if (!school.teachers.some(t => t.id === teacherId)) bad("That teacher was not found.");
    const testId = b.testId || c?.testId || "a1";
    if (!builtinIds.has(testId) && !(school.tests || []).some(t => t.id === testId)) bad("That test was not found.");
    if (!c) {
      let j; do { j = joinCode() } while (school.classes.some(x => x.join === j));
      c = { id: "c" + rid(8), join: j, created: Date.now(), videos: {} };
      school.classes.push(c);
      await setJ("roster/" + c.id, { students: [] });
    }
    Object.assign(c, {
      name, teacherId, testId,
      goal: Math.max(1, Math.min(100, Math.round(+b.goal || c.goal || 60))),
      mastery: Math.max(3, Math.min(20, Math.round(+b.mastery || c.mastery || 10))),
      tutor: b.tutor === undefined ? c.tutor !== false : !!b.tutor,
      chirp: b.chirp === undefined ? c.chirp !== false : !!b.chirp,
    });
    if (b.flu && typeof b.flu === "object") {
      const n = Math.max(10, Math.min(60, Math.round(+b.flu.n || 30)));
      c.flu = { on: b.flu.on !== false, n, secs: Math.max(30, Math.min(900, Math.round(+b.flu.secs || 180))), pass: Math.max(1, Math.min(n, Math.round(+b.flu.pass || 28))) };
    }
    if (b.ip && typeof b.ip === "object") c.ip = { on: b.ip.on !== false, cut: Math.max(1, Math.min(100, Math.round(+b.ip.cut || 60))) };
    if (b.games && typeof b.games === "object") c.games = { on: b.games.on !== false, mins: Math.max(1, Math.min(10, Math.round(+b.games.mins || 3))) };
    if (b.videos && typeof b.videos === "object") c.videos = Object.fromEntries(Object.entries(b.videos).filter(([, v]) => /^https?:\/\//i.test(String(v))).map(([k, v]) => [str(k, 40), str(v, 500)]));
    await saveSchool(school);
    return { cls: pubClass(c), ...boot(ctx) };
  };

  A.classDelete = async b => {
    const ctx = await teacherCtx(b.token), { school } = ctx;
    const c = myClass(ctx, b.id);
    school.classes = school.classes.filter(x => x !== c);
    await saveSchool(school);
    for (const k of await listKeys("prog/" + c.id + "/")) await del(k);
    await del("roster/" + c.id);
    await del("plan/" + c.id).catch(() => {});
    return boot(ctx);
  };

  A.classData = async b => {
    const ctx = await teacherCtx(b.token);
    const ids = Array.isArray(b.ids) ? b.ids : [b.id];
    const out = [];
    for (const id of ids.slice(0, 60)) {
      const c = myClass(ctx, id);
      const { v, etag } = await getJE("roster/" + c.id), roster = v || { students: [] };
      const progs = await Promise.all(roster.students.map(s => getJ(`prog/${c.id}/${s.id}`)));
      out.push({ cls: pubClass(c), rev: etag || "", students: roster.students.map((s, i) => ({ ...s, prog: progs[i] || {} })) });
    }
    return { classes: out };
  };

  A.rosterSave = async b => {
    const ctx = await teacherCtx(b.token);
    const c = myClass(ctx, b.classId);
    const { v: oldv, etag } = await getJE("roster/" + c.id), old = oldv || { students: [] };
    if (b.rev && etag && b.rev !== etag) bad("Someone else changed this class a moment ago. It will reload now so nothing gets lost.", 409);
    const list = Array.isArray(b.students) ? b.students.slice(0, 200) : bad("No students sent.");
    const seen = new Set(), students = [];
    for (const s of list) {
      const name = str(s.name, 60), code = str(s.code, 4);
      if (!name) bad("Every student needs a name.");
      if (!/^\d{4}$/.test(code)) bad(`${name}'s code needs 4 digits.`);
      if (seen.has(code)) bad(`Two students use code ${code}. Each student in a class needs a different code.`);
      seen.add(code);
      const missed = {};
      if (s.missed && typeof s.missed === "object") for (const [t, m] of Object.entries(s.missed)) missed[str(t, 40)] = m == null ? null : [...new Set((Array.isArray(m) ? m : []).map(Number).filter(n => n >= 1 && n <= 200))].sort((x, y) => x - y);
      const assigned = Array.isArray(s.assigned) ? [...new Set(s.assigned.map(x => str(x, 12)).filter(x => /^(?:[0-9K]{1,2}\.[A-Z]{1,4}|[A-Z]-[A-Z]{1,4})\.\d{1,2}[a-e]?$/.test(x)))].slice(0, 40) : [];
      const m = s.mtss && typeof s.mtss === "object" ? { tier: ["", "2", "3"].includes(String(s.mtss.tier)) ? String(s.mtss.tier) : "", goal: str(s.mtss.goal, 300), notes: str(s.mtss.notes, 2000), start: str(s.mtss.start, 10) } : null;
      const STD = /^(?:[0-9K]{1,2}\.[A-Z]{1,4}|[A-Z]-[A-Z]{1,4})\.\d{1,2}[a-e]?$/, day = v => /^\d{4}-\d{2}-\d{2}$/.test(String(v)) ? String(v) : "";
      const ip = s.ip && typeof s.ip === "object" && Array.isArray(s.ip.steps) ? { // individualized program
        start: day(s.ip.start), end: day(s.ip.end), testId: str(s.ip.testId, 40), score: Math.max(0, Math.min(100, Math.round(+s.ip.score || 0))), cut: Math.max(1, Math.min(100, Math.round(+s.ip.cut || 60))),
        status: ["active", "met", "exited", "stopped"].includes(s.ip.status) ? s.ip.status : "active", round: Math.max(1, Math.min(9, Math.round(+s.ip.round || 1))), note: str(s.ip.note, 500),
        sessions: Math.max(1, Math.min(7, Math.round(+s.ip.sessions || 3))), minutes: Math.max(5, Math.min(90, Math.round(+s.ip.minutes || 20))), exit: str(s.ip.exit, 400),
        steps: s.ip.steps.slice(0, 10).map(x => ({ std: str(x && x.std, 12), lvl: ["back", "build", "grade"].includes(x && x.lvl) ? x.lvl : "grade", for: str(x && x.for, 12) })).filter(x => STD.test(x.std)),
        hist: Array.isArray(s.ip.hist) ? s.ip.hist.slice(-10).map(h => ({ end: day(h && h.end), status: str(h && h.status, 12), got: Math.max(0, Math.min(10, +(h && h.got) || 0)), of: Math.max(0, Math.min(10, +(h && h.of) || 0)) })) : [],
      } : null;
      const scores = {};
      if (s.scores && typeof s.scores === "object") for (const [t, v] of Object.entries(s.scores).slice(0, 20)) if (v !== null && v !== "" && isFinite(+v)) scores[str(t, 40)] = Math.max(0, Math.min(100, Math.round(+v)));
      students.push({ id: s.id && /^[A-Za-z0-9]{4,20}$/.test(s.id) ? s.id : "s" + rid(8), name, code, missed, assigned, ...(m ? { mtss: m } : {}), ...(ip ? { ip } : {}), ...(Object.keys(scores).length ? { scores } : {}), sample: !!s.sample });
    }
    if (students.filter(x => x.sample).length > 3) bad("A class can have up to 3 sample students.");
    const L = license(ctx.school), realNew = students.filter(x => !x.sample).length, realOld = old.students.filter(x => !x.sample).length;
    if (L && realNew > realOld) { const other = await seatsUsed(ctx.school, c.id); if (other + realNew > L.students) bad(`${capMsg("students", L)} (${other + realOld} of ${L.students} used.)`, 402) }
    const keep = new Set(students.map(s => s.id));
    for (const s of old.students) if (!keep.has(s.id)) await del(`prog/${c.id}/${s.id}`);
    const w = await store.setJSON("roster/" + c.id, { students }, etag ? { onlyIfMatch: etag } : {});
    if (w && w.modified === false) bad("Someone else changed this class a moment ago. It will reload now so nothing gets lost.", 409);
    if (b.progs && typeof b.progs === "object") // progress sent along, e.g. when bringing in students saved on this device
      for (const [sid, p] of Object.entries(b.progs)) if (keep.has(sid) && p && typeof p === "object") await setJ(`prog/${c.id}/${sid}`, p);
    return { students, rev: w && w.etag || "" };
  };

  A.progSet = async b => {
    const ctx = await teacherCtx(b.token);
    const c = myClass(ctx, b.classId);
    const roster = (await getJ("roster/" + c.id)) || { students: [] };
    if (!roster.students.some(s => s.id === b.studentId)) bad("That student was not found.", 404);
    const tid = str(b.testId, 40);
    await mutJ(`prog/${c.id}/${b.studentId}`, all => { all = all || {}; if (b.prog == null) delete all[tid]; else all[tid] = b.prog; return all });
    return { ok: true };
  };

  /* arcade: teacher gives every student in a class bonus game tokens */
  A.gameBonus = async b => {
    const ctx = await teacherCtx(b.token);
    const c = myClass(ctx, b.classId);
    const n = Math.max(1, Math.min(5, Math.round(+b.n || 1)));
    const roster = (await getJ("roster/" + c.id)) || { students: [] };
    for (const s of roster.students) await mutJ(`prog/${c.id}/${s.id}`, all => { all = all || {}; const g = all._game || { spent: 0, bonus: 0, best: {} }; g.bonus = (g.bonus || 0) + n; all._game = g; return all });
    return { ok: true, count: roster.students.length };
  };


  A.licenseInfo = async b => { const ctx = await teacherCtx(b.token); const L = license(ctx.school); if (!L) return { license: null };
    return { license: { ...L, usedT: ctx.school.teachers.length, usedS: await seatsUsed(ctx.school) } } };
  /* site owner only: set this school's license. Needs OWNER_CODE in Netlify. */
  async function ownerCheck(b, ip) {
    if (!env.OWNER_CODE) bad("Add OWNER_CODE in Netlify first, then redeploy.", 403);
    await checkLock(ip);
    const a = Buffer.from(sha("own" + str(b.code, 200))), w = Buffer.from(sha("own" + env.OWNER_CODE));
    if (!crypto.timingSafeEqual(a, w)) { await noteFail(ip); bad("That owner code did not match.", 401) }
    await clearFail(ip);
  }
  A.ownerGet = async (b, ip) => { await ownerCheck(b, ip); const school = await loadSchool(); if (!school) bad("This site is not set up yet.", 404);
    const per = []; for (const c of school.classes) { const r = await getJ("roster/" + c.id); per.push({ name: c.name, teacher: school.teachers.find(t => t.id === c.teacherId)?.name || "", n: (r?.students || []).filter(x => !x.sample).length }) }
    return { school: school.name, license: license(school), usedT: school.teachers.length, usedS: per.reduce((a, x) => a + x.n, 0), classes: per } };
  A.ownerSet = async (b, ip) => { await ownerCheck(b, ip); const school = await loadSchool(); if (!school) bad("This site is not set up yet.", 404);
    const x = b.license || {};
    school.license = { plan: str(x.plan, 40) || "School", teachers: Math.max(1, Math.min(500, Math.round(+x.teachers || 1))), students: Math.max(1, Math.min(20000, Math.round(+x.students || 1))), expires: /^\d{4}-\d{2}-\d{2}$/.test(String(x.expires || "")) ? String(x.expires) : "", note: str(x.note, 300), updated: Date.now() };
    await saveSchool(school); return { ok: true, license: school.license } };

  /* ---------- tutors & consultants: public application, reviewed by the site admin ---------- */
  const T_STATUS = ["new", "reviewing", "interview", "approved", "contract", "signed", "active", "declined"];
  const T_TRAVEL = ["virtual", "15", "30", "60", "state"];
  const pick = (v, ok) => (Array.isArray(v) ? v : []).map(x => String(x)).filter(x => ok.includes(x));
  A.tutorApply = async (b, ip) => {
    if (str(b.website)) return { ok: true }; // honeypot: bots fill hidden fields
    const name = str(b.name, 80), email = str(b.email, 120).toLowerCase(), phone = str(b.phone, 30);
    if (name.length < 2) bad("Please enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) bad("Please enter a valid email address.");
    const county = str(b.county, 40), city = str(b.city, 60);
    if (!county) bad("Please choose your county.");
    const grades = pick(b.grades, ["3", "4", "5", "6", "7", "8", "9"]), areas = pick(b.areas, ["OA", "NBT", "NF", "MD", "G", "RP", "NS", "EE", "F", "SP", "ALG"]);
    if (!grades.length) bad("Please choose at least one grade.");
    if (!b.bgConsent) bad("Please agree to a background check. Schools require one before you work with students.");
    if (!b.agree) bad("Please confirm the information is true.");
    const k = "tapply/" + sha("tap" + (ip || "unknown")).slice(0, 24), f = (await getJ(k)) || { n: 0, t: Date.now() };
    const fresh = Date.now() - f.t > 864e5; if (!fresh && f.n >= 5) bad("You have sent several applications today. Please try again tomorrow.", 429);
    await setJ(k, { n: fresh ? 1 : f.n + 1, t: fresh ? Date.now() : f.t });
    const id = "tu" + rid(8);
    let file = null;
    if (b.file && typeof b.file === "object" && b.file.data) {
      const data = String(b.file.data), type = str(b.file.type, 100), fname = str(b.file.name, 120);
      if (data.length > 3_000_000) bad("Your résumé file is too big. Please keep it under 2 MB.");
      if (!/pdf|msword|officedocument|text\/plain/.test(type)) bad("Please upload your résumé as a PDF or Word file.");
      if (!/^[A-Za-z0-9+/=]+$/.test(data)) bad("That résumé file could not be read.");
      await setJ("tutorfile/" + id, { name: fname, type, data });
      file = { name: fname, type, size: Math.round(data.length * 0.75) };
    }
    const rec = {
      id, t: Date.now(), status: "new", note: "",
      name, email, phone, city, county, travel: T_TRAVEL.includes(String(b.travel)) ? String(b.travel) : "virtual",
      role: ["tutor", "consultant", "both"].includes(b.role) ? b.role : "tutor",
      grades, areas, license: ["ms", "other", "working", "none"].includes(b.license) ? b.license : "none",
      licenseNote: str(b.licenseNote, 120), years: Math.max(0, Math.min(60, Math.round(+b.years || 0))),
      rate: Math.max(0, Math.min(500, Math.round(+b.rate || 0))), days: pick(b.days, ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]),
      times: str(b.times, 120), about: str(b.about, 1200), bgConsent: true, file,
    };
    await mutJ("tutors", list => { list = list || []; list.unshift(rec); return list.slice(0, 2000) });
    return { ok: true };
  };
  const adminOnly = async b => { const ctx = await teacherCtx(b.token); if (!ctx.admin) bad("Only the site admin can see tutor applications.", 403); return ctx };
  A.tutorList = async b => { await adminOnly(b); return { tutors: (await getJ("tutors")) || [], contractUrl: ((await loadSchool()).contractUrl) || "" } };
  A.tutorUpdate = async b => {
    await adminOnly(b);
    let hit = null;
    await mutJ("tutors", list => { list = list || []; const r = list.find(x => x.id === b.id); if (!r) bad("That application was not found.", 404);
      if (T_STATUS.includes(b.status)) { if (r.status !== b.status) (r.log = r.log || []).push({ t: Date.now(), s: b.status }); r.status = b.status }
      if (b.note !== undefined) r.note = str(b.note, 2000);
      hit = r; return list });
    return { tutor: hit };
  };
  A.tutorFile = async b => { await adminOnly(b); const f = await getJ("tutorfile/" + str(b.id, 20)); if (!f) bad("No résumé was uploaded.", 404); return { file: f } };
  A.tutorDelete = async b => {
    await adminOnly(b); const id = str(b.id, 20);
    await mutJ("tutors", list => (list || []).filter(x => x.id !== id));
    await del("tutorfile/" + id).catch(() => {});
    return { ok: true };
  };

  /* ---------- school leads: demo requests and Founding Schools applications (public form, admin review) ---------- */
  A.leadAdd = async (b, ip) => {
    if (str(b.website)) return { ok: true }; // honeypot
    const name = str(b.name, 80), email = str(b.email, 120).toLowerCase();
    if (name.length < 2) bad("Please enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) bad("Please enter a valid email address.");
    const family = b.type === "family", org = str(b.org, 120) || (family ? "Family" : ""); if (!org) bad("Please enter your school or district.");
    const k = "tapply/" + sha("lead" + (ip || "unknown")).slice(0, 24), f = (await getJ(k)) || { n: 0, t: Date.now() };
    const fresh = Date.now() - f.t > 864e5; if (!fresh && f.n >= 6) bad("You have sent several requests today. Please try again tomorrow.", 429);
    await setJ(k, { n: fresh ? 1 : f.n + 1, t: fresh ? Date.now() : f.t });
    const rec = { id: "ld" + rid(8), t: Date.now(), status: "new", note: "", type: ["founding", "family"].includes(b.type) ? b.type : "demo", name, email, phone: str(b.phone, 30),
      role: ["teacher", "principal", "assistant", "coach", "district", "parent", "homeschool", "other"].includes(b.role) ? b.role : "other", org, county: str(b.county, 40),
      students: Math.max(0, Math.min(100000, Math.round(+b.students || 0))), grades: (Array.isArray(b.grades) ? b.grades : []).map(String).filter(x => ["3", "4", "5", "6", "7", "8", "9"].includes(x)),
      times: str(b.times, 160), message: str(b.message, 1500) };
    await mutJ("leads", list => { list = list || []; list.unshift(rec); return list.slice(0, 2000) });
    return { ok: true };
  };
  A.leadList = async b => { await adminOnly(b); return { leads: (await getJ("leads")) || [] } };
  A.leadUpdate = async b => { await adminOnly(b); let hit = null;
    await mutJ("leads", list => { list = list || []; const r = list.find(x => x.id === b.id); if (!r) bad("That request was not found.", 404);
      if (["new", "contacted", "demo", "pilot", "customer", "closed"].includes(b.status)) r.status = b.status; if (b.note !== undefined) r.note = str(b.note, 2000); hit = r; return list });
    return { lead: hit } };
  A.leadDelete = async b => { await adminOnly(b); const id = str(b.id, 20); await mutJ("leads", list => (list || []).filter(x => x.id !== id)); return { ok: true } };
  A.contractSave = async b => {
    await adminOnly(b); const u = str(b.url, 500);
    if (u && !/^https:\/\//i.test(u)) bad("Please paste a link that starts with https://");
    const school = await loadSchool(); school.contractUrl = u; await saveSchool(school); return { ok: true };
  };

  /* station plans: one saved plan per class */
  A.planGet = async b => { const ctx = await teacherCtx(b.token); const c = myClass(ctx, b.classId); return { plan: await getJ("plan/" + c.id) } };
  A.planSave = async b => {
    const ctx = await teacherCtx(b.token); const c = myClass(ctx, b.classId);
    if (!b.plan || typeof b.plan !== "object" || JSON.stringify(b.plan).length > 100000) bad("That plan could not be saved.");
    await setJ("plan/" + c.id, { ...b.plan, saved: Date.now() });
    return { ok: true };
  };

  A.join = async b => {
    const school = await loadSchool();
    const c = school?.classes.find(x => x.join === str(b.join, 8).toUpperCase());
    if (!c) bad("That class code did not match. Ask your teacher for it.", 404);
    const t = school.teachers.find(x => x.id === c.teacherId);
    return { join: c.join, name: c.name, teacher: t?.name || "" };
  };

  A.studentLogin = async (b, ip) => {
    const school = await loadSchool();
    if (!school) bad("This school is not set up yet.");
    await checkLock(ip);
    const c = school.classes.find(x => x.join === str(b.join, 8).toUpperCase());
    if (!c) bad("That class code did not match. Ask your teacher for it.", 404);
    const roster = (await getJ("roster/" + c.id)) || { students: [] };
    const st = roster.students.find(s => s.code === str(b.code, 4));
    if (!st) { await noteFail(ip); bad("That code did not match. Try again.", 401) }
    await clearFail(ip);
    return studentPayload(school, c, st, sign(school, { r: "s", id: st.id, c: c.id }));
  };
  async function studentPayload(school, c, st, token) {
    const prog = (await getJ(`prog/${c.id}/${st.id}`)) || {};
    const t = school.teachers.find(x => x.id === c.teacherId);
    return { token, cls: pubClass(c), teacher: t?.name || "", student: st, prog, test: await loadTest(c.testId), ai: !!env.ANTHROPIC_API_KEY, hidden: school.hidden || [] };
  }
  A.studentBoot = async b => { const { school, cls, st } = await studentCtx(b.token); return studentPayload(school, cls, st, b.token) };

  A.progSave = async b => {
    const { cls, st } = await studentCtx(b.token);
    const tid = str(b.testId, 40);
    if (!b.prog || typeof b.prog !== "object") bad("Nothing to save.");
    if (JSON.stringify(b.prog).length > 400000) bad("Progress is too big to save.");
    await mutJ(`prog/${cls.id}/${st.id}`, all => { all = all || {}; const old = all[tid] || {};
      all[tid] = { ...b.prog, tutor: old.tutor || b.prog.tutor };
      if (tid === "_game") { all[tid].bonus = old.bonus || 0; all[tid].spent = Math.max(+old.spent || 0, +b.prog.spent || 0) } // tokens: bonus is set by the teacher, spent never goes down
      return all }); // tutor counts are kept by the server
    return { ok: true };
  };

  /* ---------- tests ---------- */
  A.testGet = async b => {
    const school = await loadSchool();
    const p = verify(school, b.token);
    if (!p) bad("Please sign in again.", 401);
    const t = await loadTest(b.id);
    if (!t) bad("That test was not found.", 404);
    return { test: t };
  };

  A.testSave = async b => {
    const ctx = await teacherCtx(b.token), { school } = ctx;
    const t = b.test;
    if (!t || typeof t !== "object") bad("No test sent.");
    const qs = t.qs && typeof t.qs === "object" ? t.qs : bad("The test has no questions.");
    const n = Object.keys(qs).length;
    if (!n || n > 120) bad("A test needs 1 to 120 questions.");
    if (!Array.isArray(t.skills) || !t.skills.length) bad("The test has no standards.");
    if (JSON.stringify(t).length > 3_000_000) bad("This test is too big to save.");
    school.tests = school.tests || [];
    let meta = t.id ? school.tests.find(x => x.id === t.id) : null;
    if (meta && !ctx.admin && meta.ownerId && meta.ownerId !== ctx.me.id) bad("Only the teacher who made this test can change it.", 403);
    const id = meta ? meta.id : "x" + rid(8);
    const rec = { ...t, id, name: str(t.name, 80) || "My test", grade: str(t.grade, 10), ownerId: meta?.ownerId || ctx.me.id, created: meta?.created || Date.now(), updated: Date.now() };
    await setJ("test/" + id, rec);
    const m = testMeta(rec);
    if (meta) Object.assign(meta, m); else school.tests.push(m);
    await saveSchool(school);
    return { test: rec, ...boot(ctx) };
  };

  A.testDelete = async b => {
    const ctx = await teacherCtx(b.token), { school } = ctx;
    const meta = (school.tests || []).find(x => x.id === b.id);
    if (!meta) bad("That test was not found.", 404);
    if (!ctx.admin && meta.ownerId !== ctx.me.id) bad("Only the teacher who made this test can delete it.", 403);
    const used = school.classes.filter(c => c.testId === meta.id);
    if (used.length) bad(`Classes still use this test: ${used.map(c => c.name).join(", ")}. Switch them to another test first.`);
    school.tests = school.tests.filter(x => x !== meta);
    await saveSchool(school);
    await del("test/" + meta.id);
    return boot(ctx);
  };

  /* ---------- problem reports ---------- */
  A.reportAdd = async b => {
    const school = await loadSchool(), p = verify(school, b.token);
    if (!p) bad("Please sign in again.", 401);
    let who = "", classId = "";
    if (p.r === "s") { const { cls, st } = await studentCtx(b.token); who = st.name; classId = cls.id }
    else { const t = school.teachers.find(x => x.id === p.id); who = (t?.name || "Teacher") + " (teacher)"; classId = str(b.classId, 20) }
    const q = b.q && typeof b.q === "object" ? b.q : {};
    const snap = JSON.stringify(q).length < 20000 ? q : { parts: (q.parts || []).filter(x => typeof x === "string") };
    const rec = { id: "r" + rid(8), t: Date.now(), qid: str(b.qid, 80), std: str(b.std, 20), testId: str(b.testId, 40), reason: str(b.reason, 40), note: str(b.note, 500), who, classId, q: snap, status: "open" };
    await mutJ("reports", list => { list = list || []; if (p.r === "s" && list.filter(r => r.who === who && r.t > Date.now() - 864e5).length >= 10) bad("Thanks! You already sent a lot of reports today.", 429); list.unshift(rec); return list.slice(0, 500) });
    return { ok: true };
  };
  A.reportList = async b => {
    const ctx = await teacherCtx(b.token), mine = new Set(ctx.school.classes.filter(c => ctx.admin || c.teacherId === ctx.me.id).map(c => c.id));
    const list = (await getJ("reports")) || [];
    return { reports: list.filter(r => ctx.admin || mine.has(r.classId)) };
  };
  A.reportUpdate = async b => {
    const ctx = await teacherCtx(b.token), mine = new Set(ctx.school.classes.filter(c => ctx.admin || c.teacherId === ctx.me.id).map(c => c.id));
    let hit = null;
    await mutJ("reports", list => { list = list || []; const r = list.find(x => x.id === b.id); if (!r) bad("That report was not found.", 404); if (!ctx.admin && !mine.has(r.classId)) bad("That report is not for your classes.", 403); r.status = ["open", "fixed", "dismissed", "hidden"].includes(b.status) ? b.status : r.status; hit = r; return list });
    if (b.status === "hidden" && hit.qid && !hit.qid.startsWith("~")) {
      const school = await loadSchool(); school.hidden = [...new Set([...(school.hidden || []), hit.testId + "|" + hit.qid])].slice(-2000); await saveSchool(school);
    }
    return { ok: true };
  };

  /* ---------- backups ---------- */
  A.backupNow = async b => { const ctx = await teacherCtx(b.token); if (!ctx.admin) bad("Only a school admin can make backups.", 403); return { key: await snapshot() } };
  A.backupList = async b => { const ctx = await teacherCtx(b.token); if (!ctx.admin) bad("Only a school admin can see backups.", 403); return { backups: (await listKeys("backup/")).sort().reverse() } };
  A.backupGet = async b => { const ctx = await teacherCtx(b.token); if (!ctx.admin) bad("Only a school admin can download backups.", 403); const k = str(b.key, 60); if (!k.startsWith("backup/")) bad("That backup was not found.", 404); const d = await getJ(k); if (!d) bad("That backup was not found.", 404); return { backup: d } };
  A.schoolExport = async b => { const ctx = await teacherCtx(b.token); if (!ctx.admin) bad("Only a school admin can export the school.", 403); return { backup: await collect() } };
  A.backupRestore = async b => {
    const ctx = await teacherCtx(b.token); if (!ctx.admin) bad("Only a school admin can restore a backup.", 403);
    if (b.confirm !== "RESTORE") bad("Type RESTORE to confirm.");
    const d = b.backup && typeof b.backup === "object" ? b.backup : await getJ(str(b.key, 60));
    if (!d || !d.data || !d.data.school) bad("That backup could not be read.");
    await snapshot("before-restore");
    const keep = new Set(Object.keys(d.data));
    for (const k of await listKeys("")) if (!/^(backup|fail|tutorfile|tapply)\//.test(k) && !keep.has(k)) await del(k);
    for (const [k, v] of Object.entries(d.data)) await setJ(k, v);
    return { ok: true, restored: keep.size };
  };
  async function collect() {
    const data = {};
    for (const k of await listKeys("")) if (!/^(backup|fail|tutorfile|tapply)\//.test(k)) data[k] = await getJ(k); // résumé files are kept out of backups
    return { v: 1, made: Date.now(), data };
  }
  async function snapshot(tag) {
    const d = await collect(), key = `backup/${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}${tag ? "-" + tag : ""}`;
    await setJ(key, d);
    const all = (await listKeys("backup/")).sort();
    for (const k of all.slice(0, Math.max(0, all.length - 21))) await del(k); // keep the newest 21
    return key;
  }

  /* ---------- AI: tutor ---------- */
  A.tutor = async b => {
    const school = await loadSchool();
    const p = verify(school, b.token);
    if (!p) bad("Please sign in again.", 401);
    let who = "", grade = b.grade || "", progKey = null, tid = str(b.testId, 40) || "a1";
    if (p.r === "s") {
      const { cls, st } = await studentCtx(b.token);
      if (cls.tutor === false) bad("Your teacher turned the tutor off for now.", 403);
      who = st.name.replace(/\s*\(sample\)/, "");
      progKey = `prog/${cls.id}/${st.id}`;
      const LIMIT = +env.TUTOR_DAILY_LIMIT || 40;
      await mutJ(progKey, all => {
        all = all || {}; const pr = all[tid] || (all[tid] = {});
        const u = pr.tutor && pr.tutor.day === today() ? pr.tutor : { day: today(), n: 0, total: pr.tutor?.total || 0 };
        if (u.n >= LIMIT) bad(`You asked Scout ${LIMIT} questions today. Great work! Ask your teacher if you still need help.`, 429);
        u.n++; u.total = (u.total || 0) + 1; pr.tutor = u; return all;
      });
    }
    const q = b.q || {};
    const L = "ABCDE";
    const qText = [
      ...(q.parts || []).map(x => typeof x === "string" ? x : x.eq ? x.eq : x.table ? "Table: " + x.table.map(r => r.join(" | ")).join("; ") : x.fig ? "Picture: " + x.fig : x.groups ? `Picture: ${x.groups[0]} groups with ${x.groups[1]} in each` : x.arr ? `Picture: an array with ${x.arr[0]} rows of ${x.arr[1]}` : x.img ? "Picture: " + (x.alt || "a picture from the test") : ""),
      ...(q.choices || []).map((c, i) => `${L[i]}. ${typeof c === "string" ? c : c.eq || (c.table ? c.table.map(r => r.join(" | ")).join("; ") : c.groups ? `${c.groups[0]} groups of ${c.groups[1]}` : c.alt || "a picture")}`),
    ].filter(Boolean).join("\n");
    const answered = !!b.result;
    const ctxText = `THE QUESTION (${q.std || ""} ${q.skillName || ""}):\n${qText}\n\nCorrect answer: ${Array.isArray(q.ans) ? q.ans.join(" and ") : q.ans}${q.type === "multi" ? " (pick two)" : ""}.\n` +
      (q.steps?.length ? `Teacher's solution steps: ${q.steps.map(s => s.say).join(" ")}\n` : "") +
      (answered ? `The student already answered ${b.picked || "(blank)"} and was ${b.result === "right" ? "RIGHT" : "WRONG"}. You may now explain the answer.` :
        "The student has NOT answered yet. Do not tell them the answer or which choice is right. Give hints and ask guiding questions.");
    const msgs = (Array.isArray(b.messages) ? b.messages : []).slice(-12).map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: str(m.content, 600) || "…" }));
    if (!msgs.length || msgs[0].role !== "user") msgs.unshift({ role: "user", content: "Hi Scout, can you help me with this question?" });
    // merge back-to-back turns from the same side
    const merged = []; for (const m of msgs) { const last = merged[merged.length - 1]; if (last && last.role === m.role) last.content += "\n" + m.content; else merged.push({ ...m }) }
    if (merged[merged.length - 1].role !== "user") merged.push({ role: "user", content: "Can you help me more?" });
    const lang = b.lang === "es" ? "\nThe student is learning English. Reply in simple Spanish, and give key math words in English too, like \"multiplicar (multiply)\"." : "";
    const reply = await claude({ model: FAST(), system: TUTOR_SYS(grade, who) + lang + "\n\n" + ctxText, messages: merged, max_tokens: 300 });
    return { reply: reply.trim() };
  };

  /* ---------- AI: read a test PDF page ---------- */
  A.aiParse = async b => {
    await teacherCtx(b.token);
    const pdf = str(b.pdf, 6_000_000);
    if (!pdf) bad("No page was sent.");
    const sys = `You turn printed math tests into data for a practice app. ${FORMAT}`;
    const prompt = `This is page ${b.page || 1} of ${b.of || 1} of a ${b.grade ? "grade " + b.grade + " " : ""}math test.
Find every test question on THIS page. Keep each question's number as printed. Copy the words exactly, but leave out instructions like "Fill in the bubble".
For each question give: n, std (the Common Core standard code that fits best, like "3.OA.3"), skill (a short kid-friendly name for that standard, the SAME name every time for the same standard), type, parts, choices, ans.
For "ans": if the page shows an answer key or a marked answer, use it and set "ansFrom": "key". Otherwise solve it carefully yourself and set "ansFrom": "solved".
If a question has a picture you can draw with the allowed items (table, arr, groups), use them. Otherwise describe it with {"fig": "..."} so a student who cannot see it still knows what it shows.
If the page has a question that continues from the previous page, or an answer key, include what you can.
Leave out keys, steps, and why for now.
Reply with JSON only: {"questions": [ ... ], "answerKey": {"1":"B", ...} (only if this page is an answer key, else {})}`;
    const t = await claude({
      model: SMART(), system: sys, max_tokens: 6000,
      messages: [{ role: "user", content: [{ type: "document", source: { type: "base64", media_type: "application/pdf", data: pdf } }, { type: "text", text: prompt }] }],
    });
    const d = jsonOut(t);
    return { questions: Array.isArray(d.questions) ? d.questions : [], answerKey: d.answerKey && typeof d.answerKey === "object" ? d.answerKey : {} };
  };

  /* ---------- AI: add key words, steps, and why-wrong to questions ---------- */
  A.aiEnrich = async b => {
    await teacherCtx(b.token);
    const qs = (Array.isArray(b.questions) ? b.questions : []).slice(0, 4);
    if (!qs.length) bad("No questions sent.");
    const t = await claude({
      model: FAST(), max_tokens: 6000,
      system: `You write step-by-step breakdowns for a ${b.grade ? "grade " + b.grade + " " : ""}math practice app. ${FORMAT}`,
      messages: [{ role: "user", content: `For each question below, keep n, std, skill, type, parts, choices and ans exactly the same, and add "keys", "steps", and "why" (or "whyElse" and "whyIn" for input questions). The correct answer is given in "ans": your steps must end at that answer.\n\n${JSON.stringify(qs)}\n\nReply with JSON only: {"questions": [ ... ]}` }],
    });
    const d = jsonOut(t);
    return { questions: Array.isArray(d.questions) ? d.questions : [] };
  };

  /* ---------- AI: new practice questions for one standard ---------- */
  A.aiReteach = async b => {
    await teacherCtx(b.token);
    const t = await claude({
      model: FAST(), max_tokens: 900,
      system: "You are an expert grade 3 math teacher coach. You write short, practical small-group reteach plans for a teacher station. Plain text, no markdown headings.",
      messages: [{ role: "user", content: `Write a 5-minute reteach plan for a small group working on ${str(b.std, 20)} (${str(b.name, 80)}).
The mistake most of them make: "${str(b.mistake, 300) || "not known yet"}".
What students should be able to do: ${str(b.goal, 400)}.
Use only a pencil, paper, and a whiteboard (no colored materials). Give: 1) a one-sentence goal, 2) a quick warm-up question, 3) three short teaching moves with exact teacher words, 4) one check-for-understanding question with its answer. Keep it under 170 words.` }],
    });
    return { plan: t.trim() };
  };

  A.aiPractice = async b => {
    await teacherCtx(b.token);
    const n = Math.max(1, Math.min(4, +b.n || 3));
    const ex = (Array.isArray(b.examples) ? b.examples : []).slice(0, 3);
    const t = await claude({
      model: FAST(), max_tokens: 7000,
      system: `You write practice questions for a ${b.grade ? "grade " + b.grade + " " : ""}math app. ${FORMAT}`,
      messages: [{ role: "user", content: `Write ${n} NEW practice questions for standard ${str(b.std, 20)} (${str(b.skill, 80)}). Match the style, format, and difficulty of these test questions, but use new numbers, names, and objects. Mix up which letter is correct. Each one must be fully complete: parts, choices, ans, keys, steps, why. Do not use {"fig"} pictures. Double-check every answer.\n\nTest questions:\n${JSON.stringify(ex)}\n\nReply with JSON only: {"questions": [ ... ]}` }],
    });
    const d = jsonOut(t);
    return { questions: Array.isArray(d.questions) ? d.questions : [] };
  };

  /* ---------- router ---------- */
  handle.snapshot = () => snapshot("auto");
  return handle;
  async function handle(req, ip) {
    if (req.method !== "POST") return fail("Use POST.", 405);
    const action = new URL(req.url).pathname.replace(/^\/api\/?/, "").replace(/\/$/, "");
    const fn = Object.prototype.hasOwnProperty.call(A, action) ? A[action] : null;
    if (!fn) return fail("Unknown action.", 404);
    let body = {};
    try { body = await req.json() } catch { body = {} }
    try {
      for (let i = 0; ; i++) {
        try { return ok(await fn(body, ip)) }
        catch (e) { if (e instanceof Conflict && i < 4) { await new Promise(r => setTimeout(r, 40 + Math.random() * 160)); continue } throw e }
      }
    }
    catch (e) {
      if (e instanceof Conflict) return fail("The server was busy saving. Please try again.", 409);
      if (e instanceof HttpErr) return fail(e.message, e.status);
      console.error(e);
      return fail("Something went wrong on the server. Try again.", 500);
    }
  };
}
