// One-shot: create (or update) an admin user and add them to public.owners.
// Run via:
//   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='…' \
//     node --env-file=.env.local scripts/create-admin.mjs
//
// Idempotent. Safe to re-run (password is reset, owner row is upserted).

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}
if (!email || !password) {
  console.error("Missing ADMIN_EMAIL or ADMIN_PASSWORD.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// 1. Find or create the auth user.
const { data: list, error: listErr } = await supabase.auth.admin.listUsers({
  page: 1,
  perPage: 1000,
});
if (listErr) {
  console.error("Failed to list users:", listErr.message);
  process.exit(1);
}

let user = list.users.find(
  (u) => u.email?.toLowerCase() === email.toLowerCase()
);

if (user) {
  console.log(`User ${email} already exists (id: ${user.id}).`);
  const { error: updErr } = await supabase.auth.admin.updateUserById(user.id, {
    password,
    email_confirm: true,
  });
  if (updErr) {
    console.error("Failed to update password:", updErr.message);
    process.exit(1);
  }
  console.log("→ password reset, email confirmed.");
} else {
  const { data: created, error: createErr } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
  if (createErr) {
    console.error("Failed to create user:", createErr.message);
    process.exit(1);
  }
  user = created.user;
  console.log(`Created user ${email} (id: ${user.id}).`);
}

// 2. Insert into owners (idempotent).
const { error: ownerErr } = await supabase
  .from("owners")
  .upsert({ user_id: user.id }, { onConflict: "user_id" });

if (ownerErr) {
  if (ownerErr.message.includes("relation") && ownerErr.message.includes("owners")) {
    console.error(
      "\nThe 'owners' table doesn't exist yet. Apply supabase/02_admin_storage.sql in the SQL Editor first."
    );
  } else {
    console.error("Failed to upsert owner:", ownerErr.message);
  }
  process.exit(1);
}

console.log(`\n✓ ${email} is now an owner.`);
