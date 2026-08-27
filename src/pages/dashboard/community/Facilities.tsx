import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import { Building2, Clock, MapPin, Ruler } from "lucide-react";
import { useCommunityFacilities } from "@/hooks/useActivityClubPostData";
import { useCommunity } from "@/contexts/CommunityContext";

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
  const facilities = dbFacilities.length > 0 ? dbFacilities : fallbackFacilities;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <h1 className="text-2xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground mb-6 flex items-center gap-3"><Building2 className="w-6 h-6 text-[hsl(155,45%,32%)]" /> Facilities</h1>
      </Reveal>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {facilities.map((f: any, i: number) => (
          <Reveal key={f.id || f.name} delay={i * 0.05}>
            <Card className="border-border/40 shadow-sm rounded-2xl hover:shadow-md transition-all">
              <CardContent className="p-5">
                <h3 className="font-[Plus_Jakarta_Sans] font-bold text-foreground text-sm mb-3">{f.name}</h3>
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
