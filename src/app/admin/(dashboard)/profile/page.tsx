import { ProfileForm } from "@/components/admin/profile-form";
import { getProfile } from "@/lib/actions/profile";

export default async function AdminProfilePage() {
  const profile = await getProfile();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Profile</h1>
      <p className="mt-1 text-sm text-foreground/60">
        This powers your hero section, about text, and contact links.
      </p>
      <div className="mt-8">
        <ProfileForm profile={profile} />
      </div>
    </div>
  );
}
