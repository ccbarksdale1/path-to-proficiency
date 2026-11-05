// Nightly backup: copies every class, student, test, and plan into one snapshot (the newest 21 are kept).
import { getStore } from "@netlify/blobs";
import { makeApi } from "./api/core.mjs";

export default async () => {
  const api = makeApi({ store: getStore({ name: "p2p", consistency: "strong" }), env: process.env });
  const key = await api.snapshot();
  console.log("backup saved", key);
};

export const config = { schedule: "@daily" };
