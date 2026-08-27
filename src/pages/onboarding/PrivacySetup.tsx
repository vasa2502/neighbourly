import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowRight, ArrowLeft, Lock, Info } from "lucide-react";
import { useUpdateProfile } from "@/hooks/useCommunityData";
import { toast } from "sonner";

const steps = ["Account", "Verification", "Profile", "Interests", "Community"];

const privacyOptions = [
  { id: "profile_visibility", label: "Profile visibility", description: "Who can see your profile", options: ["Community only", "Verified residents", "No one"] },
  { id: "building_visibility", label: "Building / Tower", description: "Show your building to others", options: ["Visible to verified residents", "Visible to community", "Hidden"] },
  { id: "activity_history", label: "Activity history", description: "Show activities you've joined", options: ["Visible to participants", "Community only", "Hidden"] },
  { id: "interests_visibility", label: "Interests", description: "Show your interests", options: ["Community only", "Verified residents", "Hidden"] },
  { id: "sports_visibility", label: "Sports", description: "Show your sports & skill levels", options: ["Community only", "Verified residents", "Hidden"] },
  { id: "messaging", label: "Who can message you", description: "Direct message permissions", options: ["Community members", "Verified residents", "Nobody"] },
];

export default function OnboardingPrivacy() {
  const [settings, setSettings] = useState<Record<string, number>>({
    profile_visibility: 0,
    building_visibility: 0,
    activity_history: 0,
    interests_visibility: 0,
    sports_visibility: 0,
    messaging: 0,
  });
  const navigate = useNavigate();
  const updateProfile = useUpdateProfile();

  const handleContinue = async () => {
    try {
      await updateProfile.mutateAsync({ privacy: settings });
      navigate("/onboarding/complete");
    } catch {
      toast.error("Failed to save privacy settings");
      navigate("/onboarding/complete");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-lg">
        <Reveal>
          <div className="text-center mb-8">
            <Logo size="md" className="justify-center mb-4" />
            <div className="flex items-center justify-center gap-2 mb-6">
              {steps.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full text-[10px] font-bold flex items-center justify-center ${i < 4 ? "bg-[hsl(155,45%,32%)]/20 text-[hsl(155,45%,32%)]" : "bg-[hsl(155,45%,32%)] text-white"}`}>{i < 4 ? "✓" : i + 1}</div>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider hidden sm:inline ${i === 4 ? "text-[hsl(155,45%,32%)]" : "text-muted-foreground"}`}>{s}</span>
                  {i < steps.length - 1 && <div className="w-6 h-px bg-border" />}
                </div>
              ))}
            </div>
            <h1 className="text-2xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground mb-2">Privacy settings</h1>
            <p className="text-sm text-muted-foreground">Control what other residents can see about you. Your information is intentionally minimized.</p>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="bg-[hsl(210,50%,92%)] rounded-xl p-4 flex items-start gap-3 mb-6">
            <Info className="w-5 h-5 text-[hsl(210,55%,42%)] shrink-0 mt-0.5" />
            <p className="text-xs text-[hsl(210,45%,35%)] leading-relaxed">JOINN is designed to minimize residential information. You can always change these settings later.</p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="space-y-4 mb-8">
            {privacyOptions.map((opt) => (
              <div key={opt.id} className="bg-card border border-border/40 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="w-4 h-4 text-[hsl(155,45%,32%)]" />
                  <p className="font-semibold text-sm text-foreground">{opt.label}</p>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{opt.description}</p>
                <div className="flex flex-wrap gap-2">
                  {opt.options.map((o, idx) => (
                    <button key={o} type="button" onClick={() => setSettings(prev => ({ ...prev, [opt.id]: idx }))} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${settings[opt.id] === idx ? "bg-[hsl(155,45%,32%)] text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{o}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-full h-12" onClick={() => navigate("/onboarding/availability")}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
            <Button className="flex-1 bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full h-12" onClick={handleContinue} disabled={updateProfile.isPending}>Continue <ArrowRight className="w-4 h-4 ml-2" /></Button>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
