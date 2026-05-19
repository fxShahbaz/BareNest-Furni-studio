"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type ChatTurn = {
  role: "bot" | "user";
  content: string;
  at: string; // ISO
};

export type ChatSubmitState =
  | {
      ok?: boolean;
      error?: string;
    }
  | undefined;

const PHONE_RE = /^(?:\+?91[\s-]?|0)?[6-9]\d{9}$/;
const MAX_LEN = 600;

export async function submitChat(payload: {
  name: string;
  phone: string;
  topic?: string;
  message?: string;
  transcript: ChatTurn[];
}): Promise<ChatSubmitState> {
  const name = (payload.name ?? "").trim();
  const phoneRaw = (payload.phone ?? "").trim().replace(/[\s-]/g, "");
  const topic = (payload.topic ?? "").trim() || null;
  const message = (payload.message ?? "").trim().slice(0, MAX_LEN) || null;

  if (!name || name.length < 2) return { error: "Please share your name." };
  if (!PHONE_RE.test(phoneRaw)) {
    return { error: "Enter a valid 10-digit Indian mobile number." };
  }
  if (!Array.isArray(payload.transcript) || payload.transcript.length === 0) {
    return { error: "Chat is empty." };
  }

  // Trim transcript to a sane upper bound so a runaway client can't bloat
  // a single row. Each turn is small text.
  const transcript = payload.transcript.slice(0, 50).map((t) => ({
    role: t.role === "user" ? "user" : "bot",
    content: String(t.content ?? "").slice(0, MAX_LEN),
    at: t.at || new Date().toISOString(),
  }));

  const admin = supabaseAdmin();
  const { error } = await admin.from("chat_messages").insert({
    name,
    phone: phoneRaw,
    topic,
    message,
    transcript,
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/messages");
  return { ok: true };
}
