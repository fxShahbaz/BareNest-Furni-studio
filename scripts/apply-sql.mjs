// Apply a SQL file to the Supabase project via the Management API.
// Usage: PAT=sbp_... PROJECT=ref node scripts/apply-sql.mjs path/to/file.sql

import { readFileSync } from "node:fs";

const pat = process.env.SUPABASE_PAT;
const project = process.env.SUPABASE_PROJECT_REF;
const filePath = process.argv[2];

if (!pat || !project) {
  console.error("Need SUPABASE_PAT and SUPABASE_PROJECT_REF env vars.");
  process.exit(1);
}
if (!filePath) {
  console.error("Pass the SQL file path as the first arg.");
  process.exit(1);
}

const sql = readFileSync(filePath, "utf8");
console.log(`→ Applying ${filePath} (${sql.length} bytes)`);

const res = await fetch(
  `https://api.supabase.com/v1/projects/${project}/database/query`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${pat}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  }
);

const text = await res.text();
if (!res.ok) {
  console.error(`HTTP ${res.status}: ${text}`);
  process.exit(1);
}
console.log(`✓ ${filePath} applied. Response: ${text.slice(0, 200)}`);
