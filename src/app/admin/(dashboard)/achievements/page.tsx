import { AchievementFormDialog } from "@/components/admin/achievement-form-dialog";
import { AchievementTable } from "@/components/admin/achievement-table";
import { listAchievements } from "@/lib/actions/achievements";

export default async function AdminAchievementsPage() {
  const entries = await listAchievements();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Achievements</h1>
          <p className="mt-1 text-sm text-foreground/60">{entries.length} total</p>
        </div>
        <AchievementFormDialog />
      </div>

      <AchievementTable entries={entries} />
    </div>
  );
}
