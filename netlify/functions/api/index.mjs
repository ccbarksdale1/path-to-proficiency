import { getStore } from "@netlify/blobs";
import { makeApi } from "./core.mjs";

let handle;
export default async (req, context) => {
  handle ||= makeApi({ store: getStore({ name: "p2p", consistency: "strong" }), env: process.env });
  return handle(req, context.ip || req.headers.get("x-nf-client-connection-ip") || "");
};

export const config = { path: "/api/*" };
