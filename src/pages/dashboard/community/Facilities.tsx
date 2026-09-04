import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Reveal } from "@/components/motion/Reveal";
import { Building2, Clock, MapPin, Ruler, Plus, Loader2 } from "lucide-react";
import { useCommunityFacilities, useCreateFacility } from "@/hooks/useActivityClubPostData";
import { useCommunity } from "@/contexts/CommunityContext";
import { useIsAdmin } from "@/hooks/useUserRole";
import { toast } from "sonner";

const fallbackFacilities = [
  { id: "1", name: "Clubhouse", location: "Ground floor, Tower A", hours: "6 AM – 10 PM", rules: "Booking required for events", capacity: "50 people" },
  { id: "2", name: "Badminton Courts (2)", location: "Tower A ground floor", hours: "6 AM – 9 PM", rules: "First come, first served", capacity: "8 players" },
  { id: "3", name: "Swimming Pool", location: "Behind Tower C", hours: "6 AM – 8 PM", rules: "Children must be accompanied", capacity: "30 people" },
  { id: "4", name: "Gym", location: "Tower B, lower ground", hours: "5 AM – 10 PM", rules: "Registration required", capacity: "20 people" },
  { id: "5", name: "Football Ground", location: "Main entrance area", hours: "6 AM – 8 PM", rules: "Activity booking required", capacity: "22 players" },
  { id: "6", name: "Children's Play Area", location: "Central garden", hours: "7 AM – 7 PM", rules: "Adult supervision required", capacity: "40 children" },
];

export default function Facilities() {
  const { communityId } = useCommunity();
  const { data: dbFacilities = [] } = useCommunityFacilities(communityId || "");
  const createFacility = useCreateFacility();
  const isAdmin = useIsAdmin();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [hours, setHours] = useState("");
  const [rules, setRules] = useState("");
  const facilities = dbFacilities.length > 0 ? dbFacilities : fallbackFacilities;

  const handleAdd = async () => {
    if (!name.trim()) { toast.error("Name is required"); return; }
    try {
      await createFacility.mutateAsync({ communityId: communityId || "", name, description: desc || undefined, type: "general", hours: hours || undefined, rules: rules || undefined });
      toast.success("Facility added!");
      setName(""); setDesc(""); setHours(""); setRules(""); setShowAdd(false);
    } catch { toast.error("Failed to add facility"); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground flex items-center gap-3"><Building2 className="w-6 h-6 text-[hsl(155,45%,32%)]" /> Facilities</h1>
          {isAdmin && <Button size="sm" className="bg-[hsl(155,45%,32%)] text-white rounded-full" onClick={() => setShowAdd(!showAdd)}><Plus className="w-4 h-4 mr-1" /> Add</Button>}
        </div>
      </Reveal>

      {showAdd && isAdmin && (
        <Reveal delay={0.05}>
          <Card className="mb-6 border-[hsl(155,45%,32%)]/30">
            <CardContent className="p-5 space-y-3">
              <Input placeholder="Facility name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
              <Input placeholder="Description (optional)" value={desc} onChange={(e) => setDesc(e.target.value)} className="rounded-xl" />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Hours (e.g. 6AM-9PM)" value={hours} onChange={(e) => setHours(e.target.value)} className="rounded-xl" />
                <Input placeholder="Rules (optional)" value={rules} onChange={(e) => setRules(e.target.value)} className="rounded-xl" />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button size="sm" className="bg-[hsl(155,45%,32%)] text-white" onClick={handleAdd} disabled={createFacility.isPending}>
                  {createFacility.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {facilities.map((f: any, i: number) => (
          <Reveal key={f._id || f.name} delay={i * 0.05}>
            <Card className="border-border/40 shadow-sm rounded-2xl hover:shadow-md transition-all">
              <CardContent className="p-5">
                <h3 className="font-[Bricolage_Grotesque] font-bold text-foreground text-sm mb-3">{f.name}</h3>
                <div className="space-y-2 text-xs text-muted-foreground">
                  {f.location && <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 shrink-0" />{f.location}</div>}
                  {f.hours && <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 shrink-0" />{f.hours}</div>}
                  {f.rules && <div className="flex items-center gap-2"><Ruler className="w-3.5 h-3.5 shrink-0" />{f.rules}</div>}
                </div>
                {f.capacity && <div className="mt-3 pt-3 border-t border-border/40"><span className="text-[10px] font-semibold text-muted-foreground">Capacity: {f.capacity}</span></div>}
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
