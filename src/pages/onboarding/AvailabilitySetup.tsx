import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useUpdateProfile } from "@/hooks/useCommunityData";
import { toast } from "sonner";

const steps = ["Account", "Verification", "Profile", "Interests", "Community"];
const timeslots = [
  { id: "morning", label: "Morning", desc: "6 AM – 12 PM", icon: "🌅" },
  { id: "afternoon", label: "Afternoon", desc: "12 PM – 5 PM", icon: "☀️" },
  { id: "evening", label: "Evening", desc: "5 PM – 9 PM", icon: "🌆" },
  { id: "night", label: "Night", desc: "9 PM – 12 AM", icon: "🌙" },
];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function OnboardingAvailability() {
  const [selectedTimes, setSelectedTimes] = useState<Set<string>>(new Set(["morning", "evening"]));
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set(days));
  const navigate = useNavigate();
  const updateProfile = useUpdateProfile();

  const toggleSet = (set: Set<string>, id: string) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  };

  const handleContinue = async () => {
    try {
      await updateProfile.mutateAsync({
        availability: { times: Array.from(selectedTimes), days: Array.from(selectedDays) },
      });
      navigate("/onboarding/privacy");
    } catch {
      toast.error("Failed to save availability");
      navigate("/onboarding/privacy");
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
            <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground mb-2">When are you available?</h1>
            <p className="text-sm text-muted-foreground">Help us recommend activities at times that work for you.</p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mb-6">
            <p className="text-sm font-semibold text-foreground mb-3">Time of day</p>
            <div className="grid grid-cols-2 gap-3">
              {timeslots.map((t) => {
                const active = selectedTimes.has(t.id);
                return (
                  <button key={t.id} type="button" onClick={() => setSelectedTimes(prev => toggleSet(prev, t.id))} className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${active ? "border-[hsl(155,45%,32%)] bg-[hsl(155,45%,98%)]" : "border-border/40 bg-card hover:border-border"}`}>
                    <span className="text-xl">{t.icon}</span>
                    <div>
                      <p className={`text-sm font-semibold ${active ? "text-[hsl(155,45%,32%)]" : "text-foreground"}`}>{t.label}</p>
                      <p className="text-[10px] text-muted-foreground">{t.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mb-8">
            <p className="text-sm font-semibold text-foreground mb-3">Days of the week</p>
            <div className="flex gap-2">
              {days.map((d) => {
                const active = selectedDays.has(d);
                return (
                  <button key={d} type="button" onClick={() => setSelectedDays(prev => toggleSet(prev, d))} className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-colors ${active ? "bg-[hsl(155,45%,32%)] text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{d}</button>
                );
              })}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-full h-12" onClick={() => navigate("/onboarding/sports")}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
            <Button className="flex-1 bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full h-12" onClick={handleContinue} disabled={updateProfile.isPending}>Continue <ArrowRight className="w-4 h-4 ml-2" /></Button>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
