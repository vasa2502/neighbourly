import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowLeft, Plus } from "lucide-react";
import { useCreateActivity } from "@/hooks/useActivityClubPostData";
import { useCommunity } from "@/contexts/CommunityContext";

const sports = ["Badminton", "Football", "Cricket", "Tennis", "Basketball"];
const skillLevels = ["Beginner", "Intermediate", "Advanced"];

export default function LookingForPlayers() {
  const [form, setForm] = useState({ sport: "", date: "", time: "", location: "", skill: "Intermediate", needed: "2", message: "" });
  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));
  const { communityId } = useCommunity();
  const createActivity = useCreateActivity();
  const navigate = useNavigate();

  const handlePost = async () => {
    if (!form.sport || !form.date || !communityId) return;
    await createActivity.mutateAsync({
      community_id: communityId,
      title: `Looking for ${form.sport} Players`,
      description: form.message || `Need ${form.needed} more players for ${form.sport}`,
      category: form.sport.toLowerCase(),
      date: `${form.date}T${form.time || "18:00"}:00`,
      location: form.location || "Community",
      max_participants: parseInt(form.needed) + 1,
      status: "active",
      host_id: "",
    } as any);
    navigate("/dashboard/sports");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <Link to="/dashboard/sports" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="w-4 h-4" /> Back</Link>
        <h1 className="text-2xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground mb-6">Looking for Players</h1>
      </Reveal>

      <Reveal delay={0.05}>
        <Card className="border-border/40 shadow-sm rounded-2xl">
          <CardContent className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Sport *</label>
              <div className="flex flex-wrap gap-2">{sports.map(s => <button key={s} type="button" onClick={() => update("sport", s)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${form.sport === s ? "bg-[hsl(155,45%,32%)] text-white" : "bg-muted text-muted-foreground"}`}>{s}</button>)}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><label className="text-sm font-medium text-foreground">Date *</label><Input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} className="rounded-xl h-11" /></div>
              <div className="space-y-1.5"><label className="text-sm font-medium text-foreground">Time *</label><Input type="time" value={form.time} onChange={(e) => update("time", e.target.value)} className="rounded-xl h-11" /></div>
            </div>
            <div className="space-y-1.5"><label className="text-sm font-medium text-foreground">Location</label><Input placeholder="e.g. Community Court A" value={form.location} onChange={(e) => update("location", e.target.value)} className="rounded-xl h-11" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><label className="text-sm font-medium text-foreground">Skill level</label><select value={form.skill} onChange={(e) => update("skill", e.target.value)} className="w-full h-11 rounded-xl border border-border bg-background px-3 text-sm">{skillLevels.map(l => <option key={l}>{l}</option>)}</select></div>
              <div className="space-y-1.5"><label className="text-sm font-medium text-foreground">Players needed</label><Input type="number" value={form.needed} onChange={(e) => update("needed", e.target.value)} className="rounded-xl h-11" /></div>
            </div>
            <div className="space-y-1.5"><label className="text-sm font-medium text-foreground">Message (optional)</label><textarea placeholder="Any additional info..." value={form.message} onChange={(e) => update("message", e.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(155,45%,32%)]" /></div>
          </CardContent>
        </Card>
      </Reveal>

      <Reveal delay={0.1}>
        <Button
          className="w-full mt-6 bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full h-12"
          onClick={handlePost}
          disabled={!form.sport || !form.date || createActivity.isPending}
        >
          {createActivity.isPending ? "Posting..." : <><Plus className="w-4 h-4 mr-2" /> Post Request</>}
        </Button>
      </Reveal>
    </div>
  );
}
