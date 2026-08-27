import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/Reveal";
import { Trophy, Users, Zap, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useActivities, useUserSportsProfile } from "@/hooks/useActivityClubPostData";
import { useCommunity } from "@/contexts/CommunityContext";

export default function SportsHub() {
  const { communityId } = useCommunity();
  const { data: activities = [] } = useActivities(communityId || "");
  const { data: sportsProfile } = useUserSportsProfile();

  const mySports = sportsProfile?.sports || [];
  const sportsActivities = (activities as any[]).filter((a: any) => {
    const cat = (a.category || "").toLowerCase();
    return ["badminton", "football", "cricket", "tennis", "basketball", "yoga", "fitness", "sports"].some(s => cat.includes(s));
  });
  const availableGames = sportsActivities.slice(0, 4);
  const lookingForPlayers = sportsActivities.filter((a: any) => (a.title || "").toLowerCase().includes("looking") || (a.title || "").toLowerCase().includes("need")).slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <h1 className="text-2xl sm:text-3xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground mb-6 flex items-center gap-3"><Trophy className="w-7 h-7 text-[hsl(155,45%,32%)]" /> Sports Hub</h1>
      </Reveal>

      {mySports.length > 0 && (
        <Reveal delay={0.05}>
          <section className="mb-8">
            <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Star className="w-4 h-4 text-[hsl(155,45%,32%)]" /> My Sports</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mySports.map((s: string) => (<Card key={s} className="border-border/40 shadow-sm rounded-xl"><CardContent className="p-4"><p className="font-semibold text-sm text-foreground">{s}</p></CardContent></Card>))}
            </div>
          </section>
        </Reveal>
      )}

      <Reveal delay={0.1}>
        <section className="mb-8">
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Zap className="w-4 h-4 text-[hsl(38,65%,42%)]" /> Available Games</h2>
          <div className="space-y-3">
            {availableGames.length === 0 && <p className="text-muted-foreground text-sm">No upcoming games.</p>}
            {availableGames.map((g: any) => (
              <Link key={g.id} to={`/dashboard/activities/${g.id}`}>
                <Card className="border-border/40 shadow-sm rounded-xl hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div><p className="font-semibold text-sm text-foreground">{g.title}</p><p className="text-xs text-muted-foreground">{g.date} · {g.location || "Community"}</p></div>
                    <div className="text-right"><p className="text-lg font-bold text-[hsl(155,45%,32%)]">{(g.max_participants || 0) - (g.current_participants || 0)}</p><p className="text-[10px] text-muted-foreground">spots</p></div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.15}>
        <section className="mb-8">
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-[hsl(210,55%,42%)]" /> Looking for Players</h2>
          <div className="space-y-3">
            {lookingForPlayers.length === 0 && <p className="text-muted-foreground text-sm">No open requests.</p>}
            {lookingForPlayers.map((g: any) => (
              <Link key={g.id} to={`/dashboard/activities/${g.id}`}>
                <Card className="border-border/40 shadow-sm rounded-xl hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div><p className="font-semibold text-sm text-foreground">{g.title}</p><p className="text-xs text-muted-foreground">{g.date}</p></div>
                    <Button size="sm" className="h-7 text-xs font-semibold bg-[hsl(155,45%,32%)] text-white rounded-full">View</Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </Reveal>
    </div>
  );
}
