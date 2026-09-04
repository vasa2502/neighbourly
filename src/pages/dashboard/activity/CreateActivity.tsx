import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowRight, ArrowLeft, Dumbbell, Heart, Users, Star, Gamepad2, Baby, BookOpen, TreePine, UtensilsCrossed, Palette, Trophy, Zap } from "lucide-react";
import { useCommunity } from "@/contexts/CommunityContext";
import { useCreateActivity } from "@/hooks/useActivityClubPostData";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const categories = [
  { id: "sports", label: "Sports", icon: Trophy },
  { id: "fitness", label: "Fitness", icon: Dumbbell },
  { id: "walking", label: "Walking", icon: Heart },
  { id: "running", label: "Running", icon: Zap },
  { id: "social", label: "Social", icon: Users },
  { id: "hobby", label: "Hobby", icon: Star },
  { id: "games", label: "Games", icon: Gamepad2 },
  { id: "kids", label: "Kids", icon: Baby },
  { id: "family", label: "Family", icon: Heart },
  { id: "learning", label: "Learning", icon: BookOpen },
  { id: "food", label: "Food", icon: UtensilsCrossed },
  { id: "outdoor", label: "Outdoor", icon: TreePine },
];

const skillLevels = ["All levels", "Beginner", "Intermediate", "Advanced"];
const formats = ["Singles", "Doubles", "Team", "Individual", "Flexible"];

export default function CreateActivity() {
  const [step, setStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [form, setForm] = useState({ name: "", description: "", skill: "All levels", format: "Doubles", maxPlayers: "16", date: "", startTime: "", endTime: "", location: "Community Court A", price: "0" });
  const { communityId } = useCommunity();
  const { user } = useAuth();
  const createActivity = useCreateActivity();
  const navigate = useNavigate();

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground">Create Activity</h1>
          <span className="text-xs text-muted-foreground">Step {step + 1} of 4</span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-muted rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-[hsl(155,45%,32%)] rounded-full transition-all" style={{ width: `${((step + 1) / 4) * 100}%` }} />
        </div>
      </Reveal>

      {step === 0 && (
        <Reveal delay={0.05}>
          <h2 className="font-semibold text-foreground mb-4">Choose a category</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-8">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button key={cat.id} type="button" onClick={() => setSelectedCategory(cat.id)} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${selectedCategory === cat.id ? "border-[hsl(155,45%,32%)] bg-[hsl(155,45%,98%)]" : "border-border/40 bg-card hover:border-border"}`}>
                  <Icon className={`w-6 h-6 ${selectedCategory === cat.id ? "text-[hsl(155,45%,32%)]" : "text-muted-foreground"}`} />
                  <span className="text-xs font-medium">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </Reveal>
      )}

      {step === 1 && (
        <Reveal delay={0.05}>
          <h2 className="font-semibold text-foreground mb-4">Activity details</h2>
          <Card className="border-border/40 shadow-sm rounded-2xl mb-8">
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1.5"><label className="text-sm font-medium text-foreground">Activity name *</label><Input placeholder="e.g. Morning Badminton" value={form.name} onChange={(e) => update("name", e.target.value)} className="rounded-xl h-11" /></div>
              <div className="space-y-1.5"><label className="text-sm font-medium text-foreground">Description</label><textarea placeholder="Describe your activity..." value={form.description} onChange={(e) => update("description", e.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(155,45%,32%)]" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><label className="text-sm font-medium text-foreground">Skill level</label><select value={form.skill} onChange={(e) => update("skill", e.target.value)} className="w-full h-11 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(155,45%,32%)]">{skillLevels.map(l => <option key={l}>{l}</option>)}</select></div>
                <div className="space-y-1.5"><label className="text-sm font-medium text-foreground">Format</label><select value={form.format} onChange={(e) => update("format", e.target.value)} className="w-full h-11 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(155,45%,32%)]">{formats.map(f => <option key={f}>{f}</option>)}</select></div>
              </div>
              <div className="space-y-1.5"><label className="text-sm font-medium text-foreground">Max participants</label><Input type="number" value={form.maxPlayers} onChange={(e) => update("maxPlayers", e.target.value)} className="rounded-xl h-11" /></div>
            </CardContent>
          </Card>
        </Reveal>
      )}

      {step === 2 && (
        <Reveal delay={0.05}>
          <h2 className="font-semibold text-foreground mb-4">Date & time</h2>
          <Card className="border-border/40 shadow-sm rounded-2xl mb-8">
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1.5"><label className="text-sm font-medium text-foreground">Date *</label><Input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} className="rounded-xl h-11" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><label className="text-sm font-medium text-foreground">Start time *</label><Input type="time" value={form.startTime} onChange={(e) => update("startTime", e.target.value)} className="rounded-xl h-11" /></div>
                <div className="space-y-1.5"><label className="text-sm font-medium text-foreground">End time</label><Input type="time" value={form.endTime} onChange={(e) => update("endTime", e.target.value)} className="rounded-xl h-11" /></div>
              </div>
              <div className="space-y-1.5"><label className="text-sm font-medium text-foreground">Recurrence</label>
                <div className="flex gap-2">{["None", "Weekly", "Custom"].map(r => (<button key={r} type="button" className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${r === "None" ? "bg-[hsl(155,45%,32%)] text-white" : "bg-muted text-muted-foreground"}`}>{r}</button>))}</div>
              </div>
            </CardContent>
          </Card>
          <h2 className="font-semibold text-foreground mb-4">Location</h2>
          <Card className="border-border/40 shadow-sm rounded-2xl mb-8">
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1.5"><label className="text-sm font-medium text-foreground">Location name</label><Input placeholder="e.g. Community Court A" value={form.location} onChange={(e) => update("location", e.target.value)} className="rounded-xl h-11" /></div>
            </CardContent>
          </Card>
        </Reveal>
      )}

      {step === 3 && (
        <Reveal delay={0.05}>
          <h2 className="font-semibold text-foreground mb-4">Review & publish</h2>
          <Card className="border-border/40 shadow-sm rounded-2xl mb-8">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Category</span><span className="text-sm font-medium text-foreground capitalize">{selectedCategory || "Sports"}</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Name</span><span className="text-sm font-medium text-foreground">{form.name || "Morning Badminton"}</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Date</span><span className="text-sm font-medium text-foreground">{form.date || "Wed, Aug 27"}</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Time</span><span className="text-sm font-medium text-foreground">{form.startTime || "7:00 AM"}</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Location</span><span className="text-sm font-medium text-foreground">{form.location}</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Capacity</span><span className="text-sm font-medium text-foreground">{form.maxPlayers} participants</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Price</span><span className="text-sm font-medium text-foreground">{Number(form.price) === 0 ? "Free" : `$${form.price}`}</span></div>
            </CardContent>
          </Card>
        </Reveal>
      )}

      <div className="flex gap-3">
        {step > 0 && <Button variant="outline" className="rounded-full h-12" onClick={() => setStep(step - 1)}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>}
        <Button className="flex-1 bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full h-12" onClick={async () => {
          if (step < 3) { setStep(step + 1); return; }
          if (!communityId || !user) { toast.error("Please sign in to an active community"); return; }
          try {
            await createActivity.mutateAsync({
              communityId,
              hostId: user.id,
              title: form.name || "New Activity",
              category: selectedCategory || "social",
              description: form.description,
              location: form.location,
              date: form.date ? new Date(`${form.date}T${form.startTime || '09:00'}`).toISOString() : new Date().toISOString(),
              time: form.startTime || "09:00",
              maxParticipants: Number(form.maxPlayers) || 16,
              isFree: Number(form.price) === 0,
              price: Number(form.price) || 0,
            });
            toast.success("Activity created!");
            navigate("/dashboard/activities");
          } catch (err: any) {
            toast.error(err?.message || "Failed to create activity");
          }
        }}>
          {step < 3 ? "Continue" : "Publish Activity"} <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
// Publishing handled below
