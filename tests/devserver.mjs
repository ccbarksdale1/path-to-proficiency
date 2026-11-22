// Local dev server: serves public/ and runs the real API (router + core) against in-memory storage.
// Run: node tests/devserver.mjs [port] [--multi]     e.g. node tests/devserver.mjs 8790 --multi
// Data lives only in memory and is gone when the server stops. OWNER_CODE is "owner-dev" unless you set it.
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { makeRouter } from "../netlify/functions/api/router.mjs";

const ROOT = fileURLToPath(new URL("../public/", import.meta.url));
const port = +process.argv.find(a => /^\d+$/.test(a)) || 8790;
const multi = process.argv.includes("--multi");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".woff2": "font/woff2", ".json": "application/json", ".txt": "text/plain" };

const stores = new Map();
function memoryStore() {
  const M = new Map(); let n = 0;
  return {
    async get(k, o) { return M.has(k) ? structuredClone(M.get(k).v) : null },
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
const getStore = name => { if (!stores.has(name)) stores.set(name, memoryStore()); return stores.get(name) };
const env = { ...process.env, OWNER_CODE: process.env.OWNER_CODE || "owner-dev", ...(multi ? { MULTI_DISTRICT: "on" } : { MULTI_DISTRICT: "" }) };

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname.startsWith("/api/")) {
    const chunks = []; for await (const c of req) chunks.push(c);
    const r = await makeRouter({ getStore, env }).handle(new Request(url, { method: req.method, headers: req.headers, body: req.method === "POST" ? Buffer.concat(chunks) : undefined }), "127.0.0.1");
    res.writeHead(r.status, { "content-type": "application/json" }); res.end(await r.text()); return;
  }
  let p = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
  if (p.startsWith("/home/") && !extname(p)) p = "/home/index.html"; // same as the netlify.toml rule
  let file = join(ROOT, p);
  try { if ((await stat(file)).isDirectory()) file = join(file, "index.html"); const body = await readFile(file); res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" }); res.end(body) }
  catch { res.writeHead(404); res.end("not found") }
}).listen(port, () => console.log(`Path to Proficiency dev server on http://localhost:${port} (${multi ? "multi-district" : "single school"})`));
