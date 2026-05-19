import { getSettingsAdmin } from "@/lib/queries/settings";
import SettingsForm from "@/components/admin/settings-form";

export default async function AdminSettingsPage() {
  const settings = await getSettingsAdmin();
  return <SettingsForm initial={settings} />;
}
