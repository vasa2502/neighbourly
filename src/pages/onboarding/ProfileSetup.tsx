import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowRight, ArrowLeft, User, Camera, Info } from "lucide-react";

const steps = ["Account", "Verification", "Profile", "Interests", "Community"];
const buildings = ["Tower A", "Tower B", "Tower C", "Tower D", "Tower E", "Villa Block"];

export default function OnboardingProfile() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [building, setBuilding] = useState("");
  const [saving, setSaving] = useState(false);

  const handleContinue = async () => {
    if (!name.trim()) { toast.error("Please enter your name"); return; }
    setSaving(true);
    try {
      const { updateProfile } = await import("@/lib/api");
      const { useAuth } = await import("@/contexts/AuthContext");
      // We can't call hooks here, so use supabase directly
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await updateProfile(user.id, { name, bio, building } as any);
      }
      toast.success("Profile saved!");
      navigate("/onboarding/interests");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save profile");
    } finally {
      setSaving(false);
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
                  <div className={`w-7 h-7 rounded-full text-[10px] font-bold flex items-center justify-center ${i === 2 ? "bg-[hsl(155,45%,32%)] text-white" : i < 2 ? "bg-[hsl(155,45%,32%)]/20 text-[hsl(155,45%,32%)]" : "bg-muted text-muted-foreground"}`}>{i < 2 ? "✓" : i + 1}</div>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider hidden sm:inline ${i === 2 ? "text-[hsl(155,45%,32%)]" : "text-muted-foreground"}`}>{s}</span>
                  {i < steps.length - 1 && <div className="w-6 h-px bg-border" />}
                </div>
              ))}
            </div>
            <h1 className="text-2xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground mb-2">Set up your profile</h1>
            <p className="text-sm text-muted-foreground">Other residents will see this information. You can control visibility in privacy settings.</p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          {/* Avatar upload */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                <User className="w-10 h-10 text-muted-foreground" />
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[hsl(155,45%,32%)] text-white flex items-center justify-center shadow-md">
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <Card className="border-border/40 shadow-sm rounded-2xl mb-6">
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Full name *</label>
                <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl h-11" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Short introduction</label>
                <textarea placeholder="A brief intro about yourself..." value={bio} onChange={(e) => setBio(e.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(155,45%,32%)] focus:ring-offset-0" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Building / Tower</label>
                <div className="grid grid-cols-3 gap-2">
                  {buildings.map((b) => (
                    <button key={b} type="button" onClick={() => setBuilding(b)} className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${building === b ? "bg-[hsl(155,45%,32%)] text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{b}</button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="bg-[hsl(155,45%,92%)] rounded-xl p-4 flex items-start gap-3 mb-6">
            <Info className="w-5 h-5 text-[hsl(155,45%,32%)] shrink-0 mt-0.5" />
            <p className="text-xs text-[hsl(155,45%,32%)] leading-relaxed">Your profile is only visible to verified residents of your community. You control what's shown in privacy settings.</p>
          </div>
        </Reveal>

        <Reveal delay={0.25}>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-full h-12" asChild><Link to="/onboarding/verification"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Link></Button>
            <Button className="flex-1 bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full h-12" disabled={saving} onClick={handleContinue}>{saving ? "Saving..." : "Continue"} <ArrowRight className="w-4 h-4 ml-2" /></Button>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
