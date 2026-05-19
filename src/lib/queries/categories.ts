import "server-only";
import { supabaseServer } from "@/lib/supabase/server";

export type Category = {
  slug: string;
  label: string;
};

export async function getAllCategories(): Promise<Category[]> {
  const supabase = await supabaseServer();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("categories")
    .select("slug,label")
    .order("label", { ascending: true });

  if (error || !data) return [];
  return data as Category[];
}
