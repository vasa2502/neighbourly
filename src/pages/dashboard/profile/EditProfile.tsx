import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowLeft, Camera, Info, Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/useCommunityData";
import { useUpdateProfile } from "@/hooks/useCommunityData";
import { toast } from "sonner";

export default function EditProfile() {
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();

  const [form, setForm] = useState({
    name: profile?.name || "",
    bio: profile?.bio || "",
    building: profile?.building || "",
  });

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync(form);
      toast.success("Profile updated!");
      navigate("/dashboard/profile");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <Link to="/dashboard/profile" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="w-4 h-4" /> Back to Profile</Link>
        <h1 className="text-2xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground mb-6">Edit Profile</h1>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
              {profile?.avatar ? (
                <img src={profile.avatar} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-muted-foreground">{form.name.split(" ").map(n => n[0]).join("").slice(0, 2) || "RS"}</span>
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[hsl(155,45%,32%)] text-white flex items-center justify-center shadow-md"><Camera className="w-4 h-4" /></button>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <Card className="border-border/40 shadow-sm rounded-2xl mb-6">
          <CardContent className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Full name</label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="rounded-xl h-11" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Bio</label>
              <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(155,45%,32%)]" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Building / Tower</label>
              <Input value={form.building} onChange={e => setForm(p => ({ ...p, building: e.target.value }))} className="rounded-xl h-11" placeholder="e.g. Tower A" />
            </div>
          </CardContent>
        </Card>
      </Reveal>

      <Reveal delay={0.15}>
        <div className="bg-[hsl(155,45%,92%)] rounded-xl p-4 flex items-start gap-3 mb-6">
          <Info className="w-5 h-5 text-[hsl(155,45%,32%)] shrink-0 mt-0.5" />
          <p className="text-xs text-[hsl(155,45%,32%)] leading-relaxed">Your profile is visible to verified residents. Control visibility in privacy settings.</p>
        </div>
      </Reveal>

      <Reveal delay={0.2}>
        <Button onClick={handleSave} disabled={updateProfile.isPending} className="w-full bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full h-12">
          {updateProfile.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Changes"}
        </Button>
      </Reveal>
    </div>
  );
}
