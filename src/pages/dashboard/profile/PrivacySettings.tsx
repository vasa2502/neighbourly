import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowLeft, Lock, Info, Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/useCommunityData";
import { useUpdateProfile } from "@/hooks/useCommunityData";
import { toast } from "sonner";

const options = [
  { id: "profile", label: "Profile visibility", desc: "Who can see your profile", choices: ["Community only", "Verified residents", "No one"] },
  { id: "building", label: "Building / Tower", desc: "Show your building to others", choices: ["Visible", "Hidden"] },
  { id: "activity", label: "Activity history", desc: "Show activities you've joined", choices: ["Visible", "Hidden"] },
  { id: "interests", label: "Interests", desc: "Show your interests", choices: ["Community only", "Hidden"] },
  { id: "sports", label: "Sports", desc: "Show your sports & skill levels", choices: ["Community only", "Hidden"] },
  { id: "messaging", label: "Who can message you", desc: "Direct message permissions", choices: ["Community members", "Verified residents", "Nobody"] },
];

export default function PrivacySettings() {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();

  const [settings, setSettings] = useState<Record<string, number>>(() => {
    const s: Record<string, number> = {};
    const saved = profile?.privacy || {};
    options.forEach(o => { s[o.id] = saved[o.id] ?? 0; });
    return s;
  });

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({ privacy: settings });
      toast.success("Privacy settings saved");
    } catch {
      toast.error("Failed to save settings");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <Link to="/dashboard/settings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="w-4 h-4" /> Back</Link>
        <h1 className="text-2xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground mb-2">Privacy Settings</h1>
        <p className="text-sm text-muted-foreground mb-6">Control what other residents can see about you.</p>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="bg-[hsl(210,50%,92%)] rounded-xl p-4 flex items-start gap-3 mb-6">
          <Info className="w-5 h-5 text-[hsl(210,55%,42%)] shrink-0 mt-0.5" />
          <p className="text-xs text-[hsl(210,45%,35%)] leading-relaxed">JOINN is designed to minimize residential information. These settings let you control exactly what's visible.</p>
        </div>
      </Reveal>

      <div className="space-y-4">
        {options.map((opt, i) => (
          <Reveal key={opt.id} delay={i * 0.04}>
            <Card className="border-border/40 shadow-sm rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="w-4 h-4 text-[hsl(155,45%,32%)]" />
                  <p className="font-semibold text-sm text-foreground">{opt.label}</p>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{opt.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {opt.choices.map((c, ci) => (
                    <button key={c} type="button" onClick={() => setSettings(p => ({ ...p, [opt.id]: ci }))} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${settings[opt.id] === ci ? "bg-[hsl(155,45%,32%)] text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{c}</button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>

      <div className="mt-6">
        <Button onClick={handleSave} disabled={updateProfile.isPending} className="w-full bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full h-12">
          {updateProfile.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Privacy Settings"}
        </Button>
      </div>
    </div>
  );
}
