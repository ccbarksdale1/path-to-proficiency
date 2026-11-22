// Nightly backup: copies every class, student, test, and plan into one snapshot (the newest 21 are kept).
// With MULTI_DISTRICT=on, each district's store gets its own snapshot.
import { getStore } from "@netlify/blobs";
import { makeRouter } from "./api/router.mjs";

export default async () => {
  const router = makeRouter({ getStore: name => getStore({ name, consistency: "strong" }), env: process.env });
  const keys = await router.snapshots();
  console.log("backup saved", keys.join(", "));
};

export const config = { schedule: "@daily" };
