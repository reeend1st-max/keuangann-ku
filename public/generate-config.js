// scripts/generate-config.js
//
// Runs during the Vercel build step (see package.json "build" script and
// vercel.json "buildCommand"). Reads SUPABASE_URL and SUPABASE_ANON_KEY from
// the environment and writes them into public/config.js as a small global
// object the frontend reads on startup.
//
// The Supabase "anon" key is designed to be public — it is safe to ship to
// the browser. Actual data protection comes from Row Level Security (RLS)
// policies defined in supabase/schema.sql, enforced by Postgres itself.
// We still generate this file at build time (instead of hardcoding it in
// the repo) so the same codebase can point at different Supabase projects
// (e.g. staging vs production) purely via environment variables.

const fs = require("fs");
const path = require("path");

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    "\n⚠️  WARNING: SUPABASE_URL and/or SUPABASE_ANON_KEY environment " +
    "variables are not set.\n" +
    "   The app will build, but will show a config error when opened.\n" +
    "   Set these in your Vercel project settings (Settings → Environment " +
    "Variables) and redeploy.\n"
  );
}

const outPath = path.join(__dirname, "..", "public", "config.js");

const contents =
  "// AUTO-GENERATED at build time by scripts/generate-config.js — do not edit by hand.\n" +
  "window.__SUPABASE_CONFIG__ = " +
  JSON.stringify({ url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY }, null, 2) +
  ";\n";

fs.writeFileSync(outPath, contents, "utf8");
console.log("✅ Generated public/config.js");
console.log("   SUPABASE_URL:", SUPABASE_URL ? SUPABASE_URL.replace(/\/\/.*@/, "//<hidden>@") || SUPABASE_URL : "(not set)");
console.log("   SUPABASE_ANON_KEY:", SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.slice(0, 12) + "..." : "(not set)");
