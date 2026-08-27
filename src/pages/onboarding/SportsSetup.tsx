import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowRight, ArrowLeft, Trophy } from "lucide-react";
import { useUpdateProfile } from "@/hooks/useCommunityData";
import { toast } from "sonner";

const steps = ["Account", "Verification", "Profile", "Interests", "Community"];
const sportsList = [
  { id: "badminton", label: "Badminton", formats: ["Singles", "Doubles"] },
  { id: "football", label: "Football", formats: ["5v5", "7v7", "11v11"] },
  { id: "cricket", label: "Cricket", formats: ["T20", "ODI", "Test"] },
  { id: "tennis", label: "Tennis", formats: ["Singles", "Doubles"] },
  { id: "basketball", label: "Basketball", formats: ["3v3", "5v5"] },
  { id: "volleyball", label: "Volleyball", formats: ["Indoor", "Beach"] },
  { id: "swimming", label: "Swimming", formats: ["Freestyle", "Relay"] },
  { id: "yoga", label: "Yoga", formats: ["Hatha", "Vinyasa", "Power"] },
];
const skillLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];

export default function OnboardingSports() {
  const [selectedSports, setSelectedSports] = useState<Record<string, { skill: string; format: string }>>({});
  const navigate = useNavigate();
  const updateProfile = useUpdateProfile();

  const toggle = (id: string) => {
    setSelectedSports(prev => {
      const next = { ...prev };
      if (next[id]) delete next[id]; else next[id] = { skill: "Intermediate", format: "" };
      return next;
    });
  };

  const updateSport = (id: string, field: string, value: string) => {
    setSelectedSports(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const handleContinue = async () => {
    const sportsArray = Object.entries(selectedSports).map(([name, s]) => ({ name, ...s }));
    try {
      await updateProfile.mutateAsync({ sports: sportsArray });
      navigate("/onboarding/availability");
    } catch {
      toast.error("Failed to save sports");
      navigate("/onboarding/availability");
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
            <h1 className="text-2xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground mb-2">Sports & Activities</h1>
            <p className="text-sm text-muted-foreground">Select sports you play or want to participate in. This is optional.</p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="space-y-3 mb-8">
            {sportsList.map((sport) => {
              const active = !!selectedSports[sport.id];
              return (
                <div key={sport.id} className="space-y-2">
                  <button type="button" onClick={() => toggle(sport.id)} className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${active ? "border-[hsl(155,45%,32%)] bg-[hsl(155,45%,98%)]" : "border-border/40 bg-card hover:border-border"}`}>
                    <Trophy className={`w-5 h-5 ${active ? "text-[hsl(155,45%,32%)]" : "text-muted-foreground"}`} />
                    <span className="font-semibold text-sm text-foreground">{sport.label}</span>
                    {active && <span className="ml-auto text-[10px] font-bold text-[hsl(155,45%,32%)] bg-[hsl(155,45%,92%)] px-2 py-0.5 rounded-full">Selected</span>}
                  </button>
                  {active && selectedSports[sport.id] && (
                    <div className="flex gap-2 px-2">
                      <select value={selectedSports[sport.id].skill} onChange={(e) => updateSport(sport.id, "skill", e.target.value)} className="flex-1 h-9 rounded-lg border border-border bg-background text-xs px-3 focus:outline-none focus:ring-2 focus:ring-[hsl(155,45%,32%)]">
                        {skillLevels.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                      <select value={selectedSports[sport.id].format} onChange={(e) => updateSport(sport.id, "format", e.target.value)} className="flex-1 h-9 rounded-lg border border-border bg-background text-xs px-3 focus:outline-none focus:ring-2 focus:ring-[hsl(155,45%,32%)]">
                        <option value="">Format</option>
                        {sport.formats.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-full h-12" onClick={() => navigate("/onboarding/interests")}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
            <Button className="flex-1 bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full h-12" onClick={handleContinue} disabled={updateProfile.isPending}>Continue <ArrowRight className="w-4 h-4 ml-2" /></Button>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
