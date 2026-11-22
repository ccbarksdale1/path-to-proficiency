import { getStore } from "@netlify/blobs";
import { makeRouter } from "./router.mjs";

/* A fresh store (and API) for every request: Netlify Blobs' access token comes from the current
   request's environment and expires, so a store kept on a warm instance starts failing with
   "Token expired". Building the API is cheap (no I/O).
   With MULTI_DISTRICT unset, the router sends everything to the one "p2p" store, exactly as before. */
export default async (req, context) => {
  const router = makeRouter({ getStore: name => getStore({ name, consistency: "strong" }), env: process.env });
  return router.handle(req, context.ip || req.headers.get("x-nf-client-connection-ip") || "");
};

export const config = { path: "/api/*" };
