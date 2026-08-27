import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import { Shield, Crown, Star } from "lucide-react";
import { useClubMembers } from "@/hooks/useActivityClubPostData";

const roleIcons: Record<string, typeof Crown> = { admin: Crown, moderator: Star };
const roleColors: Record<string, string> = { admin: "text-[hsl(45,65%,42%)]", moderator: "text-[hsl(210,55%,42%)]" };

export default function ClubMembers() {
  const { id } = useParams();
  const { data: members = [] } = useClubMembers(id || "");

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <h1 className="text-2xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground mb-6">Club Members ({members.length})</h1>
      </Reveal>
      <div className="space-y-2">
        {members.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No members yet.</p>}
        {members.map((m: any, i: number) => {
          const role = m.role || "member";
          const RoleIcon = roleIcons[role] || Shield;
          const interests = m.user_profiles?.interests || [];
          const sports = m.user_profiles?.sports || [];
          const allInterests = [...(Array.isArray(interests) ? interests : []), ...(Array.isArray(sports) ? sports : [])];
          return (
            <Reveal key={m.id || i} delay={i * 0.03}>
              <Card className="border-border/40 shadow-sm rounded-xl">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[hsl(155,45%,92%)] flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-[hsl(155,45%,32%)]">{(m.user_profiles?.name || "?").split(" ").map((n: string) => n[0]).join("")}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-foreground">{m.user_profiles?.name || "Member"}</p>
                      {role !== "member" && <RoleIcon className={`w-3.5 h-3.5 ${roleColors[role] || ""}`} />}
                    </div>
                    {allInterests.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">{allInterests.slice(0, 4).map((int: string) => <span key={int} className="text-[9px] bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground">{int}</span>)}</div>
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground capitalize">{role}</span>
                </CardContent>
              </Card>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
