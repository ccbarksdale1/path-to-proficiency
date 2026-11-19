import { getStore } from "@netlify/blobs";
import { makeApi } from "./core.mjs";

/* A fresh store (and API) for every request: Netlify Blobs' access token comes from the current
   request's environment and expires, so a store kept on a warm instance starts failing with
   "Token expired". Building the API is cheap (no I/O). */
export default async (req, context) => {
  const handle = makeApi({ store: getStore({ name: "p2p", consistency: "strong" }), env: process.env });
  return handle(req, context.ip || req.headers.get("x-nf-client-connection-ip") || "");
};

export const config = { path: "/api/*" };
