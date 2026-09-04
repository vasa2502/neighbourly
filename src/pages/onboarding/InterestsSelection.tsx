import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowRight, ArrowLeft, Trophy, Dumbbell, Camera, BookOpen, Gamepad2, Dog, Baby, UtensilsCrossed, TreePine, Palette, GraduationCap, Heart, Sparkles } from "lucide-react";
import { useUpdateProfile } from "@/hooks/useCommunityData";
import { toast } from "sonner";

const steps = ["Account", "Verification", "Profile", "Interests", "Community"];

const interests = [
  { id: "sports", label: "Sports", icon: Trophy, color: "bg-[hsl(155,45%,92%)] text-[hsl(155,45%,32%)]" },
  { id: "fitness", label: "Fitness", icon: Dumbbell, color: "bg-[hsl(38,50%,92%)] text-[hsl(38,65%,42%)]" },
  { id: "hobbies", label: "Hobbies", icon: Sparkles, color: "bg-[hsl(280,40%,92%)] text-[hsl(280,50%,42%)]" },
  { id: "books", label: "Books", icon: BookOpen, color: "bg-[hsl(210,40%,92%)] text-[hsl(210,55%,42%)]" },
  { id: "photography", label: "Photography", icon: Camera, color: "bg-[hsl(340,40%,94%)] text-[hsl(340,45%,45%)]" },
  { id: "pets", label: "Pets", icon: Dog, color: "bg-[hsl(45,50%,92%)] text-[hsl(45,65%,42%)]" },
  { id: "kids", label: "Kids / Family", icon: Baby, color: "bg-[hsl(170,40%,92%)] text-[hsl(170,50%,38%)]" },
  { id: "games", label: "Games", icon: Gamepad2, color: "bg-[hsl(300,40%,92%)] text-[hsl(300,50%,42%)]" },
  { id: "food", label: "Food", icon: UtensilsCrossed, color: "bg-[hsl(10,50%,92%)] text-[hsl(10,55%,45%)]" },
  { id: "learning", label: "Learning", icon: GraduationCap, color: "bg-[hsl(240,40%,92%)] text-[hsl(240,50%,42%)]" },
  { id: "outdoor", label: "Outdoor", icon: TreePine, color: "bg-[hsl(80,40%,90%)] text-[hsl(80,45%,35%)]" },
  { id: "art", label: "Art & Craft", icon: Palette, color: "bg-[hsl(350,40%,93%)] text-[hsl(350,50%,45%)]" },
];

export default function OnboardingInterests() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const updateProfile = useUpdateProfile();

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleContinue = async () => {
    try {
      await updateProfile.mutateAsync({ interests: Array.from(selected) });
      navigate("/onboarding/sports");
    } catch {
      toast.error("Failed to save interests");
      navigate("/onboarding/sports");
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
                  <div className={`w-7 h-7 rounded-full text-[10px] font-bold flex items-center justify-center ${i === 3 ? "bg-[hsl(155,45%,32%)] text-white" : i < 3 ? "bg-[hsl(155,45%,32%)]/20 text-[hsl(155,45%,32%)]" : "bg-muted text-muted-foreground"}`}>{i < 3 ? "✓" : i + 1}</div>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider hidden sm:inline ${i === 3 ? "text-[hsl(155,45%,32%)]" : "text-muted-foreground"}`}>{s}</span>
                  {i < steps.length - 1 && <div className="w-6 h-px bg-border" />}
                </div>
              ))}
            </div>
            <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground mb-2">What are you interested in?</h1>
            <p className="text-sm text-muted-foreground">Select at least 3 interests. This helps us recommend activities and clubs for you.</p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {interests.map((interest) => {
              const Icon = interest.icon;
              const active = selected.has(interest.id);
              return (
                <button key={interest.id} type="button" onClick={() => toggle(interest.id)} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${active ? "border-[hsl(155,45%,32%)] bg-[hsl(155,45%,98%)]" : "border-border/40 bg-card hover:border-border"}`}>
                  <div className={`w-12 h-12 rounded-xl ${interest.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-xs font-semibold ${active ? "text-[hsl(155,45%,32%)]" : "text-foreground"}`}>{interest.label}</span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="text-center text-xs text-muted-foreground mb-4">{selected.size} of {interests.length} selected</p>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-full h-12" onClick={() => navigate("/onboarding/profile")}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
            <Button className="flex-1 bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full h-12" onClick={handleContinue} disabled={updateProfile.isPending}>Continue <ArrowRight className="w-4 h-4 ml-2" /></Button>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
