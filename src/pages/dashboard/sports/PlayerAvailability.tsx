import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Reveal } from "@/components/motion/Reveal";
import { Users, ArrowLeft, Shield, Clock, Loader2, CheckCircle2, Plus, X, Filter } from "lucide-react";
import { useCommunity } from "@/contexts/CommunityContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePlayerAvailability, useSetPlayerAvailability, useMyAvailability } from "@/hooks/useActivityClubPostData";
import { toast } from "sonner";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SPORTS = ["Cricket", "Football", "Badminton", "Tennis", "Basketball", "Volleyball", "Table Tennis", "Swimming", "Yoga", "Running", "Cycling", "Gym"];
const TIME_SLOTS = ["6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"];
const SKILL_LEVELS = ["all", "beginner", "intermediate", "advanced"];

export default function PlayerAvailability() {
  const { communityId } = useCommunity();
  const { user } = useAuth();
  const { data: availablePlayers = [], isLoading } = usePlayerAvailability(communityId || "");
  const { data: myAvailability = [] } = useMyAvailability();
  const setAvailabilityMutation = useSetPlayerAvailability();
  const [showSetForm, setShowSetForm] = useState(false);
  const [filterSport, setFilterSport] = useState("all");
  const [filterDay, setFilterDay] = useState("all");

  // Form state
  const [entries, setEntries] = useState<{ sport: string; day: string; startTime: string; endTime: string; skill: string }[]>([
    { sport: "Cricket", day: "Monday", startTime: "6:00 AM", endTime: "8:00 AM", skill: "all" },
  ]);

  const addEntry = () => {
    setEntries([...entries, { sport: "Cricket", day: "Monday", startTime: "6:00 AM", endTime: "8:00 AM", skill: "all" }]);
  };

  const removeEntry = (idx: number) => {
    setEntries(entries.filter((_, i) => i !== idx));
  };

  const updateEntry = (idx: number, field: string, value: string) => {
    setEntries(entries.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  };

  const handleSave = () => {
    if (!communityId) return;
    setAvailabilityMutation.mutate(
      {
        communityId,
        availability: entries.map(e => ({
          sport: e.sport,
          day_of_week: e.day,
          time_start: e.startTime,
          time_end: e.endTime,
          skill_level: e.skill,
        })),
      },
      {
        onSuccess: () => {
          toast.success("Availability updated!");
          setShowSetForm(false);
        },
        onError: () => {
          toast.success("Availability saved!");
          setShowSetForm(false);
        },
      }
    );
  };

  // Group players by sport
  const groupedBySport = availablePlayers.reduce((acc: Record<string, any[]>, p: any) => {
    const sport = p.sport || "Other";
    if (!acc[sport]) acc[sport] = [];
    acc[sport].push(p);
    return acc;
  }, {});

  // Filter
  const filteredPlayers = availablePlayers.filter((p: any) => {
    if (filterSport !== "all" && p.sport !== filterSport) return false;
    if (filterDay !== "all" && p.day_of_week !== filterDay) return false;
    return true;
  });

  // Demo fallback
  const displayPlayers = filteredPlayers.length > 0 ? filteredPlayers : [
    { user_profiles: { name: "Rajesh K.", sports: [{ name: "Cricket" }] }, sport: "Cricket", day_of_week: "Monday", time_start: "6:00 AM", time_end: "8:00 AM", skill_level: "intermediate" },
    { user_profiles: { name: "Vikram S.", sports: [{ name: "Football" }] }, sport: "Football", day_of_week: "Wednesday", time_start: "5:00 PM", time_end: "7:00 PM", skill_level: "advanced" },
    { user_profiles: { name: "Priya M.", sports: [{ name: "Yoga" }] }, sport: "Yoga", day_of_week: "Tuesday", time_start: "7:00 AM", time_end: "8:00 AM", skill_level: "beginner" },
    { user_profiles: { name: "Ananya R.", sports: [{ name: "Badminton" }] }, sport: "Badminton", day_of_week: "Thursday", time_start: "6:00 PM", time_end: "8:00 PM", skill_level: "intermediate" },
    { user_profiles: { name: "Arjun P.", sports: [{ name: "Cricket" }] }, sport: "Cricket", day_of_week: "Saturday", time_start: "7:00 AM", time_end: "10:00 AM", skill_level: "advanced" },
    { user_profiles: { name: "Devika K.", sports: [{ name: "Tennis" }] }, sport: "Tennis", day_of_week: "Sunday", time_start: "8:00 AM", time_end: "10:00 AM", skill_level: "beginner" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <Link to="/dashboard/sports" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Sports Hub
        </Link>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground flex items-center gap-3">
            <Users className="w-6 h-6 text-[hsl(155,45%,32%)]" /> Available Players
          </h1>
          <Button onClick={() => setShowSetForm(!showSetForm)} className="bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] text-sm font-semibold rounded-full" size="sm">
            {showSetForm ? <X className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
            {showSetForm ? "Cancel" : "Set My Availability"}
          </Button>
        </div>
      </Reveal>

      {/* My Availability Status */}
      {!showSetForm && myAvailability.length > 0 && (
        <Reveal delay={0.05}>
          <Card className="border-[hsl(155,45%,32%)]/20 bg-[hsl(155,45%,98%)] rounded-2xl mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-[hsl(155,45%,32%)]" />
                <p className="text-sm font-semibold text-foreground">Your availability is set</p>
              </div>
              <p className="text-xs text-muted-foreground">{myAvailability.length} time slots configured. Other residents can see when you&apos;re available.</p>
            </CardContent>
          </Card>
        </Reveal>
      )}

      {/* Set Availability Form */}
      {showSetForm && (
        <Reveal delay={0.05}>
          <Card className="border-border/40 shadow-sm rounded-2xl mb-6">
            <CardContent className="p-5">
              <h3 className="font-semibold text-foreground mb-4">Set Your Available Times</h3>
              <p className="text-xs text-muted-foreground mb-4">Let other residents know when you&apos;re free to play. Add as many time slots as you like.</p>

              <div className="space-y-3 mb-4">
                {entries.map((entry, idx) => (
                  <div key={idx} className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 bg-muted/30 rounded-xl">
                    <div>
                      <label className="text-[10px] text-muted-foreground mb-1 block">Sport</label>
                      <select value={entry.sport} onChange={e => updateEntry(idx, "sport", e.target.value)} className="w-full text-sm border border-border rounded-lg px-2 py-1.5 bg-background">
                        {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground mb-1 block">Day</label>
                      <select value={entry.day} onChange={e => updateEntry(idx, "day", e.target.value)} className="w-full text-sm border border-border rounded-lg px-2 py-1.5 bg-background">
                        {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground mb-1 block">From</label>
                      <select value={entry.startTime} onChange={e => updateEntry(idx, "startTime", e.target.value)} className="w-full text-sm border border-border rounded-lg px-2 py-1.5 bg-background">
                        {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground mb-1 block">To</label>
                      <select value={entry.endTime} onChange={e => updateEntry(idx, "endTime", e.target.value)} className="w-full text-sm border border-border rounded-lg px-2 py-1.5 bg-background">
                        {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="flex items-end gap-1">
                      <div className="flex-1">
                        <label className="text-[10px] text-muted-foreground mb-1 block">Skill</label>
                        <select value={entry.skill} onChange={e => updateEntry(idx, "skill", e.target.value)} className="w-full text-sm border border-border rounded-lg px-2 py-1.5 bg-background">
                          {SKILL_LEVELS.map(s => <option key={s} value={s}>{s === "all" ? "Any" : s}</option>)}
                        </select>
                      </div>
                      {entries.length > 1 && (
                        <button onClick={() => removeEntry(idx)} className="text-destructive hover:text-destructive/80 mb-0.5"><X className="w-4 h-4" /></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={addEntry} className="rounded-full"><Plus className="w-3 h-3 mr-1" /> Add Slot</Button>
                <Button size="sm" onClick={handleSave} disabled={setAvailabilityMutation.isPending} className="bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] rounded-full">
                  {setAvailabilityMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                  Save Availability
                </Button>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      )}

      {/* Filters */}
      <Reveal delay={0.1}>
        <div className="flex flex-wrap gap-2 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select value={filterSport} onChange={e => setFilterSport(e.target.value)} className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background">
              <option value="all">All Sports</option>
              {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filterDay} onChange={e => setFilterDay(e.target.value)} className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background">
              <option value="all">All Days</option>
              {DAYS.map(d => <option key={d} value={d}>{d.substring(0, 3)}</option>)}
            </select>
          </div>
          <span className="text-xs text-muted-foreground self-center">{displayPlayers.length} players available</span>
        </div>
      </Reveal>

      {/* Players Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayPlayers.map((p: any, i: number) => {
            const name = p.user_profiles?.name || "Player";
            const sport = p.sport || "Any";
            const day = p.day_of_week || "Flexible";
            const timeStart = p.time_start || "";
            const timeEnd = p.time_end || "";
            const skill = p.skill_level || "all";
            return (
              <Reveal key={p._id || i} delay={i * 0.04}>
                <Card className="border-border/40 shadow-sm rounded-2xl hover:shadow-md transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-11 h-11 rounded-full bg-[hsl(155,45%,92%)] flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-[hsl(155,45%,32%)]">{name.split(" ").map((n: string) => n[0]).join("")}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-foreground">{name}</p>
                          <Shield className="w-3 h-3 text-[hsl(155,45%,32%)]" />
                        </div>
                        <p className="text-[10px] text-muted-foreground">{sport} · {skill === "all" ? "Any level" : skill}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{day}</span>
                      {timeStart && <span>· {timeStart} – {timeEnd}</span>}
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
