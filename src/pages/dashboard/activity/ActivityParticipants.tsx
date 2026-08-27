import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import { Users, Shield, Loader2 } from "lucide-react";
import { useActivityParticipants } from "@/hooks/useActivityClubPostData";

export default function ActivityParticipants() {
  const { id } = useParams();
  const { data: participants = [], isLoading } = useActivityParticipants(id || "");

  const fallbackParticipants = [
    { user_profiles: { name: "Rajesh K.", interests: ["Badminton", "Cricket"] }, role: "host", verified: true },
    { user_profiles: { name: "Vikram S.", interests: ["Football", "Tennis"] }, role: "co-host", verified: true },
    { user_profiles: { name: "Priya M.", interests: ["Yoga", "Photography"] }, role: "participant", verified: true },
    { user_profiles: { name: "Ananya R.", interests: ["Art", "Cooking"] }, role: "participant", verified: true },
    { user_profiles: { name: "Devika K.", interests: ["Books", "Gardening"] }, role: "participant", verified: true },
    { user_profiles: { name: "Arjun P.", interests: ["Gaming", "Movies"] }, role: "participant", verified: false },
  ];

  const displayParticipants = participants.length > 0 ? participants : fallbackParticipants;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <h1 className="text-2xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground mb-6 flex items-center gap-3">
          <Users className="w-6 h-6 text-[hsl(155,45%,32%)]" /> Participants ({displayParticipants.length})
        </h1>
      </Reveal>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {displayParticipants.map((p: any, i: number) => {
            const name = p.user_profiles?.name || p.name || "Resident";
            const role = p.role || "Participant";
            const interests = p.user_profiles?.interests || p.interests || [];
            const verified = p.verified || false;
            return (
              <Reveal key={p.id || name} delay={i * 0.04}>
                <Card className="border-border/40 shadow-sm rounded-xl hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[hsl(155,45%,92%)] flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-[hsl(155,45%,32%)]">{name.split(" ").map((n: string) => n[0]).join("")}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-foreground">{name}</p>
                        {verified && <Shield className="w-3 h-3 text-[hsl(155,45%,32%)]" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground capitalize">{role}</p>
                      {interests.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {interests.slice(0, 3).map((int: string) => (
                            <span key={int} className="text-[9px] bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground">{int}</span>
                          ))}
                        </div>
                      )}
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
