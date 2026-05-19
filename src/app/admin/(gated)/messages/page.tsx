import { supabaseAdmin } from "@/lib/supabase/admin";
import MessagesManager, {
  type ChatMessageRow,
} from "@/components/admin/messages-manager";

export default async function AdminMessagesPage() {
  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("chat_messages")
    .select("id,name,phone,topic,message,transcript,status,created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return <p className="text-sm text-rust">{error.message}</p>;
  const messages = (data ?? []) as ChatMessageRow[];

  return <MessagesManager messages={messages} />;
}
